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
    margin-bottom: 12px;
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

const ResetButton = styled.button`
  margin-top: 24px;
  background: #ff6f00;
  color: white;
  font-size: 28px;
  border: none;
  border-radius: 8px;
  padding: 18px 48px;
  box-shadow: 0 2px 12px rgba(255,111,0,0.15);
  cursor: pointer;
  width: 100%;
  font-weight: 700;
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

  // Order players: buzzed first (by buzzOrder), then the rest
  const buzzedPlayers = buzzOrder.map((entry) => {
    const player = players.find(p => p.name === entry.name);
    return player ? { ...player, buzzTime: entry.time } : null;
  }).filter(Boolean);
  const notBuzzedPlayers = players.filter(p => !buzzOrder.some(entry => entry.name === p.name));
  const orderedPlayers = [...buzzedPlayers, ...notBuzzedPlayers];

  return (
    <Container>
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