from pathlib import Path

# Base dataset path
BASE_PATH = Path("data/known_faces")

# Workers to rename
workers = ["Worker_001", "Worker_002"]

# Supported image formats
image_extensions = [".jpg", ".jpeg", ".png"]

for worker in workers:
    worker_path = BASE_PATH / worker
    
    if not worker_path.exists():
        print(f"[WARNING] {worker_path} does not exist. Skipping...")
        continue

    # Get all image files
    images = [
        f for f in worker_path.iterdir()
        if f.suffix.lower() in image_extensions
    ]

    # Sort to keep order consistent
    images.sort()

    print(f"\nRenaming images in {worker}...")

    for idx, image_path in enumerate(images, start=1):
        new_name = f"{idx:03d}{image_path.suffix.lower()}"  # 001, 002, 003...
        new_path = worker_path / new_name
        
        image_path.rename(new_path)
        print(f"{image_path.name} → {new_name}")

print("\nDone renaming all images.")
