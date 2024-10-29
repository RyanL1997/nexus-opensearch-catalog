# S3 LOCATION FOR SANITY TESTING

### FLINT GA TESTING - DEVELOPMENT

- s3://flint-dataset/waf_sept/  
  s3://flint-dev-seankao/checkpoints/waf_sept_${unique_id}/

- s3://flint-dataset/vpc-sept/  
  s3://flint-dev-seankao/checkpoints/vpc-sept_${unique_id}/

- s3://flint-dataset/cloudtrail_sept/  
  s3://flint-dev-seankao/checkpoints/cloudtrail_${unique_id}/

### NEXUS GA TESTING - SIMPLE DATA FOR QUERY CORRECTNESS TESTING

- s3://nexus-flint-integration/vpclog/  
  s3://nexus-flint-integration/checkpoints/vpc_${unique_id}/

- s3://nexus-flint-integration/waflog/  
  s3://nexus-flint-integration/checkpoints/waf_${unique_id}/

- s3://nexus-flint-integration/cloudtraillog/  
  s3://nexus-flint-integration/checkpoints/cloudtrail_${unique_id}/

### NEXUS GA TESTING - LOG GROUP SAMPLE 10,000 ROWS

- s3://nexus-flint-integration/loggroup_vpc/  
  s3://nexus-flint-integration/checkpoints/loggroup_vpc_${unique_id}/

- s3://nexus-flint-integration/loggroup_cloudtrail/
  s3://nexus-flint-integration/checkpoints/loggroup_cloudtrail_${unique_id}/

- s3://nexus-flint-integration/loggroup_waf/
  s3://nexus-flint-integration/checkpoints/loggroup_waf_${unique_id}/
