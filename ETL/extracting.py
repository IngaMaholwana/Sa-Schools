from tkinter import E
import pandas as pd
import numpy as np

# these are the paths for the Excel files will iterate over them 
file_paths = [
    
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
 
def EC_TOjson():
    # Read XLSX file
    file_path = "ETL/Eastern Cape.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)

def NC_TOjson():
    # Read XLSX file
    file_path = "ETL/Northern Cape.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)

def FS_TOjson():
    # Read XLSX file
    file_path = "ETL/Free State.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)

def GP_TOjson():
    # Read XLSX file
    file_path = "ETL/Gauteng.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)

def KZN_TOjson():
    # Read XLSX file
    file_path = "ETL/KwaZulu Natal.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)

def LP_TOjson():
    # Read XLSX file
    file_path = "ETL/Limpopo.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)

def MP_TOjson():
    # Read XLSX file
    file_path = "ETL/Mpumalanga.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)

def NW_TOjson():
    # Read XLSX file
    file_path = "ETL/North West.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)

def WC_TOjson():
    # Read XLSX file
    file_path = "ETL/Western Cape.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)
    
def SNEC_TOjson():
    # Read XLSX file
    file_path = "ETL/Special Needs Education Centres.xlsx"
    df = pd.read_excel(file_path)

    # Convert DataFrame to JSON
    json_data = df.to_json(orient='records')
    print(json_data)


# EC_TOjson()