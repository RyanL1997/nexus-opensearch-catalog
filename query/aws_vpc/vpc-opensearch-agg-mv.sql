CREATE MATERIALIZED VIEW {materialized_view_name}
AS
SELECT
  window.start AS `start_time`,
  action AS `aws.vpc.action`,
  srcAddr AS `aws.vpc.srcaddr`,
  dstAddr AS `aws.vpc.dstaddr`,
  COUNT(*) AS `aws.vpc.total_count`,
  SUM(bytes) AS `aws.vpc.total_bytes`,
  SUM(packets) AS `aws.vpc.total_packets`
FROM (
  SELECT
    action,
    srcAddr,
    dstAddr,
    bytes,
    packets,
    window(CAST(FROM_UNIXTIME(start) AS TIMESTAMP), '5 minutes') AS window
  FROM
    {table_name}
)
GROUP BY
  window,
  action,
  srcAddr,
  dstAddr
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minute',
  watermark_delay = '1 Minute',
  checkpoint_location = '{s3_checkpoint_location}'
)
