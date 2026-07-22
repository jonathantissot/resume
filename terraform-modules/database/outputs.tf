output "aurora_cluster_id"        { value = aws_rds_cluster.main.cluster_identifier }
output "aurora_cluster_endpoint"  { value = aws_rds_cluster.main.endpoint }
output "aurora_reader_endpoint"   { value = aws_rds_cluster.main.reader_endpoint }
output "aurora_port"              { value = aws_rds_cluster.main.port }
output "db_name"                  { value = aws_rds_cluster.main.database_name }
output "db_secret_arn"            { value = aws_secretsmanager_secret.db_master.arn }
output "db_subnet_group_name"     { value = aws_db_subnet_group.main.name }
