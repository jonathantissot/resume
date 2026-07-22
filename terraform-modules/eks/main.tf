################################################################################
# terraform-modules/eks/main.tf
# EKS cluster, OIDC provider, managed node groups, and cluster-autoscaler IAM role.
################################################################################

data "aws_caller_identity" "current" {}

# ── EKS Cluster ───────────────────────────────────────────────────────────────
resource "aws_eks_cluster" "main" {
  name     = "${var.project}-${var.environment}-eks"
  version  = var.cluster_version
  role_arn = aws_iam_role.eks_cluster.arn

  vpc_config {
    subnet_ids              = var.subnet_ids
    security_group_ids      = [var.eks_security_group_id]
    endpoint_private_access = true
    endpoint_public_access  = true
  }

  tags = {
    Name = "${var.project}-${var.environment}-eks"
  }

  depends_on = [aws_iam_role_policy_attachment.eks_cluster_policy]
}

# ── OIDC Provider ─────────────────────────────────────────────────────────────
data "tls_certificate" "eks_oidc" {
  url = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

resource "aws_iam_openid_connect_provider" "eks" {
  client_id_list  = ["sts.amazonaws.com"]
  thumbprint_list = [data.tls_certificate.eks_oidc.certificates[0].sha1_fingerprint]
  url             = aws_eks_cluster.main.identity[0].oidc[0].issuer
}

# ── IAM — Cluster Role ────────────────────────────────────────────────────────
resource "aws_iam_role" "eks_cluster" {
  name = "${var.project}-${var.environment}-eks-cluster-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "eks.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_cluster_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSClusterPolicy"
  role       = aws_iam_role.eks_cluster.name
}

# ── IAM — Node Role ───────────────────────────────────────────────────────────
resource "aws_iam_role" "eks_node" {
  name = "${var.project}-${var.environment}-eks-node-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })
}

resource "aws_iam_role_policy_attachment" "eks_worker_node_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKSWorkerNodePolicy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "eks_cni_policy" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEKS_CNI_Policy"
  role       = aws_iam_role.eks_node.name
}

resource "aws_iam_role_policy_attachment" "eks_ecr_readonly" {
  policy_arn = "arn:aws:iam::aws:policy/AmazonEC2ContainerRegistryReadOnly"
  role       = aws_iam_role.eks_node.name
}

# ── Managed Node Group — Worker Pool ─────────────────────────────────────────
resource "aws_eks_node_group" "worker_pool" {
  cluster_name    = aws_eks_cluster.main.name
  node_group_name = "${var.project}-${var.environment}-worker-pool"
  node_role_arn   = aws_iam_role.eks_node.arn
  subnet_ids      = var.subnet_ids
  instance_types  = var.node_instance_types

  scaling_config {
    min_size     = var.worker_min_size
    max_size     = var.worker_max_size
    desired_size = var.worker_desired_size
  }

  update_config {
    max_unavailable = 1
  }

  tags = {
    Name = "${var.project}-${var.environment}-worker-pool"
  }

  depends_on = [
    aws_iam_role_policy_attachment.eks_worker_node_policy,
    aws_iam_role_policy_attachment.eks_cni_policy,
    aws_iam_role_policy_attachment.eks_ecr_readonly,
  ]
}

terraform {
  required_providers {
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}
