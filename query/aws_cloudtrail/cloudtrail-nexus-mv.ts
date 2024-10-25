/* Version of Oct/11/2024 edited by Jialiang */

export const getCloudTrailLogsQuery = (
  materializedViewName: string,
  tableName: string,
  refreshInterval: string,
  enableAutoRefresh: boolean,
) => {
  return `CREATE MATERIALIZED VIEW ${materializedViewName} AS
            SELECT
              \`userIdentity.type\` AS \`aws.cloudtrail.userIdentity.type\`,
              \`userIdentity.arn\` AS \`aws.cloudtrail.userIdentity.arn\`,
              \`userIdentity.invokedBy\` AS \`aws.cloudtrail.userIdentity.invokedBy\`,

              eventVersion AS \`aws.cloudtrail.eventVersion\`,
              CAST( eventTime AS TIMESTAMP)  AS \`@timestamp\`,
              eventSource AS \`aws.cloudtrail.eventSource\`,
              eventName AS \`aws.cloudtrail.eventName\`,
              eventCategory AS \`aws.cloudtrail.eventCategory\`,
              eventType AS \`aws.cloudtrail.eventType\`,
              eventId AS \`aws.cloudtrail.eventId\`,

              awsRegion AS \`aws.cloudtrail.awsRegion\`,
              sourceIPAddress AS \`aws.cloudtrail.sourceIPAddress\`,
              userAgent AS \`aws.cloudtrail.userAgent\`,

              requestParameters AS \`aws.cloudtrail.requestParameter\`,

              responseElements AS \`aws.cloudtrail.responseElements\`,

              requestId AS \`aws.cloudtrail.requestId\`,
              resources AS \`aws.cloudtrail.resources\`,
              readOnly AS \`aws.cloudtrail.readOnly\`,
              recipientAccountId AS \`aws.cloudtrail.recipientAccountId\`,
              sharedEventId AS \`aws.cloudtrail.sharedEventId\`,
            FROM
              ${tableName}
            WITH (
                auto_refresh = ${enableAutoRefresh},
                refresh_interval = '${refreshInterval}'
            )`;
};