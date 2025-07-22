import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const WS_URL = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8080';

const CenteredContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100vw;
  padding: 5vh 0 15vh 0;
  gap: 5%;

  h2 {
    width: 80%;
    font-size: 24px;
    text-shadow: 0 0 12px rgba(255, 255, 255, 0.5);
    margin-bottom: 12px;
    text-align: center;
  }

  form {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
`;

const Header = styled.img`
  width: 100%;
  padding: 0 12px;
  object-fit: contain;
  margin-bottom: 12px;
`;

const ContentContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  flex: 1;
  width: 100%;
  height: 100%;
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
  margin-bottom: 12px;
`;

const JoinButton = styled.button`
  font-size: 24px;
  padding: 12px 24px;
  border-radius: 8px;
  width: 100%;
  background: #77DFEC;  
  color:rgb(21, 82, 139);
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

  background: ${({ disabled }) => (disabled ? 'rgb(21, 82, 139)' : '#77DFEC')};

  color: ${({ disabled }) => (disabled ? 'white' : 'rgb(21, 82, 139)')};
  font-size: 48px;

  padding: 12px 0 0;
  border: 12px solid ${({ disabled }) => (disabled ? '#fff' : 'rgb(21, 82, 139)')};
  border-radius: 50%;
  margin: 32px;

  width: 200px;
  height: 200px;
  /* box-shadow: 0 4px 24px rgba(122, 170, 216, 0.35); */
  box-shadow: 0 0 18px rgba(255, 255, 255, 0.1);
  box-shadow: 0 0 24px 24px rgba(255, 255, 255, 0.2);
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
      if (data.type === 'hardReset') {
        // Kick player back to name screen
        setName('');
        setInputName('');
        localStorage.removeItem('buzzerName');
        setHasBuzzed(false);
        setBuzzOrder([]);
        // Reset document title
        const baseTitle = document.title.split('-')[0].trim();
        document.title = baseTitle;
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
        <Header src="/header.svg" alt="Logo" />
        <ContentContainer>
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
        </ContentContainer>
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
      <Header src="/header.svg" alt="Logo" />
      <ContentContainer>
        <NameContainer>
          <h2>Ahoy, {name}!</h2>
          <ChangeNameButton onClick={handleChangeName}>Change Name</ChangeNameButton>
        </NameContainer>
        <BuzzButton onClick={handleBuzz} disabled={hasBuzzed}>
          {hasBuzzed ? 'Buzzed!' : 'BUZZ'}
        </BuzzButton>
        <PositionText>
            {hasBuzzed ? `You are #${position} in the queue` : 'Buzz to join the queue'}
        </PositionText>
      </ContentContainer>
    </CenteredContainer>
  );
}

export default BuzzerScreen; 