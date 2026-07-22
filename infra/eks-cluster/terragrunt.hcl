# infra/eks-cluster/terragrunt.hcl
# Stack 3 — Compute: EKS cluster + managed node groups.
# Depends on: aws-shared (VPC/private subnets required for node group placement).

include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("_envcommon/common.hcl"))
}

terraform {
  source = "../../terraform-modules/eks"
}

dependency "networking" {
  config_path = "../aws-shared"

  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    vpc_id             = "vpc-00000000"
    private_subnet_ids = ["subnet-00000000", "subnet-11111111", "subnet-22222222"]
    eks_security_group_id = "sg-00000000"
  }
}

inputs = {
  project               = local.common.locals.project
  environment           = local.common.locals.environment
  vpc_id                = dependency.networking.outputs.vpc_id
  subnet_ids            = dependency.networking.outputs.private_subnet_ids
  eks_security_group_id = dependency.networking.outputs.eks_security_group_id

  cluster_version       = local.common.locals.eks_cluster_version
  node_instance_types   = local.common.locals.eks_node_instance_types
  worker_min_size       = local.common.locals.eks_worker_min
  worker_max_size       = local.common.locals.eks_worker_max
  worker_desired_size   = local.common.locals.eks_worker_desired
}
