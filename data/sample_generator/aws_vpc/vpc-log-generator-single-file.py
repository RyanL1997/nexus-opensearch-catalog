# Description: Generate sample data for AWS VPC flow logs - in a single file
# Usage: For Following Table Creation Query
# CREATE EXTERNAL TABLE IF NOT EXISTS {table_name} (
#     version int,
#     account_id string,
#     interface_id string,
#     srcaddr string,
#     dstaddr string,
#     srcport int,
#     dstport int,
#     protocol bigint,
#     packets bigint,
#     bytes bigint,
#     start bigint,
#     end bigint,
#     action string,
#     log_status string,
#     vpc_id string,
#     subnet_id string,
#     instance_id string,
#     tcp_flags int,
#     type string,
#     pkt_srcaddr string,
#     pkt_dstaddr string,
#     region string,
#     az_id string,
#     sublocation_type string,
#     sublocation_id string,
#     pkt_src_aws_service string,
#     pkt_dst_aws_service string,
#     flow_direction string,
#     traffic_path int
# )
# USING parquet
# LOCATION '{s3_bucket_location}'


import pandas as pd
import numpy as np
import os

# Define the schema with sample column names and types
schema = {
    "version": int,
    "account_id": str,
    "interface_id": str,
    "srcaddr": str,
    "dstaddr": str,
    "srcport": int,
    "dstport": int,
    "protocol": int,
    "packets": int,
    "bytes": int,
    "start": int,
    "end": int,
    "action": str,
    "log_status": str,
    "vpc_id": str,
    "subnet_id": str,
    "instance_id": str,
    "tcp_flags": int,
    "type": str,
    "pkt_srcaddr": str,
    "pkt_dstaddr": str,
    "region": str,
    "az_id": str,
    "sublocation_type": str,
    "sublocation_id": str,
    "pkt_src_aws_service": str,
    "pkt_dst_aws_service": str,
    "flow_direction": str,
    "traffic_path": int
}

# Number of rows of sample data to generate
num_rows = 100000  # Total rows aligned with the 1,000 files version

# Generate random sample data for each column
data = {
    "version": np.random.randint(1, 5, num_rows),
    "account_id": [f"acc-{np.random.randint(1000, 9999)}" for _ in range(num_rows)],
    "interface_id": [f"iface-{np.random.randint(1000, 9999)}" for _ in range(num_rows)],
    "srcaddr": [f"192.168.{np.random.randint(0, 256)}.{np.random.randint(0, 256)}" for _ in range(num_rows)],
    "dstaddr": [f"10.0.{np.random.randint(0, 256)}.{np.random.randint(0, 256)}" for _ in range(num_rows)],
    "srcport": np.random.randint(1024, 65535, num_rows),
    "dstport": np.random.randint(1024, 65535, num_rows),
    "protocol": np.random.randint(1, 255, num_rows),
    "packets": np.random.randint(1, 1000, num_rows),
    "bytes": np.random.randint(1000, 1000000, num_rows),
    "start": np.random.randint(1609459200, 1612137600, num_rows),  # Random timestamps in Jan 2021
    "end": np.random.randint(1609459200, 1612137600, num_rows),
    "action": np.random.choice(["ACCEPT", "REJECT"], num_rows),
    "log_status": np.random.choice(["OK", "ERROR"], num_rows),
    "vpc_id": [f"vpc-{np.random.randint(1000, 9999)}" for _ in range(num_rows)],
    "subnet_id": [f"subnet-{np.random.randint(1000, 9999)}" for _ in range(num_rows)],
    "instance_id": [f"i-{np.random.randint(1000000, 9999999)}" for _ in range(num_rows)],
    "tcp_flags": np.random.randint(0, 255, num_rows),
    "type": np.random.choice(["IPv4", "IPv6"], num_rows),
    "pkt_srcaddr": [f"172.16.{np.random.randint(0, 256)}.{np.random.randint(0, 256)}" for _ in range(num_rows)],
    "pkt_dstaddr": [f"192.168.{np.random.randint(0, 256)}.{np.random.randint(0, 256)}" for _ in range(num_rows)],
    "region": [f"region-{np.random.randint(1, 10)}" for _ in range(num_rows)],
    "az_id": [f"az-{np.random.randint(1, 10)}" for _ in range(num_rows)],
    "sublocation_type": np.random.choice(["ZONE", "SUBZONE"], num_rows),
    "sublocation_id": [f"subloc-{np.random.randint(1000, 9999)}" for _ in range(num_rows)],
    "pkt_src_aws_service": np.random.choice(["EC2", "S3", "Lambda"], num_rows),
    "pkt_dst_aws_service": np.random.choice(["DynamoDB", "RDS", "SQS"], num_rows),
    "flow_direction": np.random.choice(["INBOUND", "OUTBOUND"], num_rows),
    "traffic_path": np.random.randint(1, 5, num_rows)
}

# Create a DataFrame
df = pd.DataFrame(data)

# Define the output directory
output_dir = "sample_vpc_data_single_file"
if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# Save the DataFrame to a Parquet file in the output directory
output_file = os.path.join(output_dir, "sample_vpc_data_100k.parquet")
df.to_parquet(output_file, index=False)

print(f"Sample data generated and saved to '{output_file}'.")
