# Root terragrunt.hcl
# Shared remote state configuration and provider defaults for the personal-blog platform.
# Values needed here (project, environment, region) are declared directly so this file
# resolves correctly whether evaluated as root or included by a child stack.

locals {
  project     = "personal-blog"
  environment = "prod"
  aws_region  = "us-east-1"
}

# ── Remote state ─────────────────────────────────────────────────────────────
remote_state {
  backend = "s3"

  config = {
    bucket         = "${local.project}-${local.environment}-tfstate"
    key            = "${path_relative_to_include()}/terraform.tfstate"
    region         = local.aws_region
    encrypt        = true
    dynamodb_table = "${local.project}-${local.environment}-tflock"
  }

  generate = {
    path      = "backend.tf"
    if_exists = "overwrite_terragrunt"
  }
}

# ── Provider generation ───────────────────────────────────────────────────────
generate "provider" {
  path      = "provider.tf"
  if_exists = "overwrite_terragrunt"
  contents  = <<-EOF
    terraform {
      required_version = ">= 1.6.0"
      required_providers {
        aws = {
          source  = "hashicorp/aws"
          version = "~> 5.0"
        }
        kubernetes = {
          source  = "hashicorp/kubernetes"
          version = "~> 2.0"
        }
      }
    }

    provider "aws" {
      region = "${local.aws_region}"
      default_tags {
        tags = {
          Project     = "${local.project}"
          Environment = "${local.environment}"
          ManagedBy   = "terragrunt"
        }
      }
    }
  EOF
}

# ── Common inputs ─────────────────────────────────────────────────────────────
# Child stacks load _envcommon/common.hcl themselves via find_in_parent_folders.
# The root only exposes the three keys needed for remote state + provider above.
inputs = {
  project     = local.project
  environment = local.environment
  aws_region  = local.aws_region
}
