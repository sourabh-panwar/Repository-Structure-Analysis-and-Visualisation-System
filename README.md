# 🧩 Repo Analyzer: AI-Powered Codebase Visualizer

## 📖 Description
Repo Analyzer is an enterprise-grade developer tool designed to solve the "Graph Hairball" problem. It transforms any local code repository into an interactive, explorable, and highly optimized visual map. By combining Abstract Syntax Tree (AST) parsing with an integrated AI Auditor, it allows developers to instantly understand complex architectures, trace dependencies, and audit code without leaving the UI.

## ✨ Standout Features
* **Heuristic Code Profiling (Zero-Cost Analysis):** Uses Python's `ast` module and advanced Regex to instantly extract Classes, Functions, and Docstrings from files without making expensive API calls.
* **"Blast Radius" Focus Mode:** Clicking any file dynamically fades out the rest of the canvas, highlighting only its direct upstream and downstream dependencies to eliminate visual noise.
* **Smart Dagre Layout Engine:** Implements "Anchor Math" to ensure that when massive folders are expanded, the UI smoothly glides open while keeping the user's cursor locked to the clicked folder.
* **Integrated AI Auditor:** A split-screen, resizable dark-mode IDE panel that allows developers to view raw code and trigger one-click AI prompts (Find Bugs, Explain the code) using the Gemini API.
* **100% Accurate Dependency Mapping:** Uses actual compiler-level AST parsing (instead of naive string matching) to guarantee that the drawn dependency lines are true imports.

## 🚀 How to Compile and Run

### Prerequisites
* Python 3.9+
* Node.js v18+

# How to Setup--

### 1: Setting up the AI Auditor (Gemini API)
To use the "Ask AI" features (Find Bugs, Explain Code), you need to configure the backend with a Google Gemini API key.
1. Get a free API key from [Google AI Studio](https://aistudio.google.com/).
2. In the `backend` folder of this project, create a new file named `.env`.
3. Open the `.env` file and add your API key like this:
   ```env
   GEMINI_API_KEY=your_actual_api_key_here

### 2. Start the Backend (FastAPI)
1. Open a terminal and navigate to the `backend` folder.
2. Create a virtual environment (optional but recommended): `python -m venv venv`
3. Activate the environment: `source venv/bin/activate` (Mac/Linux) or `venv\Scripts\activate` (Windows)
4. Install dependencies: `pip install -r requirements.txt`
5. *Ensure your `.env` file is configured with your Gemini/AI API key if required.*
6. Start the server:
   ```bash
   uvicorn main:app --reload

   The backend will run on http://127.0.0.1:8000. You can view the API documentation at http://127.0.0.1:8000/docs.

### 3. Start the Frontend (React/Vite)
Step 1: Navigate to the Workspace
Open a new terminal and enter the frontend directory:

Bash

cd frontend

(This folder contains package.json, which acts as the core instruction manual listing all the libraries required for the UI to function).

Step 2: Download Dependencies

Bash

npm install

(Node Package Manager (npm) reads the package.json file and downloads essential structural libraries like react, reactflow (for the interactive graph), and dagre (for the layout math) into a local node_modules folder).

Step 3: Start the Engine

Bash

npm run dev

(This command triggers Vite, a fast modern build tool. Vite bundles the React code and hosts it on a private local web server. It also utilizes Hot Module Replacement to instantly render changes).

Step 4: View the Application
Open your browser and navigate to http://localhost:5173.

### 💡 Assumptions & Additional Features
Assumption - Local Execution: The tool assumes it is running locally on a developer's machine and has read access to the absolute file paths provided in the search bar.

Additional Feature - Visual Segregation: The app purposely uses distinct geometric routing for the graph: smoothstep (right angles) for structural folder hierarchies, and bezier (curved arcs) for cross-file dependencies, creating immediate visual clarity.

Additional Feature - Safe Profiling: If a file contains syntax errors or lacks human-written comments, the backend gracefully falls back to extracting the structural "DNA" (functions/classes) so the UI never breaks.
