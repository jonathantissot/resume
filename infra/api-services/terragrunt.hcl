# infra/api-services/terragrunt.hcl
# Stack 4 — API Services: AWS API Gateway (REST), Cognito user pool, EventBridge bus.
# Kubernetes deployments are managed separately via Helm/kubectl, not Terraform.
# Depends on: eks-cluster (cluster endpoint + OIDC for IAM roles), aws-shared (VPC).

include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("_envcommon/common.hcl"))
}

terraform {
  source = "../../terraform-modules/api-gateway"
}

dependency "networking" {
  config_path = "../aws-shared"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    vpc_id             = "vpc-00000000"
    public_subnet_ids  = ["subnet-00000000", "subnet-11111111", "subnet-22222222"]
  }
}

dependency "eks" {
  config_path = "../eks-cluster"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    cluster_endpoint = "https://example.eks.amazonaws.com"
    cluster_arn      = "arn:aws:eks:us-east-1:123456789012:cluster/mock"
    oidc_provider_arn = "arn:aws:iam::123456789012:oidc-provider/example"
    oidc_provider_url = "example.oidc.eks.amazonaws.com"
  }
}

inputs = {
  project     = local.common.locals.project
  environment = local.common.locals.environment
  vpc_id      = dependency.networking.outputs.vpc_id
  subnet_ids  = dependency.networking.outputs.public_subnet_ids

  cluster_endpoint  = dependency.eks.outputs.cluster_endpoint
  cluster_arn       = dependency.eks.outputs.cluster_arn
  oidc_provider_arn = dependency.eks.outputs.oidc_provider_arn
  oidc_provider_url = dependency.eks.outputs.oidc_provider_url

  api_stage                = local.common.locals.api_stage
  api_throttle_rate_limit  = local.common.locals.api_throttle_rate_limit
  api_throttle_burst_limit = local.common.locals.api_throttle_burst_limit

  auth_service_name    = "auth-service"
  post_service_name    = "post-service"
  comment_service_name = "comment-service"
  like_service_name    = "like-service"
}
