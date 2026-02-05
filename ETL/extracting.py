from tkinter import E
import pandas as pd
import numpy as np
import os
import json

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
    "ETL/Eastern Cape.xlsx",
    "ETL/Special Needs Education Centres.xlsx"
]

def extract_excel_to_json(file_path, output_dir="ETL/json_output"):
    """
    Extract data from Excel file and save as JSON.
    
    Args:
        file_path: Path to the Excel file
        output_dir: Directory to save JSON files
    """
    # Create output directory if it doesn't exist
    os.makedirs(output_dir, exist_ok=True)
    
    try:
        # Read XLSX file
        df = pd.read_excel(file_path)
        
        # Generate output filename from input filename
        base_name = os.path.basename(file_path).replace('.xlsx', '')
        output_path = os.path.join(output_dir, f"{base_name}.json")
        
        # Convert DataFrame to JSON and save
        json_data = df.to_json(orient='records', indent=2)
        
        with open(output_path, 'w', encoding='utf-8') as f:
            f.write(json_data)
        
        print(f"✓ Extracted: {file_path} → {output_path}")
        return True
        
    except Exception as e:
        print(f"✗ Error processing {file_path}: {e}")
        return False

def extract_all_files():
    """Extract all Excel files in file_paths list to JSON format."""
    print("Starting extraction process...\n")
    
    success_count = 0
    for file_path in file_paths:
        if extract_excel_to_json(file_path):
            success_count += 1
    
    print(f"\n✓ Completed: {success_count}/{len(file_paths)} files extracted successfully")

# Run extraction
if __name__ == "__main__":
    extract_all_files()