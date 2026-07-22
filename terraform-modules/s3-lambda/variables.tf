variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "subnet_ids" {
  type = list(string)
}

variable "lambda_security_group_id" {
  type = string
}

variable "eventbridge_bus_arn" {
  type = string
}

variable "eventbridge_bus_name" {
  type = string
}

variable "posts_bucket_prefix" {
  type    = string
  default = "blog-content-posts"
}

variable "logs_bucket_prefix" {
  type    = string
  default = "blog-access-logs"
}

variable "temp_bucket_prefix" {
  type    = string
  default = "blog-temp-uploads"
}

variable "lambda_image_processor_timeout" {
  type    = number
  default = 30
}

variable "notification_email" {
  type = string
}
