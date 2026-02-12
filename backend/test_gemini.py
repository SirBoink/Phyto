import os
import sys
from pathlib import Path
from dotenv import load_dotenv

# Force load .env from current directory
load_dotenv()

api_key = os.getenv("GEMINI_API_KEY")

print(f"Python executable: {sys.executable}")
print(f"Current working directory: {os.getcwd()}")
print(f"GEMINI_API_KEY loaded: {'YES' if api_key else 'NO'}")

if not api_key:
    print("❌ ERROR: GEMINI_API_KEY not found in environment variables.")
    print("Please ensure you have a .env file in this directory with GEMINI_API_KEY=AI... defined.")
    sys.exit(1)

try:
    print("Importing google.genai...")
    from google import genai
    print("✅ Import successful.")
except ImportError as e:
    print(f"❌ ImportError: {e}")
    print("Run: pip install google-genai")
    sys.exit(1)

try:
    print("Initializing client...")
    client = genai.Client(api_key=api_key)
    
    print("Sending test request to 'gemini-3-flash-preview'...")
    response = client.models.generate_content(
        model="gemini-3-flash-preview",
        contents="Hello, suggest a name for a plant shop.",
    )
    print("\n✅ API Call Successful!")
    print(f"Response: {response.text.strip()}")

except Exception as e:
    print(f"\n❌ API Error: {e}")
    print("Common causes:")
    print("1. Invalid API Key")
    print("2. Quota exceeded")
    print("3. Network/Firewall blocking Google APIs")
