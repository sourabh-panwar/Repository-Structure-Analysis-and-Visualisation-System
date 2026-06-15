import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv

from parser.analyzer import scan_project
from ai.assistant import analyze_code_with_cache

load_dotenv()
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], 
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class AnalyzeRequest(BaseModel):
    file_path: str
    user_prompt: str

class CodeRequest(BaseModel):
    file_path: str

@app.get("/api/map")
def get_architecture_map(path: str = "."):
    return scan_project(path) 

@app.post("/api/code")
async def get_raw_code(request: CodeRequest):
    try:
        if os.path.isdir(request.file_path):
            return {"code": "// This is a folder. Select a file to view code."}
        
        with open(request.file_path, "r", encoding="utf-8") as f:
            return {"code": f.read()}
    except Exception as e:
        return {"code": f"// Error reading file: {str(e)}"}

@app.post("/api/analyze")
async def analyze_file(request: AnalyzeRequest):
    if os.path.isdir(request.file_path):
        return {"summary": "This is a directory. I can only analyze specific files."}
    
    summary = analyze_code_with_cache(request.file_path, request.user_prompt, GEMINI_API_KEY)
    return {"summary": summary}