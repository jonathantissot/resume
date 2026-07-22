# _envcommon/common.hcl
# Shared input values consumed by the root terragrunt.hcl and every stack.
# Override any value per-environment by layering another common.hcl deeper
# in the directory tree.

locals {
  project     = "personal-blog"
  environment = "prod"
  aws_region  = "us-east-1"

  # Networking
  vpc_cidr         = "10.0.0.0/16"
  public_subnets   = ["10.0.101.0/24", "10.0.102.0/24", "10.0.103.0/24"]
  private_subnets  = ["10.0.1.0/24", "10.0.2.0/24", "10.0.3.0/24"]
  availability_zones = ["us-east-1a", "us-east-1b", "us-east-1c"]
  enable_nat_gateway = true

  # Database
  db_engine          = "aurora-postgresql"
  db_engine_version  = "15.7"
  db_instance_class  = "db.r6g.large"
  db_allocated_storage = 50
  db_multi_az        = true
  db_backup_retention = 7
  db_name            = "blogposts"

  # EKS
  eks_cluster_version = "1.30"
  eks_node_instance_types = ["m6g.large"]
  eks_worker_min      = 0
  eks_worker_max      = 5
  eks_worker_desired  = 2

  # API Gateway
  api_stage                  = "v1"
  api_throttle_rate_limit    = 10000
  api_throttle_burst_limit   = 20000

  # S3
  posts_bucket_prefix = "blog-content-posts"
  logs_bucket_prefix  = "blog-access-logs"
  temp_bucket_prefix  = "blog-temp-uploads"

  # Lambda
  lambda_image_processor_timeout = 30

  # Monitoring
  logs_retention_days = 30
  cloudwatch_dashboards = ["api-overview", "posts-engagement", "errors"]

  # SNS / SES
  notification_email = "jt@jonathantissot.dev"
}
