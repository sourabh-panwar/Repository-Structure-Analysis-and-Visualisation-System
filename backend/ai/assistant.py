import os
import hashlib
import json
from google import genai

CACHE_FILE = "ai_cache.json"

def get_file_hash(filepath):
    """Creates a unique fingerprint of the file's current contents."""
    hasher = hashlib.md5()
    try:
        with open(filepath, 'rb') as afile:
            buf = afile.read()
            hasher.update(buf)
        return hasher.hexdigest()
    except:
        return None

def analyze_code_with_cache(file_path, user_prompt, api_key):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            code_text = f.read(10000)
    except Exception as e:
        return f"Cannot read file: {str(e)}"

    file_hash = get_file_hash(file_path)
    cache_key = f"{file_hash}_{user_prompt}"

    cache = {}
    if os.path.exists(CACHE_FILE):
        try:
            with open(CACHE_FILE, "r") as cf:
                cache = json.load(cf)
        except:
            pass

    if cache_key in cache:
        return cache[cache_key] + "\n\n*(Served from local hash cache)*"

    client = genai.Client(api_key=api_key)
    prompt = f"Here is the content of the file:\n\n{code_text}\n\nUser's Question: {user_prompt}"
    
    try:
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        summary = response.text
        
        cache[cache_key] = summary
        with open(CACHE_FILE, "w") as cf:
            json.dump(cache, cf)
            
        return summary
    except Exception as e:
        return f"AI Error: {str(e)}"