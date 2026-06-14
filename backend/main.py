import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel 
from dotenv import load_dotenv
from google import genai

load_dotenv()
client = genai.Client(api_key=os.getenv("GEMINI_API_KEY")) 

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

def scan_project(directory_to_scan):
    nodes = []
    edges = []
    file_list = []

    if not os.path.exists(directory_to_scan):
        return {"error": "Directory does not exist"}

    for root, dirs, files in os.walk(directory_to_scan):
        if "venv" in root or "__pycache__" in root or "node_modules" in root or ".git" in root:
            continue
        for file in files:
            if file.endswith(".py"):
                file_list.append(os.path.join(root, file))

    for file_path in file_list:
        file_name = os.path.basename(file_path) 
        
        try:
            with open(file_path, "r", encoding="utf-8") as f:
                lines = f.readlines()
                loc = len(lines)
        except Exception:
            lines = []
            loc = 0
            
        nodes.append({
            "id": file_name,
            "label": file_name,
            "lines_of_code": loc,
            "full_path": file_path 
        })

        for line in lines:
            line = line.strip()
            if line.startswith("import ") or line.startswith("from "):
                for other_file_path in file_list:
                    other_file_name = os.path.basename(other_file_path)
                    module_name = other_file_name.replace(".py", "") 
                    
                    if module_name in line and other_file_name != file_name:
                        edges.append({
                            "source": file_name,
                            "target": other_file_name
                        })
                        
    unique_edges = []
    seen = set()
    for edge in edges:
        identifier = f"{edge['source']}->{edge['target']}"
        if identifier not in seen:
            seen.add(identifier)
            unique_edges.append(edge)

    return {"nodes": nodes, "edges": unique_edges}

@app.get("/api/map")
def get_architecture_map(path: str = "."):
    return scan_project(path) 

@app.post("/api/analyze")
async def analyze_file(request: AnalyzeRequest):
    try:
        with open(request.file_path, "r", encoding="utf-8") as f:
            code_text = f.read()

        prompt = f"Explain what this code does in 3 simple sentences. Do not use technical jargon if possible:\n\n{code_text}"
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=prompt
        )
        
        return {"summary": response.text}
        
    except Exception as e:
        return {"summary": f"AI Error: {str(e)}"}