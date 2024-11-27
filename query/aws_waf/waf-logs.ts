export const getWafLogsQuery = (
  materializedViewName: string,
  tableName: string,
  refreshInterval: string,
) => {
  return `CREATE MATERIALIZED VIEW ${materializedViewName} AS
    SELECT
      TUMBLE(\`@timestamp\`, '5 Minute').start AS \`start_time\`,
      webaclId AS \`aws.waf.webaclId\`,
      action AS \`aws.waf.action\`,
      \`httpRequest.clientIp\` AS \`aws.waf.httpRequest.clientIp\`,
      \`httpRequest.country\` AS \`aws.waf.httpRequest.country\`,
      \`httpRequest.uri\` AS \`aws.waf.httpRequest.uri\`,
      \`httpRequest.httpMethod\` AS \`aws.waf.httpRequest.httpMethod\`,
      httpSourceId AS \`aws.waf.httpSourceId\`,
      terminatingRuleId AS \`aws.waf.terminatingRuleId\`,
      terminatingRuleType AS \`aws.waf.RuleType\`,
      \`ruleGroupList.ruleId\` AS \`aws.waf.ruleGroupList.ruleId\`,
      COUNT(*) AS \`aws.waf.event_count\`
    FROM (
      SELECT
        CAST(FROM_UNIXTIME(\`timestamp\`/1000) AS TIMESTAMP) AS \`@timestamp\`,
        COALESCE(CAST(\`webaclId\` AS STRING), 'UNKNOWN_WEBACLID') AS webaclId,
        COALESCE(CAST(\`action\` AS STRING), 'UNKNOWN_ACTION') AS action,
        COALESCE(CAST(\`httpRequest.clientIp\` AS STRING), '0.0.0.0') AS \`httpRequest.clientIp\`,
        COALESCE(CAST(\`httpRequest.country\` AS STRING), 'UNKNOWN_COUNTRY') AS \`httpRequest.country\`,
        COALESCE(CAST(\`httpRequest.uri\` AS STRING), '/') AS \`httpRequest.uri\`,
        COALESCE(CAST(\`httpRequest.httpMethod\` AS STRING), 'UNKNOWN_METHOD') AS \`httpRequest.httpMethod\`,
        COALESCE(CAST(\`httpSourceId\` AS STRING), 'UNKNOWN_SOURCE') AS httpSourceId,
        COALESCE(CAST(\`terminatingRuleId\` AS STRING), 'UNKNOWN_RULEID') AS terminatingRuleId,
        COALESCE(CAST(\`terminatingRuleType\` AS STRING), 'UNKNOWN_TYPE') AS terminatingRuleType,
        COALESCE(CAST(\`ruleGroupList.ruleId\` AS STRING), 'UNKNOWN_GROUP') AS \`ruleGroupList.ruleId\`
      FROM
        ${tableName}
    )
    GROUP BY
      TUMBLE(\`@timestamp\`, '5 Minute'),
      webaclId,
      action,
      \`httpRequest.clientIp\`,
      \`httpRequest.country\`,
      \`httpRequest.uri\`,
      \`httpRequest.httpMethod\`,
      httpSourceId,
      terminatingRuleId,
      terminatingRuleType,
      \`ruleGroupList.ruleId\`
    WITH (
      auto_refresh = true,
      refresh_interval = '${refreshInterval}',
      watermark_delay = '1 Minute'
    )`;
};
