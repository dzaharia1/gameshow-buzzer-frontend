import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';

const WS_URL = import.meta.env.VITE_BACKEND_URL || 'ws://localhost:8080';

const Container = styled.div`
  width: 100vw;
  height: 100dvh;
  margin: 0 auto;
  padding: 12px 24px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;

  h2 {
    width: 80%;
    font-size: 24px;
    text-shadow: 0 0 12px rgba(0, 42, 69, 0.5);
    margin-bottom: 12px;
    text-align: center;
  }
`;

const PlayerListWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow-y: scroll;
`;

const NoPlayers = styled.div`
  text-align: center;
  color: #888;
`;

const PlayerList = styled.ol`
  padding: 0;
  list-style: none;
  width: 100%;
`;

const PlayerItem = styled.li`
  background: ${({ buzzed }) => (buzzed ? '#ffe066' : '#eee')};
  border: ${({ first }) => (first ? '3px solid #ff6f00' : '1px solid #ccc')};
  border-radius: 12px;
  margin-bottom: 12px;
  padding: 18px 24px;
  font-size: 24px;
  font-weight: ${({ buzzed }) => (buzzed ? 'bold' : 'normal')};
  box-shadow: ${({ buzzed }) => (buzzed ? '0 2px 12px rgba(255,223,0,0.15)' : 'none')};
  transition: all 0.2s;
  display: flex;
  align-items: center;
`;

const PlayerName = styled.span`
  color: #333;
  flex: 1; 
`;

const BuzzOrder = styled.span`
  margin-left: 16px;
  color: #ff6f00;
  font-size: 18px;
`;

const BuzzDiff = styled.span`
  margin-left: 16px;
  color: #888;
  font-size: 16px;
`;

const HardResetButton = styled.button`
  position: absolute;
  top: 12px;
  left: 12px;
  width: 24px;
  height: 24px;

  border: none;
  border-radius: 6px;

  background: #dc3545;
  color: white;
  box-shadow: 0 2px 8px rgba(220,53,69,0.3);
  cursor: pointer;

  z-index: 10;
`;

const ResetButton = styled.button`
  position: absolute;
  bottom: 6dvh;
  margin-top: 24px;
  background: none;
  color: white;
  font-size: 28px;
  border: none;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(255,111,0,0.15);
  cursor: pointer;
  width: 100%;
  font-weight: 700;
  overflow: visible;

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 50%;
    transform: translateY(-27.5%) translateX(-50%);
    width: 110%;
    height: 200%;
    background: url('/buttonbackground.png') no-repeat center center;
    background-size: 80%;
    z-index: -1;
    overflow: visible;
  }
`;

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

  const handleHardReset = () => {
    if (ws.current && window.confirm('Are you sure you want to hard reset? This will kick all players out.')) {
      ws.current.send(JSON.stringify({ type: 'hardReset' }));
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
    <Container>
      <HardResetButton onClick={handleHardReset} />
      <h2>Go for it, Aaron!</h2>
      <PlayerListWrapper>
        {orderedPlayers.length === 0 ? (
          <NoPlayers>No players yet</NoPlayers>
        ) : (
          <PlayerList>
            {orderedPlayers.map((player, idx) => {
              const buzzed = buzzedPlayers.some(p => p.name === player.name);
              const first = buzzedPlayers[0] && buzzedPlayers[0].name === player.name;
              return (
                <PlayerItem key={player.name} buzzed={buzzed} first={first}>
                  <PlayerName>{player.name}</PlayerName>
                  {buzzed && (
                    <>
                      <BuzzOrder>
                        #{buzzedPlayers.findIndex(p => p.name === player.name) + 1}
                      </BuzzOrder>
                      <BuzzDiff>
                        {(() => {
                          const i = buzzedPlayers.findIndex(p => p.name === player.name);
                          if (i === 0) return '0 ms';
                          return `(+ ${player.buzzTime - buzzedPlayers[i - 1].buzzTime} ms)`;
                        })()}
                      </BuzzDiff>
                    </>
                  )}
                </PlayerItem>
              );
            })}
          </PlayerList>
        )}
      </PlayerListWrapper>
      <ResetButton onClick={handleReset}>Reset</ResetButton>
    </Container>
  );
}

export default HostScreen; 