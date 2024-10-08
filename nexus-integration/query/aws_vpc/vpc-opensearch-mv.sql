CREATE MATERIALIZED VIEW {materialized_view_name} AS
  SELECT
    CAST(IFNULL(srcPort, 0) AS LONG) AS `aws.vpc.srcport`,
    CAST(IFNULL(srcAddr, '0.0.0.0') AS STRING)  AS `aws.vpc.srcaddr`,
    CAST(IFNULL(interfaceId, 'Unknown') AS STRING)  AS `aws.vpc.src-interface_uid`,
    CAST(IFNULL(dstPort, 0) AS LONG) AS `aws.vpc.dstport`,
    CAST(IFNULL(dstAddr, '0.0.0.0') AS STRING)  AS `aws.vpc.dstaddr`,
    CAST(IFNULL(packets, 0) AS LONG) AS `aws.vpc.packets`,
    CAST(IFNULL(bytes, 0) AS LONG) AS `aws.vpc.bytes`,
    CAST(FROM_UNIXTIME(start ) AS TIMESTAMP) AS `@timestamp`,
    CAST(FROM_UNIXTIME(start ) AS TIMESTAMP) AS `start_time`,
    CAST(FROM_UNIXTIME(start ) AS TIMESTAMP) AS `interval_start_time`,
    CAST(FROM_UNIXTIME(`end` ) AS TIMESTAMP) AS `end_time`,
    CAST(IFNULL(logStatus, 'Unknown') AS STRING)  AS `aws.vpc.status_code`,
    CAST(IFNULL(action, 'Unknown') AS STRING) AS `aws.vpc.action`,
    CAST(IFNULL(accountId, 'Unknown') AS STRING) AS `aws.vpc.account-id`

  FROM
    {table_name}
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minute',
  checkpoint_location = '{s3_checkpoint_location}',
  watermark_delay = '1 Minute',
  extra_options = '{ "{table_name}": { "maxFilesPerTrigger": "10" }}'
)