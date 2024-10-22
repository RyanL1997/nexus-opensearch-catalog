-- VERSION: 2.0
CREATE MATERIALIZED VIEW {materialized_view_name}
AS
SELECT
  TUMBLE(CAST(eventTime AS TIMESTAMP), '5 Minutes').start AS `start_time`,
  `userIdentity.type` AS `aws.cloudtrail.userIdentity.type`,
  eventSource AS `aws.cloudtrail.eventSource`,
  eventName AS `aws.cloudtrail.eventName`,
  eventCategory AS `aws.cloudtrail.eventCategory`,
  COUNT(*) AS `aws.cloudtrail.event_count`,
  -- SUM(CASE WHEN additionalEventData.bytesTransferredIn IS NOT NULL THEN additionalEventData.bytesTransferredIn ELSE 0 END) AS `aws.cloudtrail.total_bytes_in`,
  -- SUM(CASE WHEN additionalEventData.bytesTransferredOut IS NOT NULL THEN additionalEventData.bytesTransferredOut ELSE 0 END) AS `aws.cloudtrail.total_bytes_out`
FROM (
  SELECT
    eventTime,
    `userIdentity.type`,
    eventSource,
    eventName,
    eventCategory,
    -- additionalEventData.bytesTransferredIn,
    -- additionalEventData.bytesTransferredOut
  FROM
    {table_name}
)
GROUP BY
  TUMBLE(CAST(eventTime AS TIMESTAMP), '5 Minutes'),
  `userIdentity.type`,
  eventSource,
  eventName,
  eventCategory
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minutes',
  watermark_delay = '1 Minutes',
  checkpoint_location = '{s3_checkpoint_location}'
)

--- VERSION: 3.0 [TESTED]
CREATE MATERIALIZED VIEW {materialized_view_name}
AS
SELECT
  window.start AS `start_time`,
  `userIdentity.type` AS `aws.cloudtrail.userIdentity.type`,
  eventSource AS `aws.cloudtrail.eventSource`,
  eventName AS `aws.cloudtrail.eventName`,
  eventCategory AS `aws.cloudtrail.eventCategory`,
  COUNT(*) AS `aws.cloudtrail.event_count`
FROM (
  SELECT
    window(CAST(eventTime AS TIMESTAMP), '5 minutes') AS window,
    userIdentity.`type` AS `userIdentity.type`,
    eventSource,
    eventName,
    eventCategory
  FROM
    {table_name}
)
GROUP BY
  window,
  `userIdentity.type`,
  eventSource,
  eventName,
  eventCategory
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minutes',
  watermark_delay = '1 Minute',
  checkpoint_location = '{s3_checkpoint_location}'
);

