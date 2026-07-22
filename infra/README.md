# personal-blog — Infrastructure (Terragrunt)

This directory contains all Terragrunt/Terraform code for the personal-blog
platform MVP on AWS. It provisions the six logical infrastructure stacks
described in `/home/jt/blog-platform-mvp-architecture.md`.

---

## Directory Layout

```
infra/
├── terragrunt.hcl          Root config: remote state (S3+DynamoDB) + AWS provider
├── _envcommon/
│   └── common.hcl          Shared input values (region, CIDR blocks, sizes, names)
├── aws-shared/             Stack 1 — VPC, subnets, NAT, security groups
│   └── terragrunt.hcl
├── database/               Stack 2 — Aurora PostgreSQL cluster
│   ├── terragrunt.hcl
│   └── data-migrations/    SQL migration scripts (applied by CI, not Terraform)
│       └── 001_initial_schema.sql
├── eks-cluster/            Stack 3 — EKS cluster + managed node groups
│   └── terragrunt.hcl
├── api-services/           Stack 4 — API Gateway, Cognito, EventBridge bus, IRSA roles
│   └── terragrunt.hcl
├── data-services/          Stack 5 — S3 buckets, Lambda, SQS, SNS, EventBridge rules
│   └── terragrunt.hcl
└── monitoring/             Stack 6 — CloudWatch log groups, dashboards, alarms
    └── terragrunt.hcl

terraform-modules/          Reusable Terraform modules (no Terragrunt logic here)
├── networking/             VPC resources
├── database/               Aurora cluster
├── eks/                    EKS cluster + node groups
├── api-gateway/            API Gateway + Cognito + EventBridge bus
├── s3-lambda/              S3 buckets + Lambda + SQS + SNS
└── monitoring/             CloudWatch dashboards + alarms
```

## Stack Dependency Graph

```
aws-shared  ──────────────────────────────────────────────────────┐
    │                                                               │
    ├──▶ database                                                   │
    │                                                               │
    ├──▶ eks-cluster ──▶ api-services ──▶ data-services ──▶ monitoring
    │                         │
    └─────────────────────────┘
```

Apply order enforced by Terragrunt `dependency` blocks:
1. aws-shared
2. database, eks-cluster  (can run in parallel after step 1)
3. api-services           (requires eks-cluster)
4. data-services          (requires api-services)
5. monitoring             (requires database + eks-cluster + data-services)

## Prerequisites

1. AWS credentials configured (IAM user or assumed role with admin-level permissions
   for the services listed in the architecture doc).

   ```bash
   export AWS_PROFILE=personal-blog
   # or
   export AWS_ACCESS_KEY_ID=...
   export AWS_SECRET_ACCESS_KEY=...
   export AWS_REGION=us-east-1
   ```

2. Bootstrap the Terraform remote-state bucket and lock table **once**:

   ```bash
   aws s3 mb s3://personal-blog-prod-tfstate --region us-east-1
   aws s3api put-bucket-versioning \
     --bucket personal-blog-prod-tfstate \
     --versioning-configuration Status=Enabled
   aws dynamodb create-table \
     --table-name personal-blog-prod-tflock \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --billing-mode PAY_PER_REQUEST \
     --region us-east-1
   ```

3. Install tools:
   - Terraform >= 1.6: https://developer.hashicorp.com/terraform/install
   - Terragrunt >= 0.55: https://terragrunt.gruntwork.io/docs/getting-started/install/
   - AWS CLI v2

## Common Commands

All commands run from inside `infra/`.

### Plan everything

```bash
cd infra
terragrunt run-all plan
```

### Apply everything (respects dependency order)

```bash
cd infra
terragrunt run-all apply
```

### Apply a single stack

```bash
cd infra/aws-shared
terragrunt apply
```

### Validate all modules (no AWS credentials required)

```bash
cd infra
terragrunt run-all validate
```

### Destroy (reverse order, caution in production)

```bash
cd infra
terragrunt run-all destroy
```

## Customising Common Inputs

Edit `infra/_envcommon/common.hcl` to change:
- `aws_region` — target region (default: `us-east-1`)
- `environment` — environment label (default: `prod`)
- `vpc_cidr` / `public_subnets` / `private_subnets` — networking CIDRs
- `db_instance_class` — Aurora instance size
- `eks_worker_desired` / `_min` / `_max` — node group scaling bounds
- `notification_email` — where CloudWatch alarms and SNS subscriptions deliver

No changes should be made to the module `.tf` files directly for configuration
tuning — all knobs are surfaced as variables in `common.hcl` or stack-specific
`terragrunt.hcl` inputs.

## Remote State Layout

State is stored in S3 under the path `<stack-dir>/terraform.tfstate`:

```
s3://personal-blog-prod-tfstate/
├── aws-shared/terraform.tfstate
├── database/terraform.tfstate
├── eks-cluster/terraform.tfstate
├── api-services/terraform.tfstate
├── data-services/terraform.tfstate
└── monitoring/terraform.tfstate
```

Lock records are stored in DynamoDB table `personal-blog-prod-tflock`.

## Security Notes

- The Aurora master password is generated by Terraform and stored in
  AWS Secrets Manager (`personal-blog-prod-db-master`). Never commit it.
- All S3 buckets have public access blocked and server-side encryption enabled.
- Lambda functions run inside the private VPC subnets.
- EKS workloads use IRSA (IAM Roles for Service Accounts) — no long-lived
  credentials are mounted into pods.
- Deletion protection is enabled on the Aurora cluster.

## CI/CD Integration

The CI pipeline (GitHub Actions / CodePipeline) should:
1. Run `terragrunt run-all validate` on every PR.
2. Run `terragrunt run-all plan` and post the plan as a PR comment.
3. On merge to main, run `terragrunt run-all apply` in the dependency order above.
4. After `database` applies, run the SQL migrations in `database/data-migrations/`
   via `psql` or a migration tool (Flyway/Liquibase) using the secret from
   Secrets Manager.
5. Deploy the Lambda ZIP artefact to the function created by `data-services`.
