variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "aws_region" {
  type = string
}

variable "logs_retention_days" {
  type    = number
  default = 30
}

variable "cloudwatch_dashboards" {
  type = list(string)
}

variable "notification_email" {
  type = string
}

variable "aurora_cluster_id" {
  type = string
}

variable "aurora_reader_endpoint" {
  type = string
}

variable "eks_cluster_name" {
  type = string
}

variable "eks_node_group_name" {
  type = string
}

variable "posts_bucket_id" {
  type = string
}

variable "lambda_image_processor_name" {
  type = string
}

variable "sqs_job_queue_url" {
  type = string
}
