CREATE MATERIALIZED VIEW vpc_mv_agg_3
AS
SELECT
    TUMBLE(`@timestamp`, '1 Minute').start AS `start_time`,
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
    CAST(FROM_UNIXTIME(start) AS TIMESTAMP) AS `@timestamp`
    FROM
    aws_vpc
)
GROUP BY
    TUMBLE(`@timestamp`, '1 Minute'),
    action,
    srcAddr,
    dstAddr
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minute',
  watermark_delay = '1 Minute',
  checkpoint_location = 's3://nexus-flint-integration/checkpoints/vpc_mv_agg_3'
)