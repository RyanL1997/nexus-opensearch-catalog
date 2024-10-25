export const getWafLogsQuery = (
  materializedViewName: string,
  tableName: string,
  refreshInterval: string,
  enableAutoRefresh: boolean,
) => {
  return `CREATE MATERIALIZED VIEW ${materializedViewName} AS
    SELECT
        CAST(FROM_UNIXTIME(\`timestamp\`/ 1000) AS TIMESTAMP) AS \`@timestamp\`,
        formatVersion AS \`aws.waf.formatVersion\`,
        webaclId AS \`aws.waf.webaclId\`,
        terminatingRuleId AS \`aws.waf.terminatingRuleId\`,
        terminatingRuleType AS \`aws.waf.terminatingRuleType\`,
        action AS \`aws.waf.action\`,
        httpSourceName AS \`aws.waf.httpSourceName\`,
        httpSourceId AS \`aws.waf.httpSourceId\`,
        ruleGroupList AS \`aws.waf.ruleGroupList\`,
        rateBasedRuleList AS \`aws.waf.rateBasedRuleList\`,
        nonTerminatingMatchingRules AS \`aws.waf.nonTerminatingMatchingRules\`,
        requestHeadersInserted AS \`aws.waf.requestHeadersInserted\`,
        responseCodeSent AS \`aws.waf.responseCodeSent\`,
        \`httpRequest.country\` AS \`aws.waf.httpRequest.country\`,
        \`httpRequest.httpMethod\` AS \`aws.waf.httpRequest.httpMethod\`,
        \`httpRequest.uri\` AS \`aws.waf.httpRequest.uri\`,
        \`httpRequest.clientIp\` AS \`aws.waf.httpRequest.clientIp\`,
        labels AS \`aws.waf.labels\`,
        captchaResponse AS \`aws.waf.captchaResponse\`,
        challengeResponse AS \`aws.waf.challengeResponse\`,
        ja3Fingerprint AS \`aws.waf.ja3Fingerprint\`
    FROM
        ${tableName}
    WITH (
      auto_refresh = ${enableAutoRefresh},
      refresh_interval = '${refreshInterval}'
    )`;
};
