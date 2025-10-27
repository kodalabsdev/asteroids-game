# Asteroids Game

A classic arcade-style Asteroids game built with React frontend and Node.js/Express backend with SQLite database for score persistence.

![Game Screenshot](https://via.placeholder.com/800x600/000000/FFFFFF?text=Asteroids+Game)

## Features

- **Classic Gameplay**: Navigate your spaceship, shoot asteroids, and avoid collisions
- **Score System**: Earn points by destroying asteroids
- **High Scores**: Persistent leaderboard stored in SQLite database
- **Responsive Controls**: Smooth ship movement and bullet firing
- **Real-time Rendering**: Canvas-based graphics with 60fps gameplay
- **Cross-platform**: Runs in any modern web browser

## Tech Stack

### Frontend
- **React 18** - UI framework
- **Vite** - Build tool and development server
- **HTML5 Canvas** - Game rendering
- **CSS3** - Styling

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **SQLite3** - Database for score storage
- **CORS** - Cross-origin resource sharing

## Prerequisites

Before running this application, make sure you have the following installed:

- **Node.js** (version 16 or higher)
- **npm** (comes with Node.js)

## Installation

1. **Clone the repository:**
  ```bash
  git clone https://github.com/kodalabsdev/asteroids-game.git
  cd asteroids-game
  ```

2. **Install backend dependencies:**
   ```bash
   cd backend
   npm install
   ```

3. **Install frontend dependencies:**
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Application

1. **Start the backend server:**
   ```bash
   cd backend
   npm run dev
   ```
   The backend will start on `http://localhost:3001`

2. **Start the frontend development server:**
   ```bash
   cd ../frontend
   npm run dev
   ```
   The frontend will start on `http://localhost:5173`

3. **Open your browser** and navigate to `http://localhost:5173` to play the game!

## Game Controls

- **A** - Rotate ship left
- **D** - Rotate ship right
- **W** - Thrust forward
- **Spacebar** - Fire bullets

## API Endpoints

The backend provides the following REST API endpoints:

### GET /api/scores
Get all high scores (limited to 10)
```json
{
  "scores": [
    {
      "id": 1,
      "player_name": "Player1",
      "score": 150,
      "created_at": "2025-10-23T10:00:00.000Z"
    }
  ]
}
```

### POST /api/scores
Save a new score
```json
// Request body
{
  "playerName": "PlayerName",
  "score": 100
}

// Response
{
  "id": 123,
  "message": "Score saved successfully"
}
```

### GET /api/scores/top?limit=10
Get top scores with optional limit parameter
```json
{
  "topScores": [
    {
      "player_name": "Player1",
      "score": 150,
      "created_at": "2025-10-23T10:00:00.000Z"
    }
  ]
}
```

### GET /api/health
Health check endpoint
```json
{
  "status": "OK",
  "message": "Asteroids backend is running"
}
```

## Project Structure

```
asteroids-game/
├── backend/
│   ├── package.json
│   ├── server.js          # Express server and API routes
│   └── scores.db          # SQLite database (created automatically)
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   └── src/
│       ├── App.jsx        # Main game component
│       ├── App.css        # Game styles
│       ├── main.jsx       # React entry point
│       └── index.css      # Global styles
├── .gitignore
└── README.md
```

## Game Mechanics

- **Ship Movement**: Physics-based movement with momentum
- **Bullet System**: Limited range projectiles that destroy asteroids
- **Asteroid Behavior**: Random movement with screen wrapping
- **Collision Detection**: Precise collision detection between ship, bullets, and asteroids
- **Score System**: 10 points per asteroid destroyed
- **Game Over**: Collision with asteroid ends the game

## Development

### Frontend Development
```bash
cd frontend
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Backend Development
```bash
cd backend
npm run dev      # Start with nodemon (auto-restart)
npm start        # Start production server
```

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Future Enhancements

- [ ] Multiple asteroid sizes and split behavior
- [ ] Power-ups and special abilities
- [ ] Sound effects and background music
- [ ] Multiplayer support
- [ ] Mobile touch controls
- [ ] Different difficulty levels
- [ ] Ship upgrades and customization

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Classic Asteroids game concept by Atari
- Built with modern web technologies
- Inspired by retro arcade gaming

---

**Enjoy playing Asteroids! 🚀**