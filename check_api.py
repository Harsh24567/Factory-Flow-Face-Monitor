import urllib.request
import urllib.error

try:
    print("Attempting to connect to http://localhost:8000/...")
    with urllib.request.urlopen("http://localhost:8000/") as response:
        print(f"Success! Status: {response.getcode()}")
        print(response.read().decode('utf-8'))
except urllib.error.URLError as e:
    print(f"Failed to connect: {e}")
except Exception as e:
    print(f"An error occurred: {e}")
