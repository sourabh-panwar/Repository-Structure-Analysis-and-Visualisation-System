import { Handle, Position } from 'reactflow';
import { VscFileCode, VscFolder, VscChevronRight, VscChevronDown } from "react-icons/vsc";
import { SiPython, SiJavascript, SiTypescript, SiReact } from "react-icons/si";

const getIcon = (filename, type, isExpanded) => {
  if (type === 'folder') return isExpanded ? <VscChevronDown size={18} color="#e67e22" /> : <VscChevronRight size={18} color="#e67e22" />;
  if (filename.endsWith('.py')) return <SiPython size={16} color="#3498db" />;
  if (filename.endsWith('.js')) return <SiJavascript size={16} color="#f1c40f" />;
  if (filename.endsWith('.ts')) return <SiTypescript size={16} color="#2980b9" />;
  if (filename.endsWith('.jsx') || filename.endsWith('.tsx')) return <SiReact size={16} color="#61dafb" />;
  return <VscFileCode size={16} color="#95a5a6" />;
};

export default function RepoNode({ data }) {
  const isHighLoc = data.type === 'file' && data.lines_of_code > 300;

  return (
    <div style={{
      background: '#1e272e',
      border: data.type === 'folder' ? '2px solid #e67e22' : '1px solid #485460',
      padding: '12px 16px',
      borderRadius: '8px',
      color: '#d2dae2',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      minWidth: '220px',
      boxShadow: '0 4px 6px rgba(0,0,0,0.3)',
      position: 'relative'
    }}>
      <Handle type="target" position={Position.Left} style={{ background: '#485460' }} />
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexGrow: 1 }}>
        {data.type === 'folder' && <VscFolder size={20} color="#e67e22" />}
        {getIcon(data.name, data.type, data.isExpanded)}
        
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: '14px', fontWeight: 'bold', letterSpacing: '0.5px' }}>{data.name}</span>
          {data.type === 'file' && (
            <span style={{ fontSize: '11px', color: '#808e9b' }}>{data.lines_of_code} Lines</span>
          )}
        </div>
      </div>

      {data.type === 'file' && (
        <div style={{
          background: isHighLoc ? '#ff4757' : '#2ed573',
          color: '#ffffff',
          fontSize: '10px',
          fontWeight: 'bold',
          padding: '4px 8px',
          borderRadius: '12px',
          position: 'absolute',
          top: '-10px',
          right: '-10px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
        }}>
          {isHighLoc ? '🔥 Bloated' : '✓ OK'}
        </div>
      )}

      <Handle type="source" position={Position.Right} style={{ background: '#485460' }} />
    </div>
  );
}