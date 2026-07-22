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

variable "db_security_group_id" {
  type = string
}

variable "db_engine" {
  type    = string
  default = "aurora-postgresql"
}

variable "db_engine_version" {
  type    = string
  default = "15.7"
}

variable "db_instance_class" {
  type    = string
  default = "db.r6g.large"
}

variable "db_allocated_storage" {
  type    = number
  default = 50
}

variable "db_multi_az" {
  type    = bool
  default = true
}

variable "db_backup_retention" {
  type    = number
  default = 7
}

variable "db_name" {
  type    = string
  default = "blogposts"
}
