import pandas as pd

# Set pandas options to display all rows and columns
pd.set_option("display.max_rows", None)  # Show all rows
pd.set_option("display.max_columns", None)  # Show all columns

# Define the path to the Parquet file
file_path = "sample_data/sample_data.parquet"

# Read the Parquet file into a DataFrame
df = pd.read_parquet(file_path)

# Print the entire DataFrame
print(df)
