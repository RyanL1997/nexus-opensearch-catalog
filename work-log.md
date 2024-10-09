# WORK LOG

This work log is intended to document the progress and experiments related to resolving the index aggregation issue in OpenSearch Zero-ETL integration. The primary goal is to enhance query efficiency when integrating with AWS CloudWatch Log Group data.  

**Please note that this document is for my personal usage only.*

## 10/03/2024

### VPC

- In Opensearch, got the vpc table creation query matches with the nexus integraiton's log group table with csv format
- Created a VPC MV without aggregation (by using the same query in nexus)
- Here is the size calculation of the above MV (`flint_flinttest1_default_original_opensearch_mview`) without aggregation

 ```bash
GET _cat/indices/flint_flinttest1_default_original_opensearch_mview?v&h=index,store.size


index                                              store.size
flint_flinttest1_default_original_opensearch_mview    185.8kb
```

- Created a VPC MV with aggregation
- Here is the size calculation of the above MV (`flint_flinttest1_default_vpc_mv_agg_4_manual_refresh`) with aggregation

```bash
GET _cat/indices/flint_flinttest1_default_vpc_mv_agg_4_manual_refresh?v&h=index,store.size

index                                                store.size
flint_flinttest1_default_vpc_mv_agg_4_manual_refresh    103.5kb
```

## 10/04/2024

### VPC

- From the CloudWatch log group, exported 10,000 rows of data (923 KB in `csv`), and exported into `s3://nexus-flint-integration/loggroup_vpc/`
- Re-create the table based on the above new S3 location named as `aws_vpc_loggroup10000rows`

  ```sql
  CREATE EXTERNAL TABLE IF NOT EXISTS aws_vpc_loggroup10000rows (
    version int,
    accountId string,
    interfaceId string,
    srcAddr string,
    dstAddr string,
    srcPort int,
    dstPort int,
    protocol bigint,
    packets bigint,
    bytes bigint,
    start bigint,
    `end` bigint,
    action string,
    logStatus string
  )
  USING csv
  OPTIONS (
    sep=' ',
    recursiveFileLookup='true'
  )
  LOCATION 's3://nexus-flint-integration/loggroup_vpc/'
  ```

- Re-create the full-log MV aith auto refresh

  ```sql
  CREATE MATERIALIZED VIEW vpc_full_log_mview_10000 AS
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
    aws_vpc_loggroup10000rows
  WITH (
    auto_refresh = true,
    refresh_interval = '15 Minute',
    checkpoint_location = 's3://nexus-flint-integration/checkpoints/vpc_full_log_mview_10000',
    watermark_delay = '1 Minute',
    extra_options = '{ "aws_vpc_loggroup10000rows": { "maxFilesPerTrigger": "10" }}'
  )
  ```
- Once the data gets populated into the above index, we check the size

  ```bash
  GET _cat/indices/flint_flinttest1_default_vpc_full_log_mview_10000?v&h=index,store.size

  index                                             store.size
  flint_flinttest1_default_vpc_full_log_mview_10000        4mb
  ```

- Re-create the aggregated MV with manual refresh - the reason of doing manual refresh for testing is because the water mark delay is causing issues, so that, currently, we will do the manual refresh for testing only

  ```sql
  CREATE MATERIALIZED VIEW vpc_mv_10000_100424_agg
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
        aws_vpc_loggroup10000rows
    )
  GROUP BY
    TUMBLE(`@timestamp`, '1 Minute'),
    action,
    srcAddr,
    dstAddr
  -- WITH (
  --   auto_refresh = true,
  --   refresh_interval = '15 Minute',
  --   watermark_delay = '1 Minute',
  --   checkpoint_location = '{checkpoint_location}'
  -- )
  ```

- Manually refresh the MV so that the data can be populated into MV index

  ```sql
  REFRESH MATERIALIZED VIEW `flinttest1`.`default`.`vpc_mv_10000_100424_agg`
  ```

