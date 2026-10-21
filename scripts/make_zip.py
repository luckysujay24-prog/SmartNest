import os
import zipfile
import sys

source_dir = r"C:\PFDS\Community_Hub"
output_zip = r"C:\PFDS\SmartNest.zip"

excluded_dirs = {'node_modules', 'dist', '.git', '.system_generated', '__pycache__'}
excluded_files = {'SmartNest.zip', 'bun.lock'}

print(f"Creating SmartNest ZIP archive from: {source_dir}")
print(f"Target: {output_zip}")

file_count = 0
total_uncompressed = 0

with zipfile.ZipFile(output_zip, 'w', zipfile.ZIP_DEFLATED) as zipf:
    for root, dirs, files in os.walk(source_dir):
        # Exclude directories in-place
        dirs[:] = [d for d in dirs if d not in excluded_dirs]
        
        for file in files:
            if file in excluded_files or file.endswith('.zip'):
                continue
            
            full_path = os.path.join(root, file)
            # Relative path inside the zip file (placed under SmartNest/ folder)
            rel_path = os.path.relpath(full_path, source_dir)
            arcname = os.path.join("SmartNest", rel_path)
            
            zipf.write(full_path, arcname)
            file_count += 1
            total_uncompressed += os.path.getsize(full_path)

zip_size_bytes = os.path.getsize(output_zip)
zip_size_mb = zip_size_bytes / (1024 * 1024)
uncompressed_mb = total_uncompressed / (1024 * 1024)

print("\n===========================================================")
print("  SmartNest ZIP Archive Created Successfully!")
print(f"  Location:     {output_zip}")
print(f"  Total Files:  {file_count}")
print(f"  Zip Size:     {zip_size_mb:.2f} MB ({zip_size_bytes:,} bytes)")
print(f"  Uncompressed: {uncompressed_mb:.2f} MB")
print("===========================================================")
