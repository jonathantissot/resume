# infra/aws-shared/terragrunt.hcl
# Stack 1 — Foundation: VPC, subnets, NAT gateway, internet gateway, security groups.
# All other stacks depend on this one.

include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("_envcommon/common.hcl"))
}

terraform {
  source = "../../terraform-modules/networking"
}

inputs = {
  project            = local.common.locals.project
  environment        = local.common.locals.environment
  vpc_cidr           = local.common.locals.vpc_cidr
  public_subnets     = local.common.locals.public_subnets
  private_subnets    = local.common.locals.private_subnets
  availability_zones = local.common.locals.availability_zones
  enable_nat_gateway = local.common.locals.enable_nat_gateway
}
