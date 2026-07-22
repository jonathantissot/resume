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

variable "eks_security_group_id" {
  type = string
}

variable "cluster_version" {
  type    = string
  default = "1.30"
}

variable "node_instance_types" {
  type    = list(string)
  default = ["m6g.large"]
}

variable "worker_min_size" {
  type    = number
  default = 0
}

variable "worker_max_size" {
  type    = number
  default = 5
}

variable "worker_desired_size" {
  type    = number
  default = 2
}
