import React, { useState, useEffect } from 'react';
import './App.css';

const chickenImg = 'https://thumbs.dreamstime.com/z/full-body-brown-chicken-hen-standing-isolated-white-backgroun-background-use-farm-animals-livestock-theme-49741285.jpg?ct=jpeg';
const bananaImg = 'https://thumbs.dreamstime.com/b/bunch-bananas-6175887.jpg?w=768';

function App() {
  const GRID_SIZE = 16;
  const [tiles, setTiles] = useState([]);
  const [gameOver, setGameOver] = useState(false);
  const [winner, setWinner] = useState(null);
  const [coinWinner, setCoinWinner] = useState(null);
  const [pickerVisible, setPickerVisible] = useState(false);
  const [playerTargets, setPlayerTargets] = useState({ 0: null, 1: null });
  const [currentTurn, setCurrentTurn] = useState(null);
  const [typedTitle, setTypedTitle] = useState('');
  const fullTitle = '🐔 Chicken Banana PvP Minesweeper 🍌';

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      setTypedTitle(fullTitle.slice(0, i + 1));
      i++;
      if (i >= fullTitle.length) clearInterval(interval);
    }, 75);
    return () => clearInterval(interval);
  }, []);

  const generateTiles = () => {
    const arr = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      arr.push({
        revealed: false,
        isChicken: Math.random() < 0.5
      });
    }
    return arr;
  };

  useEffect(() => {
    setTiles(generateTiles());
  }, []);

  const runCoinToss = () => {
    const winnerIndex = Math.random() < 0.5 ? 0 : 1;
    setCoinWinner(winnerIndex);
    setPickerVisible(true);
  };

  const chooseTarget = (choice) => {
    const first = coinWinner;
    const second = coinWinner === 0 ? 1 : 0;
    const targets = { ...playerTargets };
    targets[first] = choice;
    targets[second] = choice === 'chicken' ? 'banana' : 'chicken';
    setPlayerTargets(targets);
    setPickerVisible(false);
    setCurrentTurn(first);
  };

  const handleClick = (index) => {
    if (gameOver || currentTurn === null) return;
    if (tiles[index].revealed) return;
    const newTiles = [...tiles];
    newTiles[index] = { ...newTiles[index], revealed: true };
    setTiles(newTiles);
    const opponent = currentTurn === 0 ? 1 : 0;
    const opponentTargetIsChicken = playerTargets[opponent] === 'chicken';
    if (newTiles[index].isChicken === opponentTargetIsChicken) {
      setGameOver(true);
      setWinner(opponent);
      return;
    }
    setCurrentTurn(opponent);
  };

  const resetGame = () => {
    setTiles(generateTiles());
    setGameOver(false);
    setWinner(null);
    setCoinWinner(null);
    setPickerVisible(false);
    setPlayerTargets({ 0: null, 1: null });
    setCurrentTurn(null);
  };

  return (
    <div className="container">
      <h1 className="typewriter">
        {typedTitle}<span className="cursor">|</span>
      </h1>

      {!coinWinner && (
        <div style={{ marginBottom: 16 }}>
          <button onClick={runCoinToss}>Start Coin Toss</button>
        </div>
      )}

      {coinWinner !== null && pickerVisible && (
        <div style={{ marginBottom: 16 }}>
          <p>Player {coinWinner + 1} won the coin toss. Choose your target:</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12 }}>
            <button onClick={() => chooseTarget('chicken')}>Chicken</button>
            <button onClick={() => chooseTarget('banana')}>Banana</button>
          </div>
        </div>
      )}

      {playerTargets[0] && playerTargets[1] && (
        <div style={{ marginBottom: 12 }}>
          <p>Player 1: {playerTargets[0].toUpperCase()} · Player 2: {playerTargets[1].toUpperCase()}</p>
        </div>
      )}

      {currentTurn !== null && !gameOver && (
        <div style={{ marginBottom: 12 }}>
          <p>Player {currentTurn + 1}'s turn — Avoid {playerTargets[currentTurn === 0 ? 1 : 0].toUpperCase()}</p>
        </div>
      )}

      {gameOver && (
        <div style={{ marginBottom: 12 }}>
          <p>Player {winner + 1} wins!</p>
        </div>
      )}

      <div className="grid">
        {tiles.map((tile, index) => (
          <div
            key={index}
            className={`square ${tile.revealed ? (tile.isChicken ? 'chicken' : 'banana') : ''}`}
            onClick={() => handleClick(index)}
            style={{ pointerEvents: pickerVisible || currentTurn === null ? 'none' : undefined }}
          >
            {tile.revealed && (
              <img
                src={tile.isChicken ? chickenImg : bananaImg}
                alt={tile.isChicken ? 'Chicken' : 'Banana'}
              />
            )}
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginTop: 20 }}>
        <button onClick={resetGame}>Restart Game</button>
      </div>
    </div>
  );
}

export default App;
