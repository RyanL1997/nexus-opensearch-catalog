CREATE MATERIALIZED VIEW {materialized_view_name}
AS
SELECT
  TUMBLE(`@timestamp`, '5 Minute').start AS `start_time`,
  action AS `aws.vpc.action`,
  srcAddr AS `aws.vpc.srcaddr`,
  dstAddr AS `aws.vpc.dstaddr`,
  protocol AS `aws.vpc.protocol`,
  dstPort AS `aws.vpc.dstport`,
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
    protocol,
    dstPort,
    CAST(FROM_UNIXTIME(start) AS TIMESTAMP) AS `@timestamp`
  FROM
    {table_name}
)
GROUP BY
  TUMBLE(`@timestamp`, '5 Minute'),
  action,
  srcAddr,
  dstAddr,
  protocol,
  dstPort
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minute',
  watermark_delay = '1 Minute',
  checkpoint_location = '{s3_checkpoint_location}'
)
