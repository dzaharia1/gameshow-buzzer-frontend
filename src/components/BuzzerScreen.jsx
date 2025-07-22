import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const WS_URL = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8080';

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-around;
  height: 100vh;
  width: 100vw;
`;

const NameContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const NameInput = styled.input`
  font-size: 24px;
  padding: 12px;
  border-radius: 8px;
  border: 1px solid #ccc;
`;

const JoinButton = styled.button`
  font-size: 24px;
  margin-left: 12px;
  padding: 12px 24px;
  border-radius: 8px;
`;

const ChangeNameButton = styled.button`
  font-size: 18px;
  margin-bottom: 16px;
  background: #eee;
  color: #333;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 8px 20px;
  cursor: pointer;
`;

const BuzzButton = styled.button`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: ${({ disabled }) => (disabled ? '#aaa' : 'red')};
  color: white;
  font-size: 48px;
  border: none;
  border-radius: 50%;
  width: 200px;
  height: 200px;
  margin: 32px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.2);
  cursor: ${({ disabled }) => (disabled ? 'not-allowed' : 'pointer')};
  transition: background 0.2s;
`;

const PositionText = styled.div`
  font-size: 32px;
  margin-top: 16px;
`;

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
        setHasBuzzed(data.buzzOrder.some(entry => entry.name === name));
      }
    };
    return () => ws.current && ws.current.close();
  }, [name]);

  const handleNameSubmit = (e) => {
    e.preventDefault();
    if (inputName.trim()) {
      if (name && name !== inputName.trim() && ws.current) {
        ws.current.send(JSON.stringify({ type: 'changeName', oldName: name, newName: inputName.trim() }));
      }
      setName(inputName.trim());
      localStorage.setItem('buzzerName', inputName.trim());

      // Update the site title to be {title}-{inputName}
      const baseTitle = document.title.split('-')[0].trim();
      document.title = `${baseTitle}-${inputName.trim()}`;

      // Only send if socket is open, otherwise wait for onopen
      if (ws.current && ws.current.readyState === WebSocket.OPEN) {
        ws.current.send(JSON.stringify({ type: 'join', name: inputName.trim() }));
      } else if (ws.current) {
        ws.current.addEventListener('open', function handleOpen() {
          ws.current.send(JSON.stringify({ type: 'join', name: inputName.trim() }));
          ws.current.removeEventListener('open', handleOpen);
        });
      }
    }
  };

  const handleBuzz = () => {
    if (ws.current && name && !hasBuzzed) {
      ws.current.send(JSON.stringify({ type: 'buzz', name }));
    }
  };

  let position = null;
  if (hasBuzzed) {
    position = buzzOrder.findIndex(entry => entry.name === name) + 1;
  }

  if (!name) {
    return (
      <CenteredContainer>
        <h2>Enter your name to join</h2>
        <form onSubmit={handleNameSubmit}>
          <NameInput
            type="text"
            value={inputName}
            onChange={e => setInputName(e.target.value)}
            placeholder="Your name"
            autoFocus
          />
          <JoinButton type="submit">Join</JoinButton>
        </form>
      </CenteredContainer>
    );
  }

  const handleChangeName = () => {
    if (ws.current && name) {
      ws.current.send(JSON.stringify({ type: 'changeName', oldName: name, newName: '' }));
    }
    setName('');
    setInputName('');
    localStorage.removeItem('buzzerName');
    setHasBuzzed(false);
    setBuzzOrder([]);
    // Optionally, notify server of leaving (not implemented in backend)
  };

  return (
    <CenteredContainer>
      <NameContainer>
        <h2>Welcome, {name}!</h2>
        <ChangeNameButton onClick={handleChangeName}>Change Name</ChangeNameButton>
      </NameContainer>
      <BuzzButton onClick={handleBuzz} disabled={hasBuzzed}>
        {hasBuzzed ? 'Buzzed!' : 'BUZZ'}
      </BuzzButton>
      <PositionText>
          {hasBuzzed ? `You are #${position} in the queue` : 'Buzz to join the queue'}
      </PositionText>
    </CenteredContainer>
  );
}

export default BuzzerScreen; 