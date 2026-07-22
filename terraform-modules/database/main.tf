################################################################################
# terraform-modules/database/main.tf
# Aurora PostgreSQL cluster with multi-AZ writer + reader.
################################################################################

# Secret for the master password
resource "aws_secretsmanager_secret" "db_master" {
  name        = "${var.project}-${var.environment}-db-master"
  description = "Aurora master password"
}

resource "aws_secretsmanager_secret_version" "db_master" {
  secret_id     = aws_secretsmanager_secret.db_master.id
  secret_string = jsonencode({
    username = "dbadmin"
    password = random_password.db_master.result
  })
}

resource "random_password" "db_master" {
  length           = 32
  special          = true
  override_special = "!#$%&*()-_=+[]{}:?"
}

# Subnet group
resource "aws_db_subnet_group" "main" {
  name       = "${var.project}-${var.environment}-db-subnets"
  subnet_ids = var.subnet_ids

  tags = {
    Name = "${var.project}-${var.environment}-db-subnets"
  }
}

# Aurora cluster
resource "aws_rds_cluster" "main" {
  cluster_identifier      = "${var.project}-${var.environment}-aurora"
  engine                  = var.db_engine
  engine_version          = var.db_engine_version
  database_name           = var.db_name
  master_username         = "dbadmin"
  master_password         = random_password.db_master.result
  db_subnet_group_name    = aws_db_subnet_group.main.name
  vpc_security_group_ids  = [var.db_security_group_id]
  backup_retention_period = var.db_backup_retention
  skip_final_snapshot     = false
  final_snapshot_identifier = "${var.project}-${var.environment}-final-snapshot"
  storage_encrypted       = true
  deletion_protection     = true

  tags = {
    Name = "${var.project}-${var.environment}-aurora"
  }
}

# Writer instance
resource "aws_rds_cluster_instance" "writer" {
  identifier           = "${var.project}-${var.environment}-aurora-writer"
  cluster_identifier   = aws_rds_cluster.main.id
  instance_class       = var.db_instance_class
  engine               = aws_rds_cluster.main.engine
  engine_version       = aws_rds_cluster.main.engine_version
  db_subnet_group_name = aws_db_subnet_group.main.name

  tags = {
    Name = "${var.project}-${var.environment}-aurora-writer"
    Role = "writer"
  }
}

# Reader instance (for HA / read scale)
resource "aws_rds_cluster_instance" "reader" {
  identifier           = "${var.project}-${var.environment}-aurora-reader"
  cluster_identifier   = aws_rds_cluster.main.id
  instance_class       = var.db_instance_class
  engine               = aws_rds_cluster.main.engine
  engine_version       = aws_rds_cluster.main.engine_version
  db_subnet_group_name = aws_db_subnet_group.main.name

  tags = {
    Name = "${var.project}-${var.environment}-aurora-reader"
    Role = "reader"
  }

  depends_on = [aws_rds_cluster_instance.writer]
}

terraform {
  required_providers {
    random = {
      source  = "hashicorp/random"
      version = "~> 3.0"
    }
  }
}
