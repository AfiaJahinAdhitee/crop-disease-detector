from google import genai
from fastapi import HTTPException
import config  # সেটিংস এরর দূর করতে সরাসরি কনফিগ ইমপোর্ট করা হলো
import json

# config ফাইলে আপনার বন্ধুরা যেভাবে লিখেছে, সেখান থেকে API Key নেওয়া
# যদি এরপরেও এরর আসে, config.settings এর জায়গায় config.Settings() বা config.AppConfig লিখুন
try:
    if hasattr(config, 'settings'):
        api_key = config.settings.GEMINI_API_KEY
    elif hasattr(config, 'Settings'):
        api_key = config.Settings().GEMINI_API_KEY
    else:
        # যদি কোনো ক্লাসের নাম না মিলে, সরাসরি env থেকে খোঁজার ব্যাকআপ
        import os
        api_key = os.getenv("GEMINI_API_KEY")
except Exception:
    import os
    api_key = os.getenv("GEMINI_API_KEY")

# গুগলের লেটেস্ট SDK ক্লায়েন্ট তৈরি করা
client = genai.Client(api_key=api_key)

async def analyze_crop_image(image_bytes: bytes, mime_type: str) -> dict:
    try:
        # AI কে স্পষ্ট নির্দেশনা বা Prompt দেওয়া
        prompt = """
        Analyze this crop leaf image for diseases. 
        Return the response strictly in JSON format with the following keys:
        {
          "disease_detected": true/false,
          "disease_name": "Name of the disease or 'Healthy'",
          "confidence": 0.95,
          "description": "Brief description of the issue.",
          "remedies": ["Step 1", "Step 2"]
        }
        """
        
        # গুগলের নতুন লাইব্রেরির নিয়ম অনুযায়ী content জেনারেট করা
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=[
                genai.types.Part.from_bytes(data=image_bytes, mime_type=mime_type),
                prompt
            ]
        )
        
        # রেজাল্ট ক্লিয়ার করে JSON-এ কনভার্ট করা
        cleaned_text = response.text.replace("```json", "").replace("```", "").strip()
        return json.loads(cleaned_text)
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Gemini AI Error: {str(e)}")