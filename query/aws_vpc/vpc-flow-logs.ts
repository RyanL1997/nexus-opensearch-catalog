export const getVpcflowLogsQuery = (
  materializedViewName: string,
  tableName: string,
  refreshInterval: string,
) => {
  return `CREATE MATERIALIZED VIEW ${materializedViewName} AS
  SELECT
    TUMBLE(\`@timestamp\`, '5 Minute').start AS \`start_time\`,
    action AS \`aws.vpc.action\`,
    srcAddr AS \`aws.vpc.srcaddr\`,
    dstAddr AS \`aws.vpc.dstaddr\`,
    protocol AS \`aws.vpc.protocol\`,
    COUNT(*) AS \`aws.vpc.total_count\`,
    SUM(bytes) AS \`aws.vpc.total_bytes\`,
    SUM(packets) AS \`aws.vpc.total_packets\`
  FROM (
    SELECT
      COALESCE(CAST(\`action\` AS STRING), 'UNKNOWN_ACTION') AS action,
      COALESCE(CAST(\`srcAddr\` AS STRING), '0.0.0.0') AS srcAddr,
      COALESCE(CAST(\`dstAddr\` AS STRING), '0.0.0.0') AS dstAddr,
      COALESCE(CAST(\`bytes\` AS LONG), 0) AS bytes,
      COALESCE(CAST(\`packets\` AS LONG), 0) AS packets,
      COALESCE(CAST(\`protocol\` AS STRING), 'UNKNOWN_PROTOCOL') AS protocol,
      CAST(FROM_UNIXTIME(start) AS TIMESTAMP) AS \`@timestamp\`
    FROM
      ${tableName}
  )
  GROUP BY
    TUMBLE(\`@timestamp\`, '5 Minute'),
    action,
    srcAddr,
    dstAddr,
    protocol
  WITH (
    auto_refresh = true,
    refresh_interval = '${refreshInterval}',
    watermark_delay = '1 Minute'
  )`;
};
