import { useState, useEffect, useCallback } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import 'reactflow/dist/style.css';

function App() {
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  const [panelData, setPanelData] = useState(null);

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/map')
      .then(response => response.json())
      .then(data => {
        const formattedNodes = data.nodes.map((node, index) => ({
          id: node.id,
          position: { x: index * 250, y: index * 100 }, 
          data: { label: `${node.label} (LoC: ${node.lines_of_code})` },
          style: { 
            background: '#fff', 
            border: '2px solid #333', 
            padding: '10px', 
            borderRadius: '8px',
            fontWeight: 'bold',
            cursor: 'pointer' 
          }
        }));

        const formattedEdges = data.edges.map(edge => ({
          id: `${edge.source}-${edge.target}`,
          source: edge.source,
          target: edge.target,
          animated: true 
        }));

        setNodes(formattedNodes);
        setEdges(formattedEdges);
      })
      .catch(error => console.error("Error fetching map:", error));
  }, []);

  const onNodeClick = useCallback((event, node) => {
    setPanelData({ 
      title: node.data.label, 
      content: "🤖 AI is analyzing this file..." 
    });

    fetch(`http://127.0.0.1:8000/api/analyze/${node.id}`)
      .then(response => response.json())
      .then(data => {
        setPanelData({ 
          title: node.data.label, 
          content: data.summary 
        });
      })
      .catch(err => {
        setPanelData({ title: "Error", content: "Failed to connect to AI." });
      });
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', backgroundColor: '#f4f4f4' }}>
      
      {/* The Map Area */}
      <div style={{ flexGrow: 1, position: 'relative' }}>
        <ReactFlow 
          nodes={nodes} 
          edges={edges} 
          onNodeClick={onNodeClick} 
        >
          <Background color="#ccc" gap={16} />
          <Controls />
        </ReactFlow>
      </div>

      {/* The AI Side Panel */}
      {panelData && (
        <div style={{ 
          width: '350px', 
          backgroundColor: '#ffffff', 
          borderLeft: '2px solid #ddd', 
          padding: '20px', 
          boxShadow: '-2px 0 10px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <h2 style={{ marginTop: 0, fontSize: '1.2rem', color: '#333' }}>
            {panelData.title}
          </h2>
          <p style={{ lineHeight: '1.6', color: '#555', flexGrow: 1 }}>
            {panelData.content}
          </p>
          <button 
            onClick={() => setPanelData(null)}
            style={{ 
              padding: '10px', 
              backgroundColor: '#e74c3c', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px', 
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Close Panel
          </button>
        </div>
      )}

    </div>
  );
}

export default App;