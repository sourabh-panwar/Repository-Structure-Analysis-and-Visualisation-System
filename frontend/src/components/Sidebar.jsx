import { useState, useCallback } from 'react';
import { VscClose, VscChecklist, VscBug, VscSymbolClass, VscSymbolMethod, VscInfo } from "react-icons/vsc";

export default function Sidebar({ selectedNode, closePanel, activeTab, setActiveTab, fileCode, aiQuery, setAiQuery, handleAskAi, aiResponse, isAiLoading }) {
  const [width, setWidth] = useState(500);
  
  const startResizing = useCallback((mouseDownEvent) => {
    mouseDownEvent.preventDefault();
    const startWidth = width;
    const startPosition = mouseDownEvent.clientX;

    const onMouseMove = (mouseMoveEvent) => {
      const delta = startPosition - mouseMoveEvent.clientX;
      setWidth(Math.min(Math.max(startWidth + delta, 400), 800));
    };

    const onMouseUp = () => {
      document.removeEventListener("mousemove", onMouseMove);
      document.removeEventListener("mouseup", onMouseUp);
    };

    document.addEventListener("mousemove", onMouseMove);
    document.addEventListener("mouseup", onMouseUp);
  }, [width]);

  if (!selectedNode) return null;

  const profile = selectedNode.profile || {};
  const hasComments = profile.comments && profile.comments.length > 0;
  const hasClasses = profile.classes && profile.classes.length > 0;
  const hasFunctions = profile.functions && profile.functions.length > 0;

  return (
    <div style={{ 
      width: `${width}px`, 
      minWidth: `${width}px`, 
      flexShrink: 0, 
      backgroundColor: '#1e272e', 
      borderLeft: '1px solid #2f3640', 
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 10, 
      color: '#f5f6fa', 
      boxShadow: '-5px 0 20px rgba(0,0,0,0.2)',
      position: 'relative'
    }}>
      
      <div 
        onMouseDown={startResizing}
        style={{
          position: 'absolute',
          left: '-3px',
          top: 0,
          bottom: 0,
          width: '6px',
          cursor: 'ew-resize',
          zIndex: 50,
          backgroundColor: 'transparent'
        }}
        title="Drag to resize"
      />

      <div style={{ padding: '20px 20px 0 20px', borderBottom: '1px solid #485460' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '5px', fontSize: '1.2rem', wordBreak: 'break-all' }}>📄 {selectedNode.name}</h2>
            <p style={{ margin: 0, fontSize: '12px', color: '#808e9b' }}>Lines of Code: {selectedNode.lines_of_code}</p>
          </div>
          <button onClick={closePanel} style={{ background: 'transparent', border: 'none', color: '#808e9b', cursor: 'pointer', padding: '5px', borderRadius: '8px', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#2f3640'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = 'transparent'}><VscClose size={24} /></button>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setActiveTab('overview')} style={{ paddingBottom: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'overview' ? '3px solid #e67e22' : '3px solid transparent', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'overview' ? '#e67e22' : '#808e9b', transition: '0.2s' }}>Overview</button>
          
          <button onClick={() => setActiveTab('code')} style={{ paddingBottom: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'code' ? '3px solid #3498db' : '3px solid transparent', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'code' ? '#3498db' : '#808e9b', transition: '0.2s' }}>Raw Code</button>
          <button onClick={() => setActiveTab('ai')} style={{ paddingBottom: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'ai' ? '3px solid #9b59b6' : '3px solid transparent', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'ai' ? '#9b59b6' : '#808e9b', transition: '0.2s' }}>Ask AI</button>
        </div>
      </div>

      <div style={{ padding: '20px', flexGrow: 1, overflowY: 'auto', backgroundColor: '#111418', display: 'flex', flexDirection: 'column' }}>
        
        {/* Overview Panel */}
        {activeTab === 'overview' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '25px', height: '100%', overflowY: 'auto', paddingRight: '5px' }}>
            
            {hasComments && (
              <div>
                <h3 style={{ fontSize: '13px', color: '#808e9b', marginBottom: '10px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <VscChecklist size={16} /> Comments / Docs
                </h3>
                <div style={{ backgroundColor: '#2f3640', padding: '15px', borderRadius: '10px', fontSize: '13px', color: '#d2dae2', fontStyle: 'italic', borderLeft: '4px solid #3498db', whiteSpace: 'pre-wrap', lineHeight: '1.5' }}>
                  {profile.comments}
                </div>
              </div>
            )}

            {hasClasses && (
              <div>
                <h3 style={{ fontSize: '13px', color: '#808e9b', marginBottom: '10px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <VscSymbolClass size={16} /> Classes & Objects
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.classes.map((cls, idx) => (
                    <span key={idx} style={{ backgroundColor: '#e67e2215', color: '#e67e22', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #e67e2250' }}>{cls}</span>
                  ))}
                </div>
              </div>
            )}

            {hasFunctions && (
              <div>
                <h3 style={{ fontSize: '13px', color: '#808e9b', marginBottom: '10px', marginTop: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <VscSymbolMethod size={16} /> Functions & Methods
                </h3>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {profile.functions.map((fn, idx) => (
                    <span key={idx} style={{ backgroundColor: '#9b59b615', color: '#9b59b6', padding: '6px 12px', borderRadius: '12px', fontSize: '12px', fontWeight: 'bold', border: '1px solid #9b59b650' }}>{fn}</span>
                  ))}
                </div>
              </div>
            )}

            {!hasComments && !hasClasses && !hasFunctions && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, color: '#808e9b', opacity: 0.7, marginTop: '40px' }}>
                <VscInfo size={40} style={{ marginBottom: '10px' }} />
                <span style={{ fontSize: '13px' }}>No comments, classes, or functions detected.</span>
              </div>
            )}
          </div>
        )}

        {/* Raw Code Panel */}
        {activeTab === 'code' && (
          <div style={{ backgroundColor: '#0d1117', padding: '15px', borderRadius: '12px', border: '1px solid #2f3640', overflowX: 'auto', flexGrow: 1, boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.2)' }}>
            <pre style={{ margin: 0, fontSize: '13px', lineHeight: '1.6', color: '#e6edf3', whiteSpace: 'pre', fontFamily: '"Consolas", "Monaco", "Courier New", monospace' }}>{fileCode}</pre>
          </div>
        )}

        {/* Ask AI Panel */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button onClick={() => handleAskAi("Are there any security vulnerabilities or logical bugs in this code?")} style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', border: '1px solid #485460', backgroundColor: '#2f3640', color: '#f5f6fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#353b48'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2f3640'}><VscBug color="#ff4757" /> Find Bugs</button>
              <button onClick={() => handleAskAi("Please explain what this code does in clear, simple terms.")} style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '8px', border: '1px solid #485460', backgroundColor: '#2f3640', color: '#f5f6fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', transition: '0.2s' }} onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#353b48'} onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2f3640'}><VscChecklist color="#ffa502" /> Explain the code</button>
            </div>
            <textarea value={aiQuery} onChange={(e) => setAiQuery(e.target.value)} placeholder="Or type a custom question here..." style={{ width: '100%', height: '80px', padding: '12px', boxSizing: 'border-box', borderRadius: '12px', border: '1px solid #485460', backgroundColor: '#0d1117', color: '#f5f6fa', resize: 'none', outline: 'none', marginBottom: '10px', fontFamily: 'inherit' }} />
            <button onClick={() => handleAskAi(null)} disabled={isAiLoading || !aiQuery.trim()} style={{ padding: '12px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '12px', cursor: (isAiLoading || !aiQuery.trim()) ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginBottom: '20px', transition: '0.2s' }}>{isAiLoading ? 'Analyzing...' : 'Ask Question'}</button>
            <div style={{ flexGrow: 1, padding: '15px', backgroundColor: '#0d1117', borderRadius: '12px', border: '1px solid #485460', fontSize: '14px', lineHeight: '1.6', color: '#d2dae2', overflowY: 'auto' }}>{aiResponse ? aiResponse : <span style={{ color: '#808e9b', fontStyle: 'italic' }}>Select an action to begin...</span>}</div>
          </div>
        )}
      </div>
    </div>
  );
}