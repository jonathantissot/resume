# infra/database/terragrunt.hcl
# Stack 2 — Database: Aurora PostgreSQL cluster (RDS).
# Depends on: aws-shared (needs VPC/subnet IDs and security groups).

include "root" {
  path = find_in_parent_folders()
}

locals {
  common = read_terragrunt_config(find_in_parent_folders("_envcommon/common.hcl"))
}

terraform {
  source = "../../terraform-modules/database"
}

dependency "networking" {
  config_path = "../aws-shared"

  # Allow plan to proceed without applying aws-shared first
  mock_outputs_allowed_terraform_commands = ["validate", "plan"]
  mock_outputs = {
    vpc_id             = "vpc-00000000"
    private_subnet_ids = ["subnet-00000000", "subnet-11111111", "subnet-22222222"]
    db_security_group_id = "sg-00000000"
  }
}

inputs = {
  project               = local.common.locals.project
  environment           = local.common.locals.environment
  vpc_id                = dependency.networking.outputs.vpc_id
  subnet_ids            = dependency.networking.outputs.private_subnet_ids
  db_security_group_id  = dependency.networking.outputs.db_security_group_id

  db_engine             = local.common.locals.db_engine
  db_engine_version     = local.common.locals.db_engine_version
  db_instance_class     = local.common.locals.db_instance_class
  db_allocated_storage  = local.common.locals.db_allocated_storage
  db_multi_az           = local.common.locals.db_multi_az
  db_backup_retention   = local.common.locals.db_backup_retention
  db_name               = local.common.locals.db_name
}
