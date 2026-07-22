################################################################################
# terraform-modules/s3-lambda/main.tf
# S3 buckets (content, logs, temp), Lambda for image processing,
# SQS job queue, SNS notification topics, EventBridge rules, and SES identity.
################################################################################

data "aws_caller_identity" "current" {}
data "aws_region" "current" {}

# ── S3 Buckets ────────────────────────────────────────────────────────────────
resource "aws_s3_bucket" "posts" {
  bucket = "${var.posts_bucket_prefix}-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name    = "${var.project}-posts"
    Purpose = "content-storage"
  }
}

resource "aws_s3_bucket_versioning" "posts" {
  bucket = aws_s3_bucket.posts.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "posts" {
  bucket = aws_s3_bucket.posts.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm = "AES256"
    }
  }
}

resource "aws_s3_bucket_public_access_block" "posts" {
  bucket                  = aws_s3_bucket.posts.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket" "logs" {
  bucket = "${var.logs_bucket_prefix}-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name    = "${var.project}-logs"
    Purpose = "access-logs"
  }
}

resource "aws_s3_bucket" "temp" {
  bucket = "${var.temp_bucket_prefix}-${var.environment}-${data.aws_caller_identity.current.account_id}"

  tags = {
    Name    = "${var.project}-temp"
    Purpose = "temp-uploads"
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "temp" {
  bucket = aws_s3_bucket.temp.id

  rule {
    id     = "expire-temp-objects"
    status = "Enabled"
    filter { prefix = "" }
    expiration {
      days = 1
    }
  }
}

# ── IAM — Lambda execution role ───────────────────────────────────────────────
resource "aws_iam_role" "lambda_image_processor" {
  name = "${var.project}-${var.environment}-lambda-image-processor"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect    = "Allow"
      Action    = "sts:AssumeRole"
      Principal = { Service = "lambda.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy" "lambda_image_processor" {
  name = "image-processor-policy"
  role = aws_iam_role.lambda_image_processor.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect   = "Allow"
        Action   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
        Resource = [
          "${aws_s3_bucket.posts.arn}/*",
          "${aws_s3_bucket.temp.arn}/*",
        ]
      },
      {
        Effect   = "Allow"
        Action   = ["logs:CreateLogGroup", "logs:CreateLogStream", "logs:PutLogEvents"]
        Resource = "arn:aws:logs:*:*:*"
      },
      {
        Effect   = "Allow"
        Action   = ["ec2:CreateNetworkInterface", "ec2:DescribeNetworkInterfaces", "ec2:DeleteNetworkInterface"]
        Resource = "*"
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "lambda_vpc_access" {
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole"
  role       = aws_iam_role.lambda_image_processor.name
}

# ── Lambda — Image Processor ──────────────────────────────────────────────────
# The actual function ZIP is deployed separately by CI; this just provisions
# the function configuration, VPC placement, and environment.
resource "aws_lambda_function" "image_processor" {
  function_name = "${var.project}-${var.environment}-image-processor"
  description   = "Resize and optimize uploaded images; generate thumbnails"
  role          = aws_iam_role.lambda_image_processor.arn
  package_type  = "Zip"

  # Placeholder — replaced by CI with real artifact
  filename      = "${path.module}/placeholder.zip"
  handler       = "index.handler"
  runtime       = "nodejs20.x"
  timeout       = var.lambda_image_processor_timeout
  memory_size   = 512

  vpc_config {
    subnet_ids         = var.subnet_ids
    security_group_ids = [var.lambda_security_group_id]
  }

  environment {
    variables = {
      POSTS_BUCKET = aws_s3_bucket.posts.id
      TEMP_BUCKET  = aws_s3_bucket.temp.id
      NODE_ENV     = var.environment
    }
  }

  lifecycle {
    ignore_changes = [filename, source_code_hash]
  }

  tags = {
    Name = "${var.project}-${var.environment}-image-processor"
  }
}

resource "aws_lambda_event_source_mapping" "image_processor_sqs" {
  event_source_arn = aws_sqs_queue.job_queue.arn
  function_name    = aws_lambda_function.image_processor.arn
  batch_size       = 5
}

# ── SQS Job Queue ─────────────────────────────────────────────────────────────
resource "aws_sqs_queue" "job_queue_dlq" {
  name                       = "${var.project}-${var.environment}-job-queue-dlq"
  message_retention_seconds  = 1209600  # 14 days
}

resource "aws_sqs_queue" "job_queue" {
  name                       = "${var.project}-${var.environment}-job-queue"
  visibility_timeout_seconds = 60
  message_retention_seconds  = 86400
  receive_wait_time_seconds  = 20

  redrive_policy = jsonencode({
    deadLetterTargetArn = aws_sqs_queue.job_queue_dlq.arn
    maxReceiveCount     = 3
  })
}

# ── SNS Notification Topics ───────────────────────────────────────────────────
resource "aws_sns_topic" "notifications" {
  name = "${var.project}-${var.environment}-notifications"
}

resource "aws_sns_topic_subscription" "email_fallback" {
  topic_arn = aws_sns_topic.notifications.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

# ── EventBridge Rules ─────────────────────────────────────────────────────────
resource "aws_cloudwatch_event_rule" "comment_created" {
  name           = "${var.project}-${var.environment}-comment-created"
  description    = "Trigger notification Lambda on new comments"
  event_bus_name = var.eventbridge_bus_name

  event_pattern = jsonencode({
    source      = ["blog.platform"]
    detail-type = ["CommentCreated"]
  })
}

resource "aws_cloudwatch_event_target" "comment_notify" {
  rule           = aws_cloudwatch_event_rule.comment_created.name
  event_bus_name = var.eventbridge_bus_name
  target_id      = "sns-notification"
  arn            = aws_sns_topic.notifications.arn
}

resource "aws_cloudwatch_event_rule" "post_liked" {
  name           = "${var.project}-${var.environment}-post-liked"
  description    = "Trigger notification on post like"
  event_bus_name = var.eventbridge_bus_name

  event_pattern = jsonencode({
    source      = ["blog.platform"]
    detail-type = ["PostLiked"]
  })
}

resource "aws_cloudwatch_event_target" "post_liked_notify" {
  rule           = aws_cloudwatch_event_rule.post_liked.name
  event_bus_name = var.eventbridge_bus_name
  target_id      = "sns-post-liked"
  arn            = aws_sns_topic.notifications.arn
}

# Placeholder ZIP (empty) so terraform validate passes without a real artifact
resource "local_file" "placeholder_zip_marker" {
  content  = ""
  filename = "${path.module}/placeholder.zip.marker"
  lifecycle {
    ignore_changes = all
  }
}
