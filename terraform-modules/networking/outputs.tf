output "vpc_id"                  { value = aws_vpc.main.id }
output "public_subnet_ids"       { value = aws_subnet.public[*].id }
output "private_subnet_ids"      { value = aws_subnet.private[*].id }
output "db_security_group_id"    { value = aws_security_group.db.id }
output "eks_security_group_id"   { value = aws_security_group.eks.id }
output "lambda_security_group_id" { value = aws_security_group.lambda.id }
output "nat_gateway_ids"         { value = aws_nat_gateway.main[*].id }
