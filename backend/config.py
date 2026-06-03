import os
from dotenv import load_dotenv

load_dotenv()
# this function reads the .env file and loads all the key-value pairs into the system's en-variables so Python can access them with os.getenv().

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_SERVICE_KEY = os.getenv("SUPABASE_SERVICE_KEY")
 
# Sanity check on startup — crashes early if a key is missing
if not GEMINI_API_KEY:
    raise ValueError("Missing GEMINI_API_KEY in .env")
if not SUPABASE_URL:
    raise ValueError("Missing SUPABASE_URL in .env")
if not SUPABASE_SERVICE_KEY:
    raise ValueError("Missing SUPABASE_SERVICE_KEY in .env")