import { useState, useCallback } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  const [panelData, setPanelData] = useState(null);
  
  const [repoPath, setRepoPath] = useState(".");
  const [isScanning, setIsScanning] = useState(false);

  const handleScan = () => {
    setIsScanning(true);
    setPanelData(null); 
    
    fetch(`http://127.0.0.1:8000/api/map?path=${encodeURIComponent(repoPath)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          alert(data.error);
          setIsScanning(false);
          return;
        }

        const formattedNodes = data.nodes.map((node, index) => ({
          id: node.id,
          position: { x: index * 280, y: Math.sin(index) * 150 + 200 }, 
          data: { 
            label: (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
                <span style={{ fontSize: '14px', color: '#2c3e50' }}>{node.label}</span>
                <span style={{ fontSize: '11px', color: '#7f8c8d', fontWeight: 'normal' }}>
                  {node.lines_of_code} Lines
                </span>
              </div>
            ),
            full_path: node.full_path 
          },
          style: { 
            background: 'linear-gradient(145deg, #ffffff, #f0f0f0)', 
            border: '1px solid #dcdde1', 
            padding: '15px 20px', 
            borderRadius: '12px',
            fontWeight: 'bold',
            boxShadow: '4px 4px 10px rgba(0,0,0,0.05)',
            cursor: 'pointer',
            minWidth: '150px',
            textAlign: 'center'
          }
        }));

        const formattedEdges = data.edges.map(edge => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          animated: true,
          style: { stroke: '#3498db', strokeWidth: 2 } 
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
        setIsScanning(false);
      })
      .catch(error => {
        console.error("Error fetching map:", error);
        setIsScanning(false);
      });
  };

  const onNodeClick = useCallback((event, node) => {
    setPanelData({ 
      title: node.id, 
      content: "✨ Analyzing logic with Gemini AI..." 
    });

    fetch(`http://127.0.0.1:8000/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ file_path: node.data.full_path })
    })
      .then(response => response.json())
      .then(data => {
        setPanelData({ 
          title: node.id, 
          content: data.summary 
        });
      })
      .catch(() => {
        setPanelData({ title: "Error", content: "Failed to connect to AI." });
      });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#f8f9fa', fontFamily: 'Inter, sans-serif' }}>
      
      {/* NEW: The Header & Control Bar */}
      <div style={{ 
        padding: '15px 30px', 
        backgroundColor: '#ffffff', 
        borderBottom: '1px solid #e1e8ed',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)'
      }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#2c3e50' }}>🧩 Repo Analyzer</h1>
        
        <div style={{ display: 'flex', gap: '10px', width: '50%' }}>
          <input 
            type="text" 
            value={repoPath}
            onChange={(e) => setRepoPath(e.target.value)}
            placeholder="Paste absolute path (e.g. D:\projects\my-app)"
            style={{ 
              flexGrow: 1, 
              padding: '10px 15px', 
              borderRadius: '6px', 
              border: '1px solid #ccd1d9',
              fontSize: '14px',
              outline: 'none'
            }}
          />
          <button 
            onClick={handleScan}
            disabled={isScanning}
            style={{ 
              padding: '10px 20px', 
              backgroundColor: isScanning ? '#95a5a6' : '#2980b9', 
              color: 'white', 
              border: 'none', 
              borderRadius: '6px', 
              cursor: isScanning ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
          >
            {isScanning ? 'Scanning...' : 'Analyze Repo'}
          </button>
        </div>
      </div>

      {/* The Main Canvas Area */}
      <div style={{ flexGrow: 1, display: 'flex', position: 'relative' }}>
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <ReactFlow nodes={nodes} edges={edges} onNodeClick={onNodeClick}>
            <Background color="#bdc3c7" gap={20} size={1.5} />
            <Controls />
          </ReactFlow>
        </div>

        {/* The Upgraded AI Side Panel */}
        {panelData && (
          <div style={{ 
            width: '380px', 
            backgroundColor: '#ffffff', 
            borderLeft: '1px solid #e1e8ed', 
            padding: '25px', 
            boxShadow: '-4px 0 15px rgba(0,0,0,0.03)',
            display: 'flex',
            flexDirection: 'column',
            zIndex: 10
          }}>
            <h2 style={{ marginTop: 0, fontSize: '1.4rem', color: '#2c3e50', borderBottom: '2px solid #ecf0f1', paddingBottom: '10px' }}>
              {panelData.title}
            </h2>
            <div style={{ lineHeight: '1.7', color: '#34495e', flexGrow: 1, fontSize: '15px' }}>
              {panelData.content}
            </div>
            <button 
              onClick={() => setPanelData(null)}
              style={{ 
                padding: '12px', 
                backgroundColor: '#e74c3c', 
                color: 'white', 
                border: 'none', 
                borderRadius: '8px', 
                cursor: 'pointer',
                fontWeight: 'bold',
                marginTop: '20px'
              }}
            >
              Close Panel
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;