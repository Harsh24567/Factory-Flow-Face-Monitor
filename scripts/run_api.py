"""
Startup script for the Factory Flow Monitor API server
"""
import sys
import os
from pathlib import Path

# Add parent directory to Python path
BASE_DIR = Path(__file__).parent.parent
sys.path.insert(0, str(BASE_DIR))

if __name__ == "__main__":
    print("=" * 70)
    print("FACTORY FLOW MONITOR - API SERVER")
    print("=" * 70)
    print()
    
    # Check if FastAPI is installed
    try:
        import fastapi
        import uvicorn
        print("[OK] FastAPI installed")
    except ImportError:
        print("[ERROR] FastAPI not found!")
        print("Installing dependencies...")
        os.system(f"{sys.executable} -m pip install -r {BASE_DIR}/api/requirements.txt")
        print()
    
    print("Starting API server on http://localhost:8000")
    print("API Documentation: http://localhost:8000/docs")
    print("Connect dashboard to: http://localhost:8000/api")
    print()
    print("Press Ctrl+C to stop the server")
    print("-" * 70)
    print()
    
    # Start the server - use import string for reload to work
    import uvicorn
    
    uvicorn.run(
        "api.main:app",  # Use import string instead of app object
        host="0.0.0.0",
        port=8000,
        log_level="info",
        reload=True
    )