- Go to the OSD dev tool search the above MV index to check the data

  ```bash
  GET flint_flinttest1_default_vpc_mv_10000_100424_agg/_search


  {
    "took": 861,
    "timed_out": false,
    "_shards": {
      "total": 5,
      "successful": 5,
      "skipped": 0,
      "failed": 0
    },
    "hits": {
      "total": {
        "value": 42,
        "relation": "eq"
      },
      "max_score": 1,
      "hits": [
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "WI_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:33:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "35.203.211.14",
            "aws.vpc.dstaddr": "10.0.9.150",
            "aws.vpc.total_count": 1,
            "aws.vpc.total_bytes": 44,
            "aws.vpc.total_packets": 1
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "WY_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:34:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "10.0.149.211",
            "aws.vpc.dstaddr": "108.138.94.72",
            "aws.vpc.total_count": 1,
            "aws.vpc.total_bytes": 104,
            "aws.vpc.total_packets": 2
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "W4_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:35:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "162.216.149.160",
            "aws.vpc.dstaddr": "10.0.9.150",
            "aws.vpc.total_count": 1,
            "aws.vpc.total_bytes": 44,
            "aws.vpc.total_packets": 1
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "X4_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:35:00.000000+0000",
            "aws.vpc.action": "-",
            "aws.vpc.srcaddr": "-",
            "aws.vpc.dstaddr": "-",
            "aws.vpc.total_count": 2
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "Y4_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:33:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "4.151.38.185",
            "aws.vpc.dstaddr": "10.0.9.150",
            "aws.vpc.total_count": 1,
            "aws.vpc.total_bytes": 40,
            "aws.vpc.total_packets": 1
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "aY_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:34:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "10.0.149.211",
            "aws.vpc.dstaddr": "10.0.9.150",
            "aws.vpc.total_count": 4,
            "aws.vpc.total_bytes": 2690,
            "aws.vpc.total_packets": 36
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "co_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:33:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "10.0.9.150",
            "aws.vpc.dstaddr": "108.138.94.72",
            "aws.vpc.total_count": 1,
            "aws.vpc.total_bytes": 104,
            "aws.vpc.total_packets": 2
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "do_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:34:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "108.138.94.72",
            "aws.vpc.dstaddr": "10.0.9.150",
            "aws.vpc.total_count": 2,
            "aws.vpc.total_bytes": 180,
            "aws.vpc.total_packets": 3
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "eo_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:34:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "10.0.149.211",
            "aws.vpc.dstaddr": "108.138.94.102",
            "aws.vpc.total_count": 3,
            "aws.vpc.total_bytes": 780,
            "aws.vpc.total_packets": 15
          }
        },
        {
          "_index": "flint_flinttest1_default_vpc_mv_10000_100424_agg",
          "_id": "fI_iWZIBq04Kz6SGQ2tB",
          "_score": 1,
          "_source": {
            "start_time": "2024-09-27T21:34:00.000000+0000",
            "aws.vpc.action": "ACCEPT",
            "aws.vpc.srcaddr": "193.163.125.28",
            "aws.vpc.dstaddr": "10.0.9.150",
            "aws.vpc.total_count": 1,
            "aws.vpc.total_bytes": 44,
            "aws.vpc.total_packets": 1
          }
        }
      ]
    }
  }
  ```

- Once the data gets populated, we calculate the size again

  ```bash
  GET _cat/indices/flint_flinttest1_default_vpc_mv_10000_100424_agg?v&h=index,store.size

  index                                            store.size
  flint_flinttest1_default_vpc_mv_10000_100424_agg    226.1kb
  ```

- Check the dashboards to make sure the query correctness, and come to the conclusion that the VPC MV index size has a significant reduction for aggregated query: `4 MB > 226.1 KB`.


## 10/08/2024

### VPC

Instead of fetch the entire dataset for MV setup, considering adding a `WHERE` section for the MV creation query, so that we can enhance the improvement of the doc size of the MV index. Sample query:

```sql
CREATE MATERIALIZED VIEW aws_vpc_20k_oct7_mv AS
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
    aws_vpc_20k_oct7
  WHERE
    FROM_UNIXTIME(start) >= '2024-10-06 00:00:00'
    AND FROM_UNIXTIME(start) <= CURRENT_TIMESTAMP
WITH (
  auto_refresh = true,
  refresh_interval = '15 Minute',
  checkpoint_location = 's3://nexus-flint-integration/checkpoints/loggroup_vpc_oct7_20k',
  watermark_delay = '1 Minute',
  extra_options = '{ "aws_vpc_20k_oct7": { "maxFilesPerTrigger": "10" }}'
);
```

### Cloudtrail

Based on the Nexus log group's table field, the Cloudtrail table should have the following fields:

```
@timestamp
awsRegion
eventCategory
eventID
eventName
eventSource
eventTime
eventType
eventVersion
managementEvent
readOnly
recipientAccountId
requestID
requestParameters.durationSeconds
requestParameters.roleArn
requestParameters.roleSessionName
resources.0.accountId
resources.0.ARN
resources.0.type
responseElements.assumedRoleUser.arn
responseElements.assumedRoleUser.assumedRoleId
responseElements.credentials.accessKeyId
responseElements.credentials.expiration
responseElements.credentials.sessionToken
sharedEventID
sourceIPAddress
userAgent
userIdentity.invokedBy
userIdentity.type
```

- Compare the above table field to the Nexus's Cloudtrail MV creation query:

```sql
`CREATE MATERIALIZED VIEW ${materializedViewName} AS
            SELECT
              \`userIdentity.type\` AS \`aws.cloudtrail.userIdentity.type\`,
              \`userIdentity.principalId\` AS \`aws.cloudtrail.userIdentity.principalId\`,
              \`userIdentity.arn\` AS \`aws.cloudtrail.userIdentity.arn\`,
              \`userIdentity.accountId\` AS \`aws.cloudtrail.userIdentity.accountId\`,
              \`userIdentity.invokedBy\` AS \`aws.cloudtrail.userIdentity.invokedBy\`,
              \`userIdentity.accessKeyId\` AS \`aws.cloudtrail.userIdentity.accessKeyId\`,
              \`userIdentity.userName\` AS \`aws.cloudtrail.userIdentity.userName\`,
              \`userIdentity.sessionContext.attributes.mfaAuthenticated\` AS \`aws.cloudtrail.userIdentity.sessionContext.attributes.mfaAuthenticated\`,
              CAST( \`userIdentity.sessionContext.attributes.creationDate\`  AS TIMESTAMP) AS \`aws.cloudtrail.userIdentity.sessionContext.attributes.creationDate\`,
              \`userIdentity.sessionContext.sessionIssuer.type\` AS \`aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.type\`,
              \`userIdentity.sessionContext.sessionIssuer.principalId\` AS \`aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.principalId\`,
              \`userIdentity.sessionContext.sessionIssuer.arn\` AS \`aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.arn\`,
              \`userIdentity.sessionContext.sessionIssuer.accountId\` AS \`aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.accountId\`,
              \`userIdentity.sessionContext.sessionIssuer.userName\` AS \`aws.cloudtrail.userIdentity.sessionContext.sessionIssuer.userName\`,
              \`userIdentity.sessionContext.ec2RoleDelivery\` AS \`aws.cloudtrail.userIdentity.sessionContext.ec2RoleDelivery\`,

              eventVersion AS \`aws.cloudtrail.eventVersion\`,
              CAST( eventTime AS TIMESTAMP)  AS \`@timestamp\`,
              eventSource AS \`aws.cloudtrail.eventSource\`,
              eventName AS \`aws.cloudtrail.eventName\`,
              eventCategory AS \`aws.cloudtrail.eventCategory\`,
              eventType AS \`aws.cloudtrail.eventType\`,
              eventId AS \`aws.cloudtrail.eventId\`,

              awsRegion AS \`aws.cloudtrail.awsRegion\`,
              sourceIPAddress AS \`aws.cloudtrail.sourceIPAddress\`,
              userAgent,
              errorCode,
              errorMessage,
              requestParameters AS \`aws.cloudtrail.requestParameter\`,
              responseElements AS \`aws.cloudtrail.responseElements\`,
              additionalEventData AS \`aws.cloudtrail.additionalEventData\`,
              requestId AS \`aws.cloudtrail.requestId\`,
              resources AS \`aws.cloudtrail.resources\`,
              apiVersion AS \`aws.cloudtrail.apiVersion\`,
              readOnly AS \`aws.cloudtrail.readOnly\`,
              recipientAccountId AS \`aws.cloudtrail.recipientAccountId\`,
              serviceEventDetails AS \`aws.cloudtrail.serviceEventDetails\`,
              sharedEventId AS \`aws.cloudtrail.sharedEventId\`,
              vpcEndpointId AS \`aws.cloudtrail.vpcEndpointId\`,
              \`tlsDetails.tlsVersion\` AS \`aws.cloudtrail.tlsDetails.tls_version\`,
              \`tlsDetails.cipherSuite\` AS \`aws.cloudtrail.tlsDetailscipher_suite\`,
              \`tlsDetails.clientProvidedHostHeader\` AS \`aws.cloudtrail.tlsDetailsclient_provided_host_header\`
            FROM
              ${tableName}
            WITH (
                auto_refresh = ${enableAutoRefresh},
                refresh_interval = '${refreshInterval}'
            )`;
```
