variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "cluster_endpoint" {
  type = string
}

variable "cluster_arn" {
  type = string
}

variable "oidc_provider_arn" {
  type = string
}

variable "oidc_provider_url" {
  type = string
}

variable "api_stage" {
  type    = string
  default = "v1"
}

variable "api_throttle_rate_limit" {
  type    = number
  default = 10000
}

variable "api_throttle_burst_limit" {
  type    = number
  default = 20000
}

variable "auth_service_name" {
  type    = string
  default = "auth-service"
}

variable "post_service_name" {
  type    = string
  default = "post-service"
}

variable "comment_service_name" {
  type    = string
  default = "comment-service"
}

variable "like_service_name" {
  type    = string
  default = "like-service"
}
