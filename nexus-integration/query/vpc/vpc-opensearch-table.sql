CREATE EXTERNAL TABLE IF NOT EXISTS {table_name} (
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
ROW FORMAT DELIMITED
FIELDS TERMINATED BY ' '
OPTIONS (
  recursiveFileLookup='true'
)
LOCATION '{s3_bucket_location}'