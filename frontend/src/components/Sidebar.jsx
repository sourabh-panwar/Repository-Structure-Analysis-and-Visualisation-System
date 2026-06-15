import { VscClose, VscChecklist, VscWand, VscBug } from "react-icons/vsc";

export default function Sidebar({ 
  selectedNode, 
  closePanel, 
  activeTab, 
  setActiveTab, 
  fileCode, 
  aiQuery, 
  setAiQuery, 
  handleAskAi, 
  aiResponse, 
  isAiLoading 
}) {
  if (!selectedNode) return null;

  return (
    <div style={{ 
      width: '450px', 
      minWidth: '450px', 
      flexShrink: 0,     
      backgroundColor: '#1e272e', 
      borderLeft: '1px solid #2f3640', 
      display: 'flex', 
      flexDirection: 'column', 
      zIndex: 10,
      color: '#f5f6fa',
      boxShadow: '-5px 0 20px rgba(0,0,0,0.2)'
    }}>
      
      {/* Header & Tabs */}
      <div style={{ padding: '20px 20px 0 20px', borderBottom: '1px solid #485460' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <h2 style={{ marginTop: 0, marginBottom: '5px', fontSize: '1.2rem', wordBreak: 'break-all' }}>
              📄 {selectedNode.name}
            </h2>
            <p style={{ margin: '0 0 15px 0', fontSize: '12px', color: '#808e9b' }}>
              Lines of Code: {selectedNode.lines_of_code}
            </p>
          </div>
          <button onClick={closePanel} style={{ background: 'none', border: 'none', color: '#808e9b', cursor: 'pointer', padding: '5px' }}>
            <VscClose size={24} />
          </button>
        </div>
        
        <div style={{ display: 'flex', gap: '20px' }}>
          <button onClick={() => setActiveTab('code')} style={{ paddingBottom: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'code' ? '3px solid #3498db' : '3px solid transparent', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'code' ? '#3498db' : '#808e9b' }}>
            Raw Code
          </button>
          <button onClick={() => setActiveTab('ai')} style={{ paddingBottom: '10px', background: 'none', border: 'none', borderBottom: activeTab === 'ai' ? '3px solid #9b59b6' : '3px solid transparent', cursor: 'pointer', fontWeight: 'bold', color: activeTab === 'ai' ? '#9b59b6' : '#808e9b' }}>
            ✨ AI Auditor
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div style={{ padding: '20px', flexGrow: 1, overflowY: 'auto', backgroundColor: '#111418' }}>
        
        {/* RAW CODE TAB */}
        {activeTab === 'code' && (
          <pre style={{ margin: 0, fontSize: '13px', lineHeight: '1.5', color: '#d2dae2', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>
            {fileCode}
          </pre>
        )}

        {/* AI AUDITOR TAB */}
        {activeTab === 'ai' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Quick Actions */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '15px', flexWrap: 'wrap' }}>
              <button onClick={() => handleAskAi("Are there any security vulnerabilities or logical bugs in this code?")} style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #485460', backgroundColor: '#2f3640', color: '#f5f6fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <VscBug color="#ff4757" /> Find Bugs
              </button>
              <button onClick={() => handleAskAi("How can I refactor this code to make it cleaner and more efficient?")} style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #485460', backgroundColor: '#2f3640', color: '#f5f6fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <VscWand color="#2ed573" /> Refactor
              </button>
              <button onClick={() => handleAskAi("Explain this code in the simplest terms possible, like I am 5 years old.")} style={{ padding: '8px 12px', fontSize: '12px', borderRadius: '4px', border: '1px solid #485460', backgroundColor: '#2f3640', color: '#f5f6fa', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px' }}>
                <VscChecklist color="#ffa502" /> ELI5
              </button>
            </div>

            <textarea 
              value={aiQuery}
              onChange={(e) => setAiQuery(e.target.value)}
              placeholder="Or type a custom question here..."
              style={{ width: '100%', height: '80px', padding: '10px', boxSizing: 'border-box', borderRadius: '6px', border: '1px solid #485460', backgroundColor: '#1e272e', color: '#f5f6fa', resize: 'none', outline: 'none', marginBottom: '10px' }}
            />
            
            <button 
              onClick={() => handleAskAi(null)} 
              disabled={isAiLoading || !aiQuery.trim()} 
              style={{ padding: '10px', backgroundColor: '#9b59b6', color: 'white', border: 'none', borderRadius: '6px', cursor: (isAiLoading || !aiQuery.trim()) ? 'not-allowed' : 'pointer', fontWeight: 'bold', marginBottom: '20px' }}
            >
              {isAiLoading ? 'Analyzing...' : 'Ask Question'}
            </button>

            {/* AI Response Output */}
            <div style={{ flexGrow: 1, padding: '15px', backgroundColor: '#1e272e', borderRadius: '8px', border: '1px solid #485460', fontSize: '14px', lineHeight: '1.6', color: '#d2dae2', overflowY: 'auto' }}>
              {aiResponse ? aiResponse : <span style={{ color: '#808e9b', fontStyle: 'italic' }}>Select a quick action or ask a question to begin...</span>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}