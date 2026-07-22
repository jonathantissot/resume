output "alert_topic_arn"             { value = aws_sns_topic.alerts.arn }
output "dashboard_api_overview_arn"  { value = aws_cloudwatch_dashboard.api_overview.dashboard_arn }
output "dashboard_engagement_arn"    { value = aws_cloudwatch_dashboard.posts_engagement.dashboard_arn }
output "dashboard_errors_arn"        { value = aws_cloudwatch_dashboard.errors.dashboard_arn }
