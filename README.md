# Gameshow Buzzer Frontend

This is the frontend for the Gameshow Buzzer app. It provides two screens:

- **Buzzer Screen**: For players to join the game, enter their name, and buzz in when they know the answer.
- **Host Screen**: For the host to see the list and order of players who buzzed, and to reset the buzzers for the next question.

## Getting Started

### 1. Install dependencies

```
npm install
```

### 2. Set the backend WebSocket URL (optional)

By default, the frontend connects to `ws://localhost:8080` for the backend WebSocket server. To use a different backend URL, create a `.env` file in this directory and add:

```
VITE_BACKEND_URL=ws://your-backend-url:8080
```

### 3. Run the frontend app

```
npm run dev
```

Open your browser to the URL shown in the terminal (usually http://localhost:5173).

- Players should visit `/buzzer` (default route)
- The host should visit `/host`

## Project Structure

- `src/components/BuzzerScreen.jsx` — Player buzzer interface
- `src/components/HostScreen.jsx` — Host control interface

## Notes
- This app is designed for mobile-first use.
- Make sure the backend WebSocket server is running before starting the frontend.
