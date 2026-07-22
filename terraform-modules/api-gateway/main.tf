################################################################################
# terraform-modules/api-gateway/main.tf
# AWS API Gateway (REST), Cognito User Pool for authentication, and
# EventBridge custom bus for inter-service events.
################################################################################

# ── Cognito User Pool ─────────────────────────────────────────────────────────
resource "aws_cognito_user_pool" "main" {
  name = "${var.project}-${var.environment}-users"

  password_policy {
    minimum_length    = 12
    require_uppercase = true
    require_numbers   = true
    require_symbols   = false
  }

  auto_verified_attributes = ["email"]

  username_configuration {
    case_sensitive = false
  }

  tags = {
    Name = "${var.project}-${var.environment}-user-pool"
  }
}

resource "aws_cognito_user_pool_client" "web" {
  name                                 = "${var.project}-${var.environment}-web-client"
  user_pool_id                         = aws_cognito_user_pool.main.id
  generate_secret                      = false
  explicit_auth_flows                  = ["ALLOW_USER_SRP_AUTH", "ALLOW_REFRESH_TOKEN_AUTH"]
  prevent_user_existence_errors        = "ENABLED"
  access_token_validity                = 1
  id_token_validity                    = 1
  refresh_token_validity               = 30
}

# ── EventBridge Custom Bus ────────────────────────────────────────────────────
resource "aws_cloudwatch_event_bus" "main" {
  name = "${var.project}-${var.environment}-events"

  tags = {
    Name = "${var.project}-${var.environment}-events"
  }
}

# ── API Gateway REST API ──────────────────────────────────────────────────────
resource "aws_api_gateway_rest_api" "main" {
  name        = "${var.project}-${var.environment}-api"
  description = "Personal blog platform REST API"

  endpoint_configuration {
    types = ["REGIONAL"]
  }

  tags = {
    Name = "${var.project}-${var.environment}-api"
  }
}

resource "aws_api_gateway_authorizer" "cognito" {
  name                   = "cognito-authorizer"
  rest_api_id            = aws_api_gateway_rest_api.main.id
  type                   = "COGNITO_USER_POOLS"
  identity_source        = "method.request.header.Authorization"
  provider_arns          = [aws_cognito_user_pool.main.arn]
}

resource "aws_api_gateway_stage" "main" {
  stage_name    = var.api_stage
  rest_api_id   = aws_api_gateway_rest_api.main.id
  deployment_id = aws_api_gateway_deployment.main.id

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.api_gw.arn
    format = jsonencode({
      requestId      = "$context.requestId"
      ip             = "$context.identity.sourceIp"
      caller         = "$context.identity.caller"
      user           = "$context.identity.user"
      requestTime    = "$context.requestTime"
      httpMethod     = "$context.httpMethod"
      resourcePath   = "$context.resourcePath"
      status         = "$context.status"
      protocol       = "$context.protocol"
      responseLength = "$context.responseLength"
    })
  }

  tags = {
    Name = "${var.project}-${var.environment}-api-stage-${var.api_stage}"
  }
}

resource "aws_api_gateway_method_settings" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id
  stage_name  = aws_api_gateway_stage.main.stage_name
  method_path = "*/*"

  settings {
    throttling_rate_limit  = var.api_throttle_rate_limit
    throttling_burst_limit = var.api_throttle_burst_limit
    logging_level          = "INFO"
    data_trace_enabled     = false
    metrics_enabled        = true
  }
}

resource "aws_api_gateway_deployment" "main" {
  rest_api_id = aws_api_gateway_rest_api.main.id

  lifecycle {
    create_before_destroy = true
  }

  depends_on = [aws_api_gateway_rest_api.main]
}

resource "aws_cloudwatch_log_group" "api_gw" {
  name              = "/aws/apigateway/${var.project}-${var.environment}"
  retention_in_days = 30
}

# ── IAM — IRSA roles for EKS services ────────────────────────────────────────
# Each service gets its own IAM role that can be assumed by the K8s service account

locals {
  service_names = [
    var.auth_service_name,
    var.post_service_name,
    var.comment_service_name,
    var.like_service_name,
  ]
}

resource "aws_iam_role" "service" {
  for_each = toset(local.service_names)

  name = "${var.project}-${var.environment}-irsa-${each.key}"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Action = "sts:AssumeRoleWithWebIdentity"
      Principal = {
        Federated = var.oidc_provider_arn
      }
      Condition = {
        StringEquals = {
          "${var.oidc_provider_url}:sub" = "system:serviceaccount:default:${each.key}"
          "${var.oidc_provider_url}:aud" = "sts.amazonaws.com"
        }
      }
    }]
  })

  tags = {
    Name    = "${var.project}-${var.environment}-irsa-${each.key}"
    Service = each.key
  }
}
