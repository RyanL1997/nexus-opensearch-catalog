export const getWafLogsQuery = (
  materializedViewName: string,
  tableName: string,
  refreshInterval: string,
  enableAutoRefresh: boolean,
) => {
  return `CREATE MATERIALIZED VIEW ${materializedViewName} AS
    SELECT
        CAST(FROM_UNIXTIME(\`timestamp\`/ 1000) AS TIMESTAMP) AS \`@timestamp\`,
        formatVersion AS \`aws.waf.formatVersion\`,
        webaclId AS \`aws.waf.webaclId\`,
        terminatingRuleId AS \`aws.waf.terminatingRuleId\`,
        terminatingRuleType AS \`aws.waf.terminatingRuleType\`,
        action AS \`aws.waf.action\`,
        httpSourceName AS \`aws.waf.httpSourceName\`,
        httpSourceId AS \`aws.waf.httpSourceId\`,
        ruleGroupList AS \`aws.waf.ruleGroupList\`,
        rateBasedRuleList AS \`aws.waf.rateBasedRuleList\`,
        nonTerminatingMatchingRules AS \`aws.waf.nonTerminatingMatchingRules\`,
        requestHeadersInserted AS \`aws.waf.requestHeadersInserted\`,
        responseCodeSent AS \`aws.waf.responseCodeSent\`,
        httpRequest AS \`aws.waf.httpRequest\`,
        httpRequest.httpMethod AS \`aws.waf.httpRequest.httpMethod\`,
        httpRequest.uri AS \`aws.waf.httpRequest.uri\`,
        httpRequest.clientIp AS \`aws.waf.httpRequest.clientIp\`,
        labels AS \`aws.waf.labels\`,
        captchaResponse AS \`aws.waf.captchaResponse\`,
        challengeResponse AS \`aws.waf.challengeResponse\`,
        ja3Fingerprint AS \`aws.waf.ja3Fingerprint\`
    FROM
        ${tableName}
    WITH (
      auto_refresh = ${enableAutoRefresh},
      refresh_interval = '${refreshInterval}'
    )`;
};


