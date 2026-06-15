import { VscPlay, VscFlame } from "react-icons/vsc";

export default function Navbar({ repoPath, setRepoPath, handleScan, isScanning, toggleHeatmap, isHeatmapActive }) {
  return (
    <div style={{ 
      padding: '15px 30px', 
      backgroundColor: '#111418', 
      borderBottom: '1px solid #2f3640', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'space-between' 
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
        <h1 style={{ margin: 0, fontSize: '1.2rem', color: '#f5f6fa', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ color: '#3498db' }}>🧩</span> Repo Analyzer
        </h1>
      </div>

      <div style={{ display: 'flex', gap: '15px', width: '50%' }}>
        <input 
          type="text" 
          value={repoPath}
          onChange={(e) => setRepoPath(e.target.value)}
          placeholder="Paste absolute path (e.g. D:\projects\my-app)"
          style={{ flexGrow: 1, padding: '10px 15px', borderRadius: '6px', border: '1px solid #353b48', background: '#2f3640', color: '#f5f6fa', outline: 'none' }}
        />
        <button 
          onClick={handleScan} 
          disabled={isScanning} 
          style={{ padding: '10px 20px', backgroundColor: isScanning ? '#7f8fa6' : '#3498db', color: 'white', border: 'none', borderRadius: '6px', cursor: isScanning ? 'not-allowed' : 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <VscPlay /> {isScanning ? 'Scanning...' : 'Scan'}
        </button>
      </div>
    </div>
  );
}