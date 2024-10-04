# WORK LOG

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

index                                 store.size
flint_flinttest1_default_vpc_mv_agg_4_manual_refresh     103.5kb
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
        aws_vpc
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
