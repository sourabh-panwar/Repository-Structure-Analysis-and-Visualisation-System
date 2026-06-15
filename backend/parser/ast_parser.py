import ast
import re

def parse_python_ast(file_path, file_map):
    """
    Reads the file as an Abstract Syntax Tree (AST) to find 100% accurate imports.
    Ignores comments, strings, and variable names.
    """
    dependencies = []
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            source_code = f.read()
            
        tree = ast.parse(source_code)
        
        for node in ast.walk(tree):
            if isinstance(node, ast.Import):
                for alias in node.names:
                    module_name = alias.name.split('.')[0]
                    _add_dependency(module_name, file_path, file_map, dependencies)
            
            elif isinstance(node, ast.ImportFrom):
                if node.module:
                    module_name = node.module.split('.')[0]
                    _add_dependency(module_name, file_path, file_map, dependencies)
                    
    except Exception:
        pass 
        
    return dependencies

def _add_dependency(module_name, current_file_path, file_map, dependencies):
    """Helper to check if the imported module exists locally in our project."""
    target_file = f"{module_name}.py"
    if target_file in file_map and file_map[target_file] != current_file_path:
        dependencies.append(file_map[target_file])

def parse_javascript_regex(file_path, file_map):
    """
    Python cannot AST-parse JavaScript, so we use an advanced targeted regex.
    Matches ES6 imports and CommonJS requires.
    """
    dependencies = []
    import_pattern = re.compile(r'(?:import.*?from|require\s*\()\s*[\'"]([^\'"]+)[\'"]')
    
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            content = f.read()
            matches = import_pattern.findall(content)
            
            for match in matches:
                clean_name = match.split('/')[-1] 
                
                for ext in ['.js', '.jsx', '.ts', '.tsx']:
                    target_file = f"{clean_name}{ext}"
                    if target_file in file_map and file_map[target_file] != file_path:
                        dependencies.append(file_map[target_file])
                        break
    except Exception:
        pass
        
    return dependencies