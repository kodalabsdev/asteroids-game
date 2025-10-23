import { useState, useEffect, useRef } from 'react'
import './App.css'

function App() {
  const canvasRef = useRef(null)
  const [score, setScore] = useState(0)
  const [gameOver, setGameOver] = useState(false)
  const [playerName, setPlayerName] = useState('')
  const [showScoreForm, setShowScoreForm] = useState(false)
  const [highScores, setHighScores] = useState([])
  const [isSaving, setIsSaving] = useState(false)

  // Game state
  const gameStateRef = useRef({
    ship: { x: 400, y: 300, angle: 0, vx: 0, vy: 0 },
    bullets: [],
    asteroids: [],
    keys: {}
  })

  // Game constants
  const SHIP_SIZE = 20
  const BULLET_SPEED = 5
  const ASTEROID_SPEED = 1
  const CANVAS_WIDTH = 800
  const CANVAS_HEIGHT = 600

  // API functions
  const saveScore = async (name, gameScore) => {
    try {
      const response = await fetch('http://localhost:3001/api/scores', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          playerName: name,
          score: gameScore
        })
      })
      const data = await response.json()
      if (response.ok) {
        console.log('Score saved successfully:', data)
        fetchHighScores() // Refresh high scores after saving
      } else {
        console.error('Failed to save score:', data.error)
      }
    } catch (error) {
      console.error('Error saving score:', error)
    }
  }

  const fetchHighScores = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/scores/top?limit=10')
      const data = await response.json()
      if (response.ok) {
        setHighScores(data.topScores || [])
      }
    } catch (error) {
      console.error('Error fetching high scores:', error)
    }
  }

  // Initialize asteroids
  const createAsteroid = () => ({
    x: Math.random() * CANVAS_WIDTH,
    y: Math.random() * CANVAS_HEIGHT,
    vx: (Math.random() - 0.5) * ASTEROID_SPEED,
    vy: (Math.random() - 0.5) * ASTEROID_SPEED,
    size: 30 + Math.random() * 20
  })

  // Initialize game and fetch high scores
  useEffect(() => {
    const gameState = gameStateRef.current
    gameState.asteroids = Array.from({ length: 5 }, createAsteroid)
    fetchHighScores()
  }, [])

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = true
      // Prevent default behavior for game keys
      if (e.key === ' ') {
        e.preventDefault()
      }
    }

    const handleKeyUp = (e) => {
      gameStateRef.current.keys[e.key.toLowerCase()] = false
    }

    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
    }
  }, [])

  // Game loop
  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animationId

    const gameLoop = () => {
      const gameState = gameStateRef.current

      // Clear canvas
      ctx.fillStyle = '#000'
      ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT)

      // Handle input
      if (gameState.keys['a']) gameState.ship.angle -= 0.1
      if (gameState.keys['d']) gameState.ship.angle += 0.1
      if (gameState.keys['w']) {
        gameState.ship.vx += Math.cos(gameState.ship.angle) * 0.1
        gameState.ship.vy += Math.sin(gameState.ship.angle) * 0.1
      }
      if (gameState.keys[' ']) {
        // Fire bullet
        gameState.bullets.push({
          x: gameState.ship.x,
          y: gameState.ship.y,
          vx: Math.cos(gameState.ship.angle) * BULLET_SPEED,
          vy: Math.sin(gameState.ship.angle) * BULLET_SPEED
        })
        gameState.keys[' '] = false // Prevent continuous firing
      }

      // Update ship position
      gameState.ship.x += gameState.ship.vx
      gameState.ship.y += gameState.ship.vy

      // Wrap around screen
      if (gameState.ship.x < 0) gameState.ship.x = CANVAS_WIDTH
      if (gameState.ship.x > CANVAS_WIDTH) gameState.ship.x = 0
      if (gameState.ship.y < 0) gameState.ship.y = CANVAS_HEIGHT
      if (gameState.ship.y > CANVAS_HEIGHT) gameState.ship.y = 0

      // Update bullets
      gameState.bullets = gameState.bullets.filter(bullet => {
        bullet.x += bullet.vx
        bullet.y += bullet.vy
        return bullet.x >= 0 && bullet.x <= CANVAS_WIDTH && bullet.y >= 0 && bullet.y <= CANVAS_HEIGHT
      })

      // Update asteroids
      gameState.asteroids.forEach(asteroid => {
        asteroid.x += asteroid.vx
        asteroid.y += asteroid.vy

        // Wrap around screen
        if (asteroid.x < 0) asteroid.x = CANVAS_WIDTH
        if (asteroid.x > CANVAS_WIDTH) asteroid.x = 0
        if (asteroid.y < 0) asteroid.y = CANVAS_HEIGHT
        if (asteroid.y > CANVAS_HEIGHT) asteroid.y = 0
      })

      // Check collisions
      gameState.bullets.forEach((bullet, bulletIndex) => {
        gameState.asteroids.forEach((asteroid, asteroidIndex) => {
          const dx = bullet.x - asteroid.x
          const dy = bullet.y - asteroid.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < asteroid.size / 2) {
            // Remove bullet and asteroid
            gameState.bullets.splice(bulletIndex, 1)
            gameState.asteroids.splice(asteroidIndex, 1)
            setScore(prev => prev + 10)
            // Add new asteroid
            gameState.asteroids.push(createAsteroid())
          }
        })
      })

      // Check ship collision with asteroids
      gameState.asteroids.forEach(asteroid => {
        const dx = gameState.ship.x - asteroid.x
        const dy = gameState.ship.y - asteroid.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        if (distance < asteroid.size / 2 + SHIP_SIZE / 2) {
          setShowScoreForm(true)
        }
      })

      // Draw ship
      ctx.save()
      ctx.translate(gameState.ship.x, gameState.ship.y)
      ctx.rotate(gameState.ship.angle)
      ctx.strokeStyle = '#fff'
      ctx.beginPath()
      ctx.moveTo(SHIP_SIZE, 0)
      ctx.lineTo(-SHIP_SIZE/2, -SHIP_SIZE/2)
      ctx.lineTo(-SHIP_SIZE/2, SHIP_SIZE/2)
      ctx.closePath()
      ctx.stroke()
      ctx.restore()

      // Draw bullets
      ctx.fillStyle = '#fff'
      gameState.bullets.forEach(bullet => {
        ctx.beginPath()
        ctx.arc(bullet.x, bullet.y, 2, 0, Math.PI * 2)
        ctx.fill()
      })

      // Draw asteroids
      ctx.strokeStyle = '#fff'
      gameState.asteroids.forEach(asteroid => {
        ctx.beginPath()
        ctx.arc(asteroid.x, asteroid.y, asteroid.size / 2, 0, Math.PI * 2)
        ctx.stroke()
      })

      if (!gameOver && !showScoreForm) {
        animationId = requestAnimationFrame(gameLoop)
      }
    }

    gameLoop()

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [gameOver, showScoreForm])

  const saveScoreHandler = async () => {
    if (!playerName.trim()) {
      alert('Please enter your name')
      return
    }

    setIsSaving(true)
    await saveScore(playerName.trim(), score)
    setIsSaving(false)
    setGameOver(true)
    setShowScoreForm(false)
  }

  const resetGame = () => {
    const gameState = gameStateRef.current
    gameState.ship = { x: 400, y: 300, angle: 0, vx: 0, vy: 0 }
    gameState.bullets = []
    gameState.asteroids = Array.from({ length: 5 }, createAsteroid)
    setScore(0)
    setGameOver(false)
    setShowScoreForm(false)
    setPlayerName('')
  }

  return (
    <div className="app">
      <div className="game-container">
        <div className="score">Score: {score}</div>
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="game-canvas"
        />
        {showScoreForm && (
          <div className="score-form">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <div className="form-group">
              <label htmlFor="playerName">Enter your name:</label>
              <input
                type="text"
                id="playerName"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                maxLength={20}
                placeholder="Your name"
                autoFocus
              />
            </div>
            <div className="form-buttons">
              <button onClick={saveScoreHandler} disabled={isSaving}>
                {isSaving ? 'Saving...' : 'Save Score'}
              </button>
              <button onClick={() => {
                setGameOver(true)
                setShowScoreForm(false)
              }}>Skip</button>
            </div>
          </div>
        )}
        {gameOver && !showScoreForm && (
          <div className="game-over">
            <h2>Game Over!</h2>
            <p>Final Score: {score}</p>
            <button onClick={resetGame}>Play Again</button>
          </div>
        )}
      </div>
      <div className="controls">
        <p>Controls: A/D to turn, W for thrust, Space to fire</p>
      </div>
      {highScores.length > 0 && (
        <div className="high-scores">
          <h3>High Scores</h3>
          <ol>
            {highScores.map((entry, index) => (
              <li key={index}>
                {entry.player_name}: {entry.score}
              </li>
            ))}
          </ol>
        </div>
      )}
    </div>
  )
}

export default App