export const getVpcflowLogsQuery = (
  materializedViewName: string,
  tableName: string,
  refreshInterval: string,
  enableAutoRefresh: boolean,
) => {
  return `CREATE MATERIALIZED VIEW ${materializedViewName} AS
            SELECT
              CAST(IFNULL(srcPort, 0) AS LONG) AS \`aws.vpc.srcport\`,
              CAST(IFNULL(srcAddr, '0.0.0.0') AS STRING) AS \`aws.vpc.srcaddr\`,
              CAST(IFNULL(interfaceId, 'Unknown') AS STRING) AS \`aws.vpc.src-interface_uid\`,
              CAST(IFNULL(dstPort, 0) AS LONG) AS \`aws.vpc.dstport\`,
              CAST(IFNULL(dstAddr, '0.0.0.0') AS STRING) AS \`aws.vpc.dstaddr\`,
              CAST(IFNULL(packets, 0) AS LONG) AS \`aws.vpc.packets\`,
              CAST(IFNULL(bytes, 0) AS LONG) AS \`aws.vpc.bytes\`,
              CAST(FROM_UNIXTIME(start) AS TIMESTAMP) AS \`@timestamp\`,
              CAST(FROM_UNIXTIME(start) AS TIMESTAMP) AS \`start_time\`,
              CAST(FROM_UNIXTIME(start) AS TIMESTAMP) AS \`interval_start_time\`,
              CAST(FROM_UNIXTIME(\`end\`) AS TIMESTAMP) AS \`end_time\`,
              CAST(IFNULL(logStatus, 'Unknown') AS STRING) AS \`aws.vpc.status_code\`,
              CAST(IFNULL(version, 0) AS LONG) AS \`aws.vpc.version\`,
              CAST(IFNULL(action, 'Unknown') AS STRING) AS \`aws.vpc.action\`,
              CAST(IFNULL(protocol, 'Unknown') AS STRING) AS \`aws.vpc.connection.protocol_num\`,
              CAST(IFNULL(accountId, 'Unknown') AS STRING) AS \`aws.vpc.account-id\`

            FROM
              ${tableName}
          WITH (
            auto_refresh = ${enableAutoRefresh},
            refresh_interval = '${refreshInterval}'
          )`;
};

/* Fields I took out for matching the actual data field of nexus team

CAST(IFNULL(pkt_srcAddr, 'Unknown') AS STRING) AS \`aws.vpc.pkt-src-aws-service\`,
CAST(IFNULL(vpc_id, 'Unknown') AS STRING) AS \`aws.vpc.src-vpc_uid\`,
CAST(IFNULL(instance_id, 'Unknown') AS STRING) AS \`aws.vpc.src-instance_uid\`,
CAST(IFNULL(subnet_id, 'Unknown') AS STRING) AS \`aws.vpc.src-subnet_uid\`,
CAST(IFNULL(pkt_dstaddr, 'Unknown') AS STRING) AS \`aws.vpc.pkt-dst-aws-service\`,
CAST(IFNULL(flow_direction, 'Unknown') AS STRING) AS \`aws.vpc.flow-direction\`,
CAST(IFNULL(type, 'Unknown') AS STRING) AS \`aws.vpc.type_name\`,
CAST(IFNULL(traffic_path, 0) AS LONG) AS \`aws.vpc.traffic_path\`,
CAST(IFNULL(az_id, 'Unknown') AS STRING) AS \`aws.vpc.az_id\`,
CAST(IFNULL(region, 'Unknown') AS STRING) AS \`aws.vpc.region\`,
CAST(IFNULL(sublocation_type, 'Unknown') AS STRING) AS \`aws.vpc.sublocation_type\`,
CAST(IFNULL(tcp_flags, '0') AS STRING) AS \`aws.vpc.connection.tcp_flags\`,
CAST(IFNULL(sublocation_id, 'Unknown') AS STRING) AS \`aws.vpc.sublocation_id\`
*/