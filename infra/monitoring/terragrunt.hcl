# infra/monitoring/terragrunt.hcl
# Stack 6 — Observability: CloudWatch log groups, dashboards, alarms, and
#            SNS alert topics.
# Depends on: all upstream stacks (reads their IDs for targeted alarms).

include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("_envcommon/common.hcl"))
}

terraform {
  source = "../../terraform-modules/monitoring"
}

dependency "networking" {
  config_path = "../aws-shared"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    vpc_id = "vpc-00000000"
  }
}

dependency "database" {
  config_path = "../database"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    aurora_cluster_id = "mock-cluster"
    aurora_reader_endpoint = "mock.reader.us-east-1.rds.amazonaws.com"
  }
}

dependency "eks" {
  config_path = "../eks-cluster"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    cluster_name = "mock-cluster"
    node_group_name = "worker-pool"
  }
}

dependency "data_services" {
  config_path = "../data-services"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    posts_bucket_id  = "mock-posts-bucket"
    lambda_image_processor_name = "mock-image-processor"
    sqs_job_queue_url = "https://sqs.us-east-1.amazonaws.com/123456789012/mock"
  }
}

inputs = {
  project     = local.common.locals.project
  environment = local.common.locals.environment
  aws_region  = local.common.locals.aws_region

  logs_retention_days   = local.common.locals.logs_retention_days
  cloudwatch_dashboards = local.common.locals.cloudwatch_dashboards
  notification_email    = local.common.locals.notification_email

  aurora_cluster_id           = dependency.database.outputs.aurora_cluster_id
  aurora_reader_endpoint      = dependency.database.outputs.aurora_reader_endpoint
  eks_cluster_name            = dependency.eks.outputs.cluster_name
  eks_node_group_name         = dependency.eks.outputs.node_group_name
  posts_bucket_id             = dependency.data_services.outputs.posts_bucket_id
  lambda_image_processor_name = dependency.data_services.outputs.lambda_image_processor_name
  sqs_job_queue_url           = dependency.data_services.outputs.sqs_job_queue_url
}
