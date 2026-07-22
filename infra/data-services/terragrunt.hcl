# infra/data-services/terragrunt.hcl
# Stack 5 — Data services: S3 buckets, Lambda functions, SQS queues, SNS topics,
#            EventBridge rules, and SES configuration for notifications.
# Depends on: aws-shared (VPC lambda placement), api-services (EventBridge bus ARN).

include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("_envcommon/common.hcl"))
}

terraform {
  source = "../../terraform-modules/s3-lambda"
}

dependency "networking" {
  config_path = "../aws-shared"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    vpc_id              = "vpc-00000000"
    private_subnet_ids  = ["subnet-00000000", "subnet-11111111", "subnet-22222222"]
    lambda_security_group_id = "sg-00000000"
  }
}

dependency "api_services" {
  config_path = "../api-services"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    eventbridge_bus_arn  = "arn:aws:events:us-east-1:123456789012:event-bus/mock"
    eventbridge_bus_name = "mock-bus"
  }
}

inputs = {
  project     = local.common.locals.project
  environment = local.common.locals.environment
  aws_region  = local.common.locals.aws_region
  vpc_id      = dependency.networking.outputs.vpc_id
  subnet_ids  = dependency.networking.outputs.private_subnet_ids
  lambda_security_group_id = dependency.networking.outputs.lambda_security_group_id

  eventbridge_bus_arn  = dependency.api_services.outputs.eventbridge_bus_arn
  eventbridge_bus_name = dependency.api_services.outputs.eventbridge_bus_name

  posts_bucket_prefix  = local.common.locals.posts_bucket_prefix
  logs_bucket_prefix   = local.common.locals.logs_bucket_prefix
  temp_bucket_prefix   = local.common.locals.temp_bucket_prefix

  lambda_image_processor_timeout = local.common.locals.lambda_image_processor_timeout
  notification_email             = local.common.locals.notification_email
}