aws opensearch create-domain \
 --no-verify-ssl \
 --endpoint-url https://es-staging.us-east-1.amazonaws.com \
 --domain-name ryan-osd217-09302024 \
 --region "us-east-1" \
 --engine-version OpenSearch_2.17 \
 --cluster-config InstanceType=m5.xlarge.search,InstanceCount=1,DedicatedMasterEnabled=false,ZoneAwarenessEnabled=false \
 --ebs-options EBSEnabled=true,VolumeType=standard,VolumeSize=14 \
 --encryption-at-rest-options Enabled=true \
 --node-to-node-encryption-options Enabled=true \
 --access-policies '{"Version":"2012-10-17","Statement":[{"Sid":"","Effect":"Allow","Principal":{"AWS":"*"},"Action":"es:*","Resource":"arn:aws:es:us-east-1:709676813244:domain/ryan-osd217-09302024/*","Condition":{"IpAddress":{"aws:SourceIp": ["54.240.198.64/26", "54.239.116.0/23", "52.46.114.0/23", "99.77.50.0/23", "99.82.146.0/23", "54.240.200.0/24", "54.240.193.0/29", "54.222.61.16/28", "99.78.202.0/23", "205.251.237.176/28", "205.251.233.176/29", "205.251.233.48/29", "54.240.197.160/27", "177.72.241.96/27", "54.240.199.0/26", "70.232.82.0/23", "72.21.196.64/29", "54.240.198.0/27", "205.251.237.0/26", "52.95.72.0/23", "176.32.127.128/25", "99.78.146.0/23", "205.251.233.32/28", "54.240.197.0/25", "54.240.199.64/27", "205.251.233.104/29", "54.240.194.0/24", "52.46.210.0/23", "72.21.217.0/24", "52.94.38.0/23", "99.87.10.0/23", "54.240.197.224/28", "52.94.122.0/23", "52.46.249.248/29", "54.239.98.0/23", "54.222.12.0/23", "72.21.199.80/28", "52.46.249.224/29", "99.78.234.0/23", "13.248.50.0/23", "52.82.204.0/23", "205.251.234.32/28", "52.46.250.0/23", "72.21.198.64/29", "54.240.217.0/27", "52.94.86.0/23", "205.251.237.80/28", "54.240.196.0/25", "54.239.48.96/28", "205.251.237.112/28", "54.240.230.128/25", "52.119.146.0/23", "205.251.233.160/28", "54.222.11.0/24", "54.240.193.128/29", "15.221.4.0/23", "54.240.196.128/28", "13.248.18.0/23", "52.94.133.128/25", "54.239.2.128/27", "99.77.18.0/23", "15.221.7.0/24", "54.239.112.0/23", "52.46.82.0/23", "54.239.6.0/25", "177.72.241.160/27", "52.95.24.0/23", "177.72.242.96/27", "205.251.233.232/29", "70.232.114.0/23"]}}}]}' \
 --domain-endpoint-options EnforceHTTPS=true,TLSSecurityPolicy="Policy-Min-TLS-1-0-2019-07"

 aws opensearch describe-domain --domain-name ryan-osd217-09302024 --region "us-east-1" --endpoint-url https://es-staging.us-east-1.amazonaws.com 



 ["--root-ids","staging","--regions","us-east-1","--engine-versions","OS_2.17","--sdpds-stage","gamma","--client-ids","709676813244","--client-override","y"]



 aws opensearch create-domain \
 --no-verify-ssl \
 --endpoint-url https://es-staging.us-east-1.amazonaws.com \
 --domain-name ryan-osd217-09302024-test \
 --region "us-east-1" \
 --engine-version OpenSearch_2.17 \
 --cluster-config InstanceType=m5.xlarge.search,InstanceCount=1,DedicatedMasterEnabled=false,ZoneAwarenessEnabled=false \
 --ebs-options EBSEnabled=true,VolumeType=standard,VolumeSize=14 \
 --encryption-at-rest-options Enabled=true \
 --node-to-node-encryption-options Enabled=true \
 --access-policies '{"Version":"2012-10-17","Statement":[{"Sid":"","Effect":"Allow","Principal":{"AWS":"*"},"Action":"es:*","Resource":"arn:aws:es:us-east-1:757284143292:domain/ryan-osd217-09302024-flintpatch-testing/*","Condition":{"IpAddress":{"aws:SourceIp": ["54.240.198.64/26", "54.239.116.0/23", "52.46.114.0/23", "99.77.50.0/23", "99.82.146.0/23", "54.240.200.0/24", "54.240.193.0/29", "54.222.61.16/28", "99.78.202.0/23", "205.251.237.176/28", "205.251.233.176/29", "205.251.233.48/29", "54.240.197.160/27", "177.72.241.96/27", "54.240.199.0/26", "70.232.82.0/23", "72.21.196.64/29", "54.240.198.0/27", "205.251.237.0/26", "52.95.72.0/23", "176.32.127.128/25", "99.78.146.0/23", "205.251.233.32/28", "54.240.197.0/25", "54.240.199.64/27", "205.251.233.104/29", "54.240.194.0/24", "52.46.210.0/23", "72.21.217.0/24", "52.94.38.0/23", "99.87.10.0/23", "54.240.197.224/28", "52.94.122.0/23", "52.46.249.248/29", "54.239.98.0/23", "54.222.12.0/23", "72.21.199.80/28", "52.46.249.224/29", "99.78.234.0/23", "13.248.50.0/23", "52.82.204.0/23", "205.251.234.32/28", "52.46.250.0/23", "72.21.198.64/29", "54.240.217.0/27", "52.94.86.0/23", "205.251.237.80/28", "54.240.196.0/25", "54.239.48.96/28", "205.251.237.112/28", "54.240.230.128/25", "52.119.146.0/23", "205.251.233.160/28", "54.222.11.0/24", "54.240.193.128/29", "15.221.4.0/23", "54.240.196.128/28", "13.248.18.0/23", "52.94.133.128/25", "54.239.2.128/27", "99.77.18.0/23", "15.221.7.0/24", "54.239.112.0/23", "52.46.82.0/23", "54.239.6.0/25", "177.72.241.160/27", "52.95.24.0/23", "177.72.242.96/27", "205.251.233.232/29", "70.232.114.0/23"]}}}]}' \
 --domain-endpoint-options EnforceHTTPS=true,TLSSecurityPolicy="Policy-Min-TLS-1-0-2019-07"


 ["--root-ids","staging","--regions","us-east-1","--engine-versions","OS_2.17","--sdpds-stage","gamma","--client-ids","757284143292","--client-override","y"]