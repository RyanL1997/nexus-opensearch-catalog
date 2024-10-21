CREATE MATERIALIZED VIEW {materialized_view_name} AS
SELECT
  TUMBLE(CAST(eventTime AS TIMESTAMP), '1 Minute').start AS `start_time`,
  
  -- User identity fields
  `userIdentity.type` AS `aws.cloudtrail.userIdentity.type`,
  `userIdentity.arn` AS `aws.cloudtrail.userIdentity.arn`,
  `userIdentity.invokedBy` AS `aws.cloudtrail.userIdentity.invokedBy`,

  -- Event metadata
  eventVersion AS `aws.cloudtrail.eventVersion`,
  eventSource AS `aws.cloudtrail.eventSource`,
  eventName AS `aws.cloudtrail.eventName`,
  eventCategory AS `aws.cloudtrail.eventCategory`,
  eventType AS `aws.cloudtrail.eventType`,
  eventId AS `aws.cloudtrail.eventId`,
  
  -- Request metadata
  awsRegion AS `aws.cloudtrail.awsRegion`,
  sourceIPAddress AS `aws.cloudtrail.sourceIPAddress`,
  userAgent AS `aws.cloudtrail.userAgent`,
  requestId AS `aws.cloudtrail.requestId`,
  recipientAccountId AS `aws.cloudtrail.recipientAccountId`,
  sharedEventId AS `aws.cloudtrail.sharedEventId`,

  -- Aggregation metrics
  COUNT(*) AS `aws.cloudtrail.total_count`
  
FROM
  {table_name}
GROUP BY
  TUMBLE(CAST(eventTime AS TIMESTAMP), '1 Minute'),
  
  -- Grouping by relevant fields for CloudTrail data
  `userIdentity.type`,
  `userIdentity.arn`,
  `userIdentity.invokedBy`,
  eventVersion,
  eventSource,
  eventName,
  eventCategory,
  eventType,
  eventId,
  awsRegion,
  sourceIPAddress,
  userAgent,
  requestId,
  recipientAccountId,
  sharedEventId

WITH (
  auto_refresh = true,
  refresh_interval = '15 Minute',
  watermark_delay = '1 Minute',
  checkpoint_location = '{s3_checkpoint_location}'
);
