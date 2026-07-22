output "api_gateway_id"        { value = aws_api_gateway_rest_api.main.id }
output "api_gateway_url"       { value = aws_api_gateway_stage.main.invoke_url }
output "eventbridge_bus_arn"   { value = aws_cloudwatch_event_bus.main.arn }
output "eventbridge_bus_name"  { value = aws_cloudwatch_event_bus.main.name }
output "cognito_user_pool_id"  { value = aws_cognito_user_pool.main.id }
output "cognito_client_id"     { value = aws_cognito_user_pool_client.web.id }
output "service_role_arns"     { value = { for k, v in aws_iam_role.service : k => v.arn } }
