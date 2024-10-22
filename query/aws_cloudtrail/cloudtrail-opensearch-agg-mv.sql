CREATE MATERIALIZED VIEW {materialized_view_name}
AS
SELECT
  window.start AS `start_time`,
  `userIdentity.type` AS `aws.cloudtrail.userIdentity.type`,
  `userIdentity.accountId` AS `aws.cloudtrail.userIdentity.accountId`,
  `userIdentity.sessionContext.sessionIssuer.userName` AS `aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.userName`,
  `userIdentity.sessionContext.sessionIssuer.arn` AS `aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.arn`,
  `userIdentity.sessionContext.sessionIssuer.type` AS `aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.type`,
  awsRegion AS `aws.cloudtrail.awsRegion`,
  sourceIPAddress AS `aws.cloudtrail.sourceIPAddress`,
  eventSource AS `aws.cloudtrail.eventSource`,
  eventName AS `aws.cloudtrail.eventName`,
  eventCategory AS `aws.cloudtrail.eventCategory`,
  COUNT(*) AS `aws.cloudtrail.event_count`
FROM (
  SELECT
    window(CAST(eventTime AS TIMESTAMP), '5 minutes') AS window,
    userIdentity.`type` AS `userIdentity.type`,
    userIdentity.`accountId` AS `userIdentity.accountId`,
    userIdentity.sessionContext.sessionIssuer.userName AS `userIdentity.sessionContext.sessionIssuer.userName`,
    userIdentity.sessionContext.sessionIssuer.arn AS `userIdentity.sessionContext.sessionIssuer.arn`,
    userIdentity.sessionContext.sessionIssuer.type AS `userIdentity.sessionContext.sessionIssuer.type`,
    awsRegion,
    sourceIPAddress,
    eventSource,
    eventName,
    eventCategory
  FROM
    {table_name}
)
GROUP BY
  window,
  `userIdentity.type`,
  `userIdentity.accountId`,
  `userIdentity.sessionContext.sessionIssuer.userName`,
  `userIdentity.sessionContext.sessionIssuer.arn`,
  `userIdentity.sessionContext.sessionIssuer.type`,
  awsRegion,
  sourceIPAddress,
  eventSource,
  eventName,
  eventCategory
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minutes',
  watermark_delay = '1 Minute',
  checkpoint_location = '{s3_checkpoint_location}'
);
