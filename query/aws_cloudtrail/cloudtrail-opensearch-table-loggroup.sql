CREATE EXTERNAL TABLE IF NOT EXISTS {table_name} (
    eventVersion STRING,
    userIdentity STRUCT<
      type: STRING,
      invokedBy: STRING
    >,
    eventTime STRING,
    eventSource STRING,
    eventName STRING,
    awsRegion STRING,
    sourceIPAddress STRING,
    userAgent STRING,
    requestParameters STRUCT<
      bucketName: STRING,
      Host: STRING,
      acl: STRING
    >,
    responseElements STRING,
    additionalEventData STRUCT<
      AuthenticationMethod: STRING,
      bytesTransferredIn: INT,
      bytesTransferredOut: INT,
      CipherSuite: STRING,
      SignatureVersion: STRING,
      x_amz_id_2: STRING
    >,
    requestID STRING,
    eventID STRING,
    readOnly BOOLEAN,
    resources ARRAY<STRUCT<
      accountId: STRING,
      ARN: STRING,
      type: STRING
    >>,
    eventType STRING,
    managementEvent BOOLEAN,
    recipientAccountId STRING,
    sharedEventID STRING,
    eventCategory STRING,
    tlsDetails STRUCT<
      tlsVersion: STRING,
      cipherSuite: STRING,
      clientProvidedHostHeader: STRING
    >
)
USING json
OPTIONS (
   PATH '{s3_bucket_location}',
   recursivefilelookup='true',
   multiline='true'
);
