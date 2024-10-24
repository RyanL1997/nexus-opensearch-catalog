CREATE EXTERNAL TABLE IF NOT EXISTS {table_name} (
    timestamp STRING,
    webaclId STRING,
    action STRING,
    formatVersion INT,

    httpRequest STRUCT<
        clientIp: STRING,
        country: STRING,
        headers: ARRAY<STRUCT<
            name: STRING,
            value: STRING
        >>,
        uri: STRING,
        args: STRING,
        httpVersion: STRING,
        httpMethod: STRING,
        requestId: STRING
    >,

    httpSourceId STRING,
    httpSourceName STRING,

    requestBodySize INT,
    requestBodySizeInspectedByWAF INT,

    terminatingRuleId STRING,
    terminatingRuleType STRING,

    ruleGroupList ARRAY<STRUCT<
        ruleId: STRING,
        ruleAction: STRING
    >>,
    rateBasedRuleList ARRAY<STRUCT<
        ruleId: STRING
    >>,
    nonTerminatingMatchingRules ARRAY<STRUCT<
        ruleId: STRING
    >>
)
USING json
OPTIONS (
    PATH '{s3_bucket_location}',
    recursivefilelookup = 'true'
);
