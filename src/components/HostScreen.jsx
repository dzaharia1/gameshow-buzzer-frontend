import React, { useEffect, useRef, useState } from 'react';

const WS_URL = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8080';

function HostScreen() {
  const [players, setPlayers] = useState([]);
  const [buzzOrder, setBuzzOrder] = useState([]);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new window.WebSocket(WS_URL);
    ws.current.onopen = () => {
      // Request current state from backend
      ws.current.send(JSON.stringify({ type: 'getState' }));
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'players') {
        setPlayers(data.players);
        setBuzzOrder(data.buzzOrder);
      }
      if (data.type === 'buzzOrder') {
        setBuzzOrder(data.buzzOrder);
      }
    };
    return () => ws.current && ws.current.close();
  }, []);

  const handleReset = () => {
    if (ws.current) {
      ws.current.send(JSON.stringify({ type: 'reset' }));
    }
  };

  // Order players: buzzed first (by buzzOrder), then the rest
  const buzzedPlayers = buzzOrder.map((entry) => {
    const player = players.find(p => p.name === entry.name);
    return player ? { ...player, buzzTime: entry.time } : null;
  }).filter(Boolean);
  const notBuzzedPlayers = players.filter(p => !buzzOrder.some(entry => entry.name === p.name));
  const orderedPlayers = [...buzzedPlayers, ...notBuzzedPlayers];

  return (
    <div style={{ maxWidth: 400, margin: '0 auto', padding: 24, minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <h2>Host Screen</h2>
      <div style={{ width: '100%', marginTop: 32 }}>
        {orderedPlayers.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#888' }}>No players yet</div>
        ) : (
          <ol style={{ padding: 0, listStyle: 'none', width: '100%' }}>
            {orderedPlayers.map((player, idx) => (
              <li
                key={player.name}
                style={{
                  background: buzzedPlayers.some(p => p.name === player.name) ? '#ffe066' : '#eee',
                  border: buzzedPlayers[0] && buzzedPlayers[0].name === player.name ? '3px solid #ff6f00' : '1px solid #ccc',
                  borderRadius: 12,
                  marginBottom: 12,
                  padding: '18px 24px',
                  fontSize: 24,
                  fontWeight: buzzedPlayers.some(p => p.name === player.name) ? 'bold' : 'normal',
                  boxShadow: buzzedPlayers.some(p => p.name === player.name) ? '0 2px 12px rgba(255,223,0,0.15)' : 'none',
                  transition: 'all 0.2s',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <span style={{ flex: 1 }}>{player.name}</span>
                {buzzedPlayers.some(p => p.name === player.name) && (
                  <>
                    <span style={{ marginLeft: 16, color: '#ff6f00', fontSize: 18 }}>
                      #{buzzedPlayers.findIndex(p => p.name === player.name) + 1}
                    </span>
                    <span style={{ marginLeft: 16, color: '#888', fontSize: 16 }}>
                      {(() => {
                        const i = buzzedPlayers.findIndex(p => p.name === player.name);
                        if (i === 0) return '0 ms';
                        return `(+ ${player.buzzTime - buzzedPlayers[i - 1].buzzTime} ms)`;
                      })()}
                    </span>
                  </>
                )}
              </li>
            ))}
          </ol>
        )}
      </div>
      <button
        onClick={handleReset}
        style={{
          marginTop: 40,
          background: '#ff6f00',
          color: 'white',
          fontSize: 28,
          border: 'none',
          borderRadius: 8,
          padding: '18px 48px',
          boxShadow: '0 2px 12px rgba(255,111,0,0.15)',
          cursor: 'pointer',
        }}
      >
        Reset
      </button>
    </div>
  );
}

export default HostScreen; 