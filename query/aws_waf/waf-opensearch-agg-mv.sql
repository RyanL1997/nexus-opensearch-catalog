CREATE MATERIALIZED VIEW {materialized_view_name}
AS
SELECT
  TUMBLE(`@timestamp`, '5 Minute').start AS `start_time`,
  webaclId AS `aws.waf.webaclId`,
  action AS `aws.waf.action`,
  `httpRequest.clientIp` AS `aws.waf.httpRequest.clientIp`,
  `httpRequest.country` AS `aws.waf.httpRequest.country`,
  `httpRequest.uri` AS `aws.waf.httpRequest.uri`,
  `httpRequest.httpMethod` AS `aws.waf.httpRequest.httpMethod`,
  httpSourceId AS `aws.waf.httpSourceId`,
  terminatingRuleId AS `aws.waf.terminatingRuleId`,
  terminatingRuleType AS `aws.waf.RuleType`,
  `ruleGroupList.ruleId` AS `aws.waf.ruleGroupList.ruleId`,
  COUNT(*) AS `aws.waf.event_count`
FROM (
  SELECT
    CAST(FROM_UNIXTIME(`timestamp`/1000) AS TIMESTAMP) AS `@timestamp`,
    webaclId,
    action,
    httpRequest.clientIp AS `httpRequest.clientIp`,
    httpRequest.country AS `httpRequest.country`,
    httpRequest.uri AS `httpRequest.uri`,
    httpRequest.httpMethod AS `httpRequest.httpMethod`,
    httpSourceId,
    terminatingRuleId,
    terminatingRuleType,
    ruleGroupList.ruleId AS `ruleGroupList.ruleId`
  FROM
    {table_name}
)
GROUP BY
  TUMBLE(`@timestamp`, '5 Minute'),
  webaclId,
  action,
  `httpRequest.clientIp`,
  `httpRequest.country`,
  `httpRequest.uri`,
  `httpRequest.httpMethod`,
  httpSourceId,
  terminatingRuleId,
  terminatingRuleType,
  `ruleGroupList.ruleId`
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minute',
  watermark_delay = '1 Minute',
  checkpoint_location = '{s3_checkpoint_location}'
);
