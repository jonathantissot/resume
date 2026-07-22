output "cluster_name"        { value = aws_eks_cluster.main.name }
output "cluster_endpoint"    { value = aws_eks_cluster.main.endpoint }
output "cluster_arn"         { value = aws_eks_cluster.main.arn }
output "cluster_ca"          { value = aws_eks_cluster.main.certificate_authority[0].data }
output "oidc_provider_arn"   { value = aws_iam_openid_connect_provider.eks.arn }
output "oidc_provider_url"   { value = trimprefix(aws_iam_openid_connect_provider.eks.url, "https://") }
output "node_group_name"     { value = aws_eks_node_group.worker_pool.node_group_name }
output "node_role_arn"       { value = aws_iam_role.eks_node.arn }
