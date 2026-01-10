import pandas as pd
import numpy as np

# these are the paths for the Excel files will iterate over them 
file_paths = [
    "ETL/Eastern Cape.xlsx", 
    "ETL/Free State.xlsx", 
    "ETL/Gauteng.xlsx", 
    "ETL/KwaZulu Natal.xlsx", 
    "ETL/Limpopo.xlsx",
    "ETL/Mpumalanga.xlsx", 
    "ETL/Northern Cape.xlsx", 
    "ETL/North West.xlsx", 
    "ETL/Western Cape.xlsx",
    "ETL/Special Needs Education Centres.xlsx"
]

# the list of DataFrames from each file
dfs = []

#loop through the file paths and read each file into a DataFrame
for file in file_paths:
    try:
        # Read the excel file
        data = pd.read_excel(file)
        
        # Optional: Add a column so you know which file the data came from
        data['Source_Province'] = file.split('/')[-1].replace('.xlsx', '')
        
        dfs.append(data)

    except Exception as e:
       print(f"Error processing {file}: {e}")


print(f"Successfully read {len(dfs)} files.")











# df = pd.read_excel("ETL/Northern Cape.xlsx")    without the head ingamaholwana@pop-os:~/Desktop/southafricanpublicschools$ /usr/bin/python3 /home/ingamaholwana/Desktop/southafricanpublicschools/ETL/extracting.py
#        NatEmis  Datayear Province  ProvinceCD            Official_Institution_Name Status  ... DemarcationFrom DemarcationTo OldNATEMIS NewNATEMIS Learners2024 Educators2024
# 0    300011202      2024       NC           3        BUCKLANDS (NGK) PRIMÊRE SKOOL   OPEN  ...              NC     Not Moved          0  300011202          166           6.0
# 1    300011204      2024       NC           3                 ISAGO PRIMARY SCHOOL   OPEN  ...              NC     Not Moved          0  300011204         1050          32.0
# 2    300011206      2024       NC           3          MOLEHABANGWE PRIMARY SCHOOL   OPEN  ...              NC     Not Moved          0  300011206          870          28.0
# 3    300011207      2024       NC           3             MONTSHIWA PRIMARY SCHOOL   OPEN  ...              NC     Not Moved          0  300011207          474          17.0
# 4    300011208      2024       NC           3  OLIERIVIER MARIANETTE PRIMÊRE SKOOL   OPEN  ...              NC     Not Moved          0  300011208           83           4.0
# ..         ...       ...      ...         ...                                  ...    ...  ...             ...           ...        ...        ...          ...           ...
# 584  300104019      2024       NC           3                  TSOE PRIMARY SCHOOL   OPEN  ...              NC     Not Moved          0  300104019          292          10.0
# 585  300104042      2024       NC           3       BA-GA PHADIMA SECONDARY SCHOOL   OPEN  ...              NC     Not Moved          0  300104042          427          15.0
# 586  300105057      2024       NC           3                           AB KOLWANE   OPEN  ...              NC     Not Moved          0  300105057          519          21.0
# 587  300106000      2024       NC           3        BANKHARA BODULONG HIGH SCHOOL   OPEN  ...              NC     Not Moved          0  300106000          943          32.0
# 588  300106001      2024       NC           3      KATHU REHOBOTH CHRISTIAN SCHOOL   OPEN  ...              NC     Not Moved          0  300106001          117          18.0

# [589 rows x 49 columns]

# print(df.head())