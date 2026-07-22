################################################################################
# terraform-modules/monitoring/main.tf
# CloudWatch log groups, dashboards, metric alarms, SNS alert topic.
################################################################################

# ── SNS alert topic ───────────────────────────────────────────────────────────
resource "aws_sns_topic" "alerts" {
  name = "${var.project}-${var.environment}-alerts"
}

resource "aws_sns_topic_subscription" "alert_email" {
  topic_arn = aws_sns_topic.alerts.arn
  protocol  = "email"
  endpoint  = var.notification_email
}

# ── CloudWatch Log Groups ─────────────────────────────────────────────────────
locals {
  log_group_names = [
    "/aws/eks/${var.eks_cluster_name}/cluster",
    "/aws/lambda/${var.project}-${var.environment}-image-processor",
    "/aws/apigateway/${var.project}-${var.environment}",
    "/${var.project}/${var.environment}/application",
  ]
}

resource "aws_cloudwatch_log_group" "app_logs" {
  for_each          = toset(local.log_group_names)
  name              = each.key
  retention_in_days = var.logs_retention_days
}

# ── CloudWatch Dashboards ─────────────────────────────────────────────────────
resource "aws_cloudwatch_dashboard" "api_overview" {
  dashboard_name = "${var.project}-${var.environment}-api-overview"

  dashboard_body = jsonencode({
    widgets = [
      {
        type       = "metric"
        properties = {
          title  = "API Gateway Requests"
          period = 300
          metrics = [
            ["AWS/ApiGateway", "Count", { stat = "Sum" }],
            ["AWS/ApiGateway", "5XXError", { stat = "Sum" }],
            ["AWS/ApiGateway", "4XXError", { stat = "Sum" }],
          ]
        }
      },
      {
        type       = "metric"
        properties = {
          title  = "API Gateway Latency"
          period = 300
          metrics = [
            ["AWS/ApiGateway", "Latency", { stat = "p99" }],
            ["AWS/ApiGateway", "IntegrationLatency", { stat = "p99" }],
          ]
        }
      }
    ]
  })
}

resource "aws_cloudwatch_dashboard" "posts_engagement" {
  dashboard_name = "${var.project}-${var.environment}-posts-engagement"

  dashboard_body = jsonencode({
    widgets = [
      {
        type       = "metric"
        properties = {
          title  = "S3 Requests — Posts Bucket"
          period = 3600
          metrics = [
            ["AWS/S3", "AllRequests", "BucketName", var.posts_bucket_id, { stat = "Sum" }],
          ]
        }
      },
      {
        type       = "metric"
        properties = {
          title  = "Image Processor Lambda Invocations"
          period = 300
          metrics = [
            ["AWS/Lambda", "Invocations", "FunctionName", var.lambda_image_processor_name, { stat = "Sum" }],
            ["AWS/Lambda", "Errors",      "FunctionName", var.lambda_image_processor_name, { stat = "Sum" }],
            ["AWS/Lambda", "Duration",    "FunctionName", var.lambda_image_processor_name, { stat = "p99" }],
          ]
        }
      }
    ]
  })
}

resource "aws_cloudwatch_dashboard" "errors" {
  dashboard_name = "${var.project}-${var.environment}-errors"

  dashboard_body = jsonencode({
    widgets = [
      {
        type       = "metric"
        properties = {
          title  = "Aurora DB CPU"
          period = 300
          metrics = [
            ["AWS/RDS", "CPUUtilization", "DBClusterIdentifier", var.aurora_cluster_id, { stat = "Average" }],
          ]
        }
      },
      {
        type       = "metric"
        properties = {
          title  = "SQS DLQ Depth"
          period = 300
          metrics = [
            ["AWS/SQS", "ApproximateNumberOfMessagesVisible", "QueueName", basename(var.sqs_job_queue_url), { stat = "Maximum" }],
          ]
        }
      }
    ]
  })
}

# ── CloudWatch Alarms ─────────────────────────────────────────────────────────
resource "aws_cloudwatch_metric_alarm" "api_5xx_errors" {
  alarm_name          = "${var.project}-${var.environment}-api-5xx-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "5XXError"
  namespace           = "AWS/ApiGateway"
  period              = 300
  statistic           = "Sum"
  threshold           = 10
  alarm_description   = "API Gateway is returning elevated 5XX errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]
  ok_actions          = [aws_sns_topic.alerts.arn]
}

resource "aws_cloudwatch_metric_alarm" "aurora_cpu_high" {
  alarm_name          = "${var.project}-${var.environment}-aurora-cpu-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 3
  metric_name         = "CPUUtilization"
  namespace           = "AWS/RDS"
  period              = 300
  statistic           = "Average"
  threshold           = 80
  alarm_description   = "Aurora cluster CPU utilisation above 80%"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    DBClusterIdentifier = var.aurora_cluster_id
  }
}

resource "aws_cloudwatch_metric_alarm" "lambda_errors" {
  alarm_name          = "${var.project}-${var.environment}-lambda-errors-high"
  comparison_operator = "GreaterThanThreshold"
  evaluation_periods  = 2
  metric_name         = "Errors"
  namespace           = "AWS/Lambda"
  period              = 300
  statistic           = "Sum"
  threshold           = 5
  alarm_description   = "Image processor Lambda returning errors"
  alarm_actions       = [aws_sns_topic.alerts.arn]

  dimensions = {
    FunctionName = var.lambda_image_processor_name
  }
}
