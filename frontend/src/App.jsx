import { useState, useCallback, useMemo, useEffect } from 'react';
import ReactFlow, { Background, Controls } from 'reactflow';
import dagre from 'dagre';
import 'reactflow/dist/style.css';

import RepoNode from './components/RepoNode';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

const getLayoutedElements = (nodes, edges, direction = 'LR') => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));
  
  dagreGraph.setGraph({ rankdir: direction, ranksep: 200, nodesep: 50 }); 

  nodes.forEach((node) => dagreGraph.setNode(node.id, { width: 250, height: 80 }));
  edges.forEach((edge) => dagreGraph.setEdge(edge.source, edge.target));
  
  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = 'left';
    node.sourcePosition = 'right';
    node.position = { x: nodeWithPosition.x - 125, y: nodeWithPosition.y - 40 };
    return node;
  });
  
  return { nodes, edges };
};

export default function App() {
  const [rawNodes, setRawNodes] = useState([]);
  const [rawEdges, setRawEdges] = useState([]);
  const [nodes, setNodes] = useState([]);
  const [edges, setEdges] = useState([]);
  
  const [repoPath, setRepoPath] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [expandedFolders, setExpandedFolders] = useState(new Set());
  
  const [anchorNode, setAnchorNode] = useState(null); 
  
  const [selectedNode, setSelectedNode] = useState(null);
  const [activeTab, setActiveTab] = useState('code');
  const [fileCode, setFileCode] = useState("");
  
  const [aiQuery, setAiQuery] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);

  const nodeTypes = useMemo(() => ({ customNode: RepoNode }), []);

  useEffect(() => {
    if (!rawNodes.length) return;

    const visibleNodeIds = new Set();
    const visibleEdges = [];

    const targetEdges = new Set(rawEdges.filter(e => e.edge_type === 'structure').map(e => e.target));
    const rootNode = rawNodes.find(n => !targetEdges.has(n.id));
    if (rootNode) visibleNodeIds.add(rootNode.id);

    rawEdges.filter(e => e.edge_type === 'structure').forEach(edge => {
      if (expandedFolders.has(edge.source)) {
        visibleNodeIds.add(edge.source);
        visibleNodeIds.add(edge.target);
        visibleEdges.push(edge);
      }
    });

    rawEdges.filter(e => e.edge_type === 'dependency').forEach(edge => {
      if (visibleNodeIds.has(edge.source) && visibleNodeIds.has(edge.target)) {
        visibleEdges.push(edge);
      }
    });

    const flowNodes = rawNodes.filter(n => visibleNodeIds.has(n.id)).map(node => ({
      id: node.id,
      type: 'customNode', 
      data: { ...node.data, isExpanded: expandedFolders.has(node.id) },
      style: { transition: 'transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)' }
    }));

    const flowEdges = visibleEdges.map(edge => ({
      id: edge.id, source: edge.source, target: edge.target, type: 'smoothstep', animated: edge.edge_type === 'dependency', 
      style: { 
        stroke: edge.edge_type === 'structure' ? '#718093' : '#3498db', 
        strokeWidth: edge.edge_type === 'structure' ? 2 : 2.5,
        strokeDasharray: edge.edge_type === 'dependency' ? '5,5' : '0' 
      }
    }));

    const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(flowNodes, flowEdges);

    if (anchorNode) {
      const newAnchorPos = layoutedNodes.find(n => n.id === anchorNode.id);
      if (newAnchorPos) {
        const dx = anchorNode.x - newAnchorPos.position.x;
        const dy = anchorNode.y - newAnchorPos.position.y;

        layoutedNodes.forEach(n => {
          n.position.x += dx;
          n.position.y += dy;
        });
      }
    }

    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [rawNodes, rawEdges, expandedFolders]);

  const handleScan = () => {
    setIsScanning(true);
    setSelectedNode(null);
    setExpandedFolders(new Set()); 
    setAnchorNode(null); 
    
    fetch(`http://127.0.0.1:8000/api/map?path=${encodeURIComponent(repoPath)}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) { alert(data.error); setIsScanning(false); return; }

        const formattedNodes = data.nodes.map(node => ({
          id: node.id,
          data: { name: node.label, type: node.type, full_path: node.full_path, lines_of_code: node.lines_of_code }
        }));

        setRawNodes(formattedNodes);
        setRawEdges(data.edges);
        
        const targetEdges = new Set(data.edges.filter(e => e.edge_type === 'structure').map(e => e.target));
        const rootNode = formattedNodes.find(n => !targetEdges.has(n.id));
        if (rootNode) setExpandedFolders(new Set([rootNode.id]));

        setIsScanning(false);
      })
      .catch(() => setIsScanning(false));
  };

  const onNodeClick = useCallback((event, node) => {
    if (node.data.type === 'folder') {
      
      setAnchorNode({ id: node.id, x: node.position.x, y: node.position.y });

      setExpandedFolders(prev => {
        const next = new Set(prev);
        if (next.has(node.id)) next.delete(node.id);
        else next.add(node.id);
        return next;
      });
    } else {
      setSelectedNode(node.data);
      setActiveTab('code');
      setFileCode("Loading code...");
      setAiResponse("");
      setAiQuery("");

      fetch(`http://127.0.0.1:8000/api/code`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: node.data.full_path })
      })
        .then(res => res.json())
        .then(data => setFileCode(data.code))
        .catch(() => setFileCode("Failed to load code."));
    }
  }, []);

  const handleAskAi = (overridePrompt = null) => {
    const promptToUse = overridePrompt || aiQuery;
    if (!promptToUse.trim() || !selectedNode) return;
    
    setIsAiLoading(true);
    setAiResponse("Analyzing codebase...");
    setAiQuery(promptToUse); 

    fetch(`http://127.0.0.1:8000/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        file_path: selectedNode.full_path,
        user_prompt: promptToUse
      })
    })
      .then(response => response.json())
      .then(data => { setAiResponse(data.summary); setIsAiLoading(false); })
      .catch(() => { setAiResponse("Failed to connect to AI."); setIsAiLoading(false); });
  };

  return (
    <div style={{ width: '100%', height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#2f3640', fontFamily: 'Inter, sans-serif' }}>
      
      <Navbar repoPath={repoPath} setRepoPath={setRepoPath} handleScan={handleScan} isScanning={isScanning} />

      <div style={{ flexGrow: 1, display: 'flex', position: 'relative', overflow: 'hidden' }}>
        
        <div style={{ flexGrow: 1, position: 'relative' }}>
          <ReactFlow nodeTypes={nodeTypes} nodes={nodes} edges={edges} onNodeClick={onNodeClick} fitView minZoom={0.05}>
            <Background color="#718093" gap={20} size={1.5} />
            <Controls style={{ background: '#1e272e', border: '1px solid #485460', fill: '#f5f6fa' }} />
          </ReactFlow>
        </div>

        <Sidebar 
          selectedNode={selectedNode}
          closePanel={() => setSelectedNode(null)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          fileCode={fileCode}
          aiQuery={aiQuery}
          setAiQuery={setAiQuery}
          handleAskAi={handleAskAi}
          aiResponse={aiResponse}
          isAiLoading={isAiLoading}
        />
        
      </div>
    </div>
  );
}