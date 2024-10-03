## 10/03/2024
### VPC
- In Opensearch, got the vpc table creation query matches with the nexus integraiton's log group table with csv format
- Created a VPC MV without aggregation (by using the same query in nexus)
- Here is the size calculation of the above MV (`flint_flinttest1_default_original_opensearch_mview`) without aggregation
 ```
GET _cat/indices/flint_flinttest1_default_original_opensearch_mview?v&h=index,store.size


index                                              store.size
flint_flinttest1_default_original_opensearch_mview    185.8kb
```
- Created a VPC MV with aggregation
- Here is the size calculation of the above MV () with aggregation
```
GET _cat/indices/flint_flinttest1_default_vpc_mv_agg_3?v&h=index,store.size


index                                 store.size
flint_flinttest1_default_vpc_mv_agg_3     89.9kb
```