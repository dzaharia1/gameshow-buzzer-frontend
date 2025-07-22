import React, { useEffect, useRef, useState } from 'react';

const WS_URL = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8080';

function BuzzerScreen() {
  const [name, setName] = useState(localStorage.getItem('buzzerName') || '');
  const [inputName, setInputName] = useState('');
  const [buzzOrder, setBuzzOrder] = useState([]);
  const [hasBuzzed, setHasBuzzed] = useState(false);
  const ws = useRef(null);

  useEffect(() => {
    ws.current = new window.WebSocket(WS_URL);
    ws.current.onopen = () => {
      if (name) {
        ws.current.send(JSON.stringify({ type: 'join', name }));
      }
    };
    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'buzzOrder') {
        setBuzzOrder(data.buzzOrder);
        setHasBuzzed(data.buzzOrder.includes(name));
      }
    };
    return () => ws.current && ws.current.close();
  }, [name]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      setName(inputName.trim());
      localStorage.setItem('buzzerName', inputName.trim());
      ws.current.send(JSON.stringify({ type: 'join', name: inputName.trim() }));
    }
  };

  const handleBuzz = () => {
    if (ws.current && name && !hasBuzzed) {
      ws.current.send(JSON.stringify({ type: 'buzz', name }));
    }
  };

  let position = null;
  if (hasBuzzed) {
    position = buzzOrder.indexOf(name) + 1;
  }

  if (!name) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
        <h2>Enter your name to join</h2>
        <form onSubmit={handleNameSubmit}>
          <input
            type="text"
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            placeholder="Your name"
            style={{ fontSize: 24, padding: 12, borderRadius: 8, border: '1px solid #ccc' }}
            autoFocus
          />
          <button type="submit" style={{ fontSize: 24, marginLeft: 12, padding: '12px 24px', borderRadius: 8 }}>Join</button>
        </form>
      </div>
    );
  }

  const handleChangeName = () => {
    setName('');
    setInputName('');
    localStorage.removeItem('buzzerName');
    setHasBuzzed(false);
    setBuzzOrder([]);
    // Optionally, notify server of leaving (not implemented in backend)
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <h2>Welcome, {name}!</h2>
      <button
        onClick={handleChangeName}
        style={{
          fontSize: 18,
          marginBottom: 16,
          background: '#eee',
          color: '#333',
          border: '1px solid #ccc',
          borderRadius: 8,
          padding: '8px 20px',
          cursor: 'pointer',
        }}
      >
        Change Name
      </button>
      <button
        onClick={handleBuzz}
        disabled={hasBuzzed}
        style={{
          background: hasBuzzed ? '#aaa' : 'red',
          color: 'white',
          fontSize: 48,
          border: 'none',
          borderRadius: '50%',
          width: 200,
          height: 200,
          margin: 32,
          boxShadow: '0 4px 24px rgba(0,0,0,0.2)',
          cursor: hasBuzzed ? 'not-allowed' : 'pointer',
          transition: 'background 0.2s',
        }}
      >
        {hasBuzzed ? 'Buzzed!' : 'BUZZ'}
      </button>
      {hasBuzzed && (
        <div style={{ fontSize: 32, marginTop: 16 }}>
          You are #{position} in the queue
        </div>
      )}
    </div>
  );
}

export default BuzzerScreen; 