export const getCloudTrailLogsQuery = (
  materializedViewName: string,
  tableName: string,
  refreshInterval: string,
) => {
  return `CREATE MATERIALIZED VIEW ${materializedViewName} AS
    SELECT
      TUMBLE(\`@timestamp\`, '5 Minute').start AS \`start_time\`,
      \`userIdentity.type\` AS \`aws.cloudtrail.userIdentity.type\`,
      \`userIdentity.accountId\` AS \`aws.cloudtrail.userIdentity.accountId\`,
      \`userIdentity.sessionContext.sessionIssuer.userName\` AS \`aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.userName\`,
      \`userIdentity.sessionContext.sessionIssuer.arn\` AS \`aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.arn\`,
      \`userIdentity.sessionContext.sessionIssuer.type\` AS \`aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.type\`,
      awsRegion AS \`aws.cloudtrail.awsRegion\`,
      sourceIPAddress AS \`aws.cloudtrail.sourceIPAddress\`,
      eventSource AS \`aws.cloudtrail.eventSource\`,
      eventName AS \`aws.cloudtrail.eventName\`,
      eventCategory AS \`aws.cloudtrail.eventCategory\`,
      COUNT(*) AS \`aws.cloudtrail.event_count\`
    FROM (
      SELECT
        CAST(eventTime AS TIMESTAMP) AS \`@timestamp\`,
        COALESCE(CAST(\`userIdentity.type\` AS STRING), 'UNKNOWN_TYPE') AS \`userIdentity.type\`,
        COALESCE(CAST(\`userIdentity.accountId\` AS STRING), 'UNKNOWN_ID') AS \`userIdentity.accountId\`,
        COALESCE(CAST(\`userIdentity.sessionContext.sessionIssuer.userName\` AS STRING), 'UNKNOWN_USERNAME') AS \`userIdentity.sessionContext.sessionIssuer.userName\`,
        COALESCE(CAST(\`userIdentity.sessionContext.sessionIssuer.arn\` AS STRING), 'UNKNOWN_ARN') AS \`userIdentity.sessionContext.sessionIssuer.arn\`,
        COALESCE(CAST(\`userIdentity.sessionContext.sessionIssuer.type\` AS STRING), 'UNKNOWN_TYPE') AS \`userIdentity.sessionContext.sessionIssuer.type\`,
        COALESCE(CAST(\`awsRegion\` AS STRING), 'UNKNOWN_REGION') AS awsRegion,
        COALESCE(CAST(\`sourceIPAddress\` AS STRING), '0.0.0.0') AS sourceIPAddress,
        COALESCE(CAST(\`eventSource\` AS STRING), 'UNKNOWN_SOURCE') AS eventSource,
        COALESCE(CAST(\`eventName\` AS STRING), 'UNKNOWN_NAME') AS eventName,
        COALESCE(CAST(\`eventCategory\` AS STRING), 'UNKNOWN_CATEGORY') AS eventCategory
      FROM
        ${tableName}
    )
    GROUP BY
      TUMBLE(\`@timestamp\`, '5 Minute'),
      \`userIdentity.type\`,
      \`userIdentity.accountId\`,
      \`userIdentity.sessionContext.sessionIssuer.userName\`,
      \`userIdentity.sessionContext.sessionIssuer.arn\`,
      \`userIdentity.sessionContext.sessionIssuer.type\`,
      awsRegion,
      sourceIPAddress,
      eventSource,
      eventName,
      eventCategory
    WITH (
      auto_refresh = true,
      refresh_interval = '${refreshInterval}',
      watermark_delay = '1 Minute'
    )`;
};
