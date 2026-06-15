import os
from .ast_parser import parse_python_ast, parse_javascript_regex

def scan_project(directory_to_scan):
    nodes = []
    edges = []
    
    if not os.path.exists(directory_to_scan):
        return {"error": "Directory does not exist"}

    base_dir = os.path.abspath(directory_to_scan)
    file_map = {} 

    nodes.append({
        "id": base_dir,
        "label": os.path.basename(base_dir) or base_dir,
        "type": "folder",
        "full_path": base_dir
    })

    ignore_dirs = {".next", ".cache", "node_modules", "venv", "__pycache__", ".git", "dist", "build", "public"}
    ignore_exts = (".json", ".map", ".lock", ".png", ".jpg", ".svg", ".ico", ".pyc", ".log", ".env")

    for root, dirs, files in os.walk(base_dir):
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        for d in dirs:
            dir_path = os.path.join(root, d)
            nodes.append({"id": dir_path, "label": d, "type": "folder", "full_path": dir_path})
            edges.append({"id": f"struct_{root}_{dir_path}", "source": root, "target": dir_path, "edge_type": "structure"})

        for f in files:
            if f.endswith(ignore_exts) or "hot-update" in f:
                continue

            file_path = os.path.join(root, f)
            file_map[f] = file_path 
            
            try:
                with open(file_path, "r", encoding="utf-8") as file_obj:
                    loc = sum(1 for _ in file_obj)
            except Exception:
                loc = 0 

            nodes.append({"id": file_path, "label": f, "type": "file", "lines_of_code": loc, "full_path": file_path})
            edges.append({"id": f"struct_{root}_{file_path}", "source": root, "target": file_path, "edge_type": "structure"})

    for node in nodes:
        if node["type"] == "file":
            deps = []
            
            if node["label"].endswith('.py'):
                deps = parse_python_ast(node["full_path"], file_map)
                
            elif node["label"].endswith(('.js', '.ts', '.jsx', '.tsx')):
                deps = parse_javascript_regex(node["full_path"], file_map)

            for target_path in set(deps): 
                edges.append({
                    "id": f"dep_{node['id']}_{target_path}",
                    "source": node["id"],
                    "target": target_path,
                    "edge_type": "dependency"
                })

    return {"nodes": nodes, "edges": edges}