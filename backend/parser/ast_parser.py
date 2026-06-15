import ast
import re

def get_python_profile(file_path):
    """Extracts comments, classes, and functions into a structured dictionary."""
    profile = {"comments": "", "classes": [], "functions": []}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            source_code = f.read()

        tree = ast.parse(source_code)
        docstring = ast.get_docstring(tree)
        
        if not docstring:
            comments = []
            for line in source_code.split('\n')[:30]:
                clean_line = line.strip()
                if clean_line.startswith('#'):
                    if not clean_line.startswith('#!') and 'coding:' not in clean_line:
                        comments.append(clean_line.lstrip('#').strip())
                elif clean_line and not clean_line.startswith(('import', 'from')):
                    break
            if comments:
                docstring = " ".join(comments)

        if docstring:
            profile["comments"] = docstring

        for node in ast.walk(tree):
            if isinstance(node, ast.ClassDef):
                profile["classes"].append(node.name)
            elif isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                if not node.name.startswith('__'): 
                    profile["functions"].append(node.name)
        
        return profile
    except Exception:
        return profile

def get_js_profile(file_path):
    """Extracts comments, classes, and functions into a structured dictionary."""
    profile = {"comments": "", "classes": [], "functions": []}
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            
        docstring = None
        match = re.search(r'^\s*/\*\*(.*?)\*/', content, re.DOTALL)
        if match:
            docstring = match.group(1).strip()
            docstring = re.sub(r'^\s*\*\s?', '', docstring, flags=re.MULTILINE)
            docstring = re.sub(r'\s+', ' ', docstring)
        else:
            comments = []
            for line in content.split('\n')[:30]:
                clean_line = line.strip()
                if clean_line.startswith('//'):
                    comments.append(clean_line.lstrip('/').strip())
                elif clean_line and not clean_line.startswith('import'):
                    break
            if comments:
                docstring = " ".join(comments)
                
        if docstring:
            profile["comments"] = docstring

        classes = re.findall(r'class\s+([A-Z][a-zA-Z0-9_]*)', content)
        functions = re.findall(r'(?:function\s+([a-zA-Z0-9_]+)\s*\(|const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?(?:\([^)]*\)|[a-zA-Z0-9_]+)\s*=>)', content)
        
        profile["classes"] = classes
        profile["functions"] = [f[0] or f[1] for f in functions if f[0] or f[1]]
        
        return profile
    except Exception:
         return profile


def parse_python_ast(file_path, file_map):
    dependencies = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            tree = ast.parse(f.read())
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    _add_dependency(alias.name.split('.')[0], file_path, file_map, dependencies)
            elif isinstance(node, ast.ImportFrom) and node.module:
                    _add_dependency(node.module.split('.')[0], file_path, file_map, dependencies)
    except Exception:
        pass 
    return dependencies

def _add_dependency(module_name, current_file_path, file_map, dependencies):
    target_file = f"{module_name}.py"
    if target_file in file_map and file_map[target_file] != current_file_path:
        dependencies.append(file_map[target_file])

def parse_javascript_regex(file_path, file_map):
    dependencies = []
    import_pattern = re.compile(r'(?:import.*?from|require\s*\()\s*[\'"]([^\'"]+)[\'"]')
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            for match in import_pattern.findall(f.read()):
                clean_name = match.split('/')[-1] 
                for ext in ['.js', '.jsx', '.ts', '.tsx']:
                    target_file = f"{clean_name}{ext}"
                    if target_file in file_map and file_map[target_file] != file_path:
                        dependencies.append(file_map[target_file])
                        break
    except Exception:
        pass
    return dependencies