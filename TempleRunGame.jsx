import React, { useEffect, useRef, useState } from "react";

export default function TempleRunGame() {
  const canvasRef = useRef(null);
  const [player, setPlayer] = useState({ lane: 1, y: 220, width: 40, height: 40, jumping: false, sliding: false });
  const [obstacles, setObstacles] = useState([]);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);

  const lanes = [100, 180, 260];

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let animationFrameId;

    function spawnObstacle() {
      const laneIndex = Math.floor(Math.random() * 3);
      setObstacles(prev => [
        ...prev,
        { x: lanes[laneIndex], y: 0, width: 40, height: 40, lane: laneIndex }
      ]);
    }

    const obstacleInterval = setInterval(spawnObstacle, 1500);

    function gameLoop() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = "#333";
      ctx.fillRect(0, 260, canvas.width, 5);

      ctx.fillStyle = "#facc15";
      ctx.fillRect(lanes[player.lane], player.y, player.width, player.height);

      setObstacles(prev =>
        prev.map(ob => ({ ...ob, y: ob.y + 5 })).filter(ob => ob.y < canvas.height)
      );

      obstacles.forEach(ob => {
        ctx.fillStyle = "#ef4444";
        ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
        if (player.lane === ob.lane && player.y < ob.y + ob.height && player.y + player.height > ob.y) {
          setGameOver(true);
          clearInterval(obstacleInterval);
        }
      });

      setScore(prev => prev + 1);
      if (!gameOver) animationFrameId = requestAnimationFrame(gameLoop);
    }

    if (!gameOver) animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      clearInterval(obstacleInterval);
      cancelAnimationFrame(animationFrameId);
    };
  }, [obstacles, player, gameOver]);

  function jump() {
    if (player.jumping || gameOver) return;
    setPlayer(prev => ({ ...prev, jumping: true }));
    let jumpCount = 0;
    const jumpInterval = setInterval(() => {
      jumpCount++;
      setPlayer(prev => ({ ...prev, y: prev.y - (jumpCount < 10 ? 5 : -5) }));
      if (jumpCount >= 20) {
        clearInterval(jumpInterval);
        setPlayer(prev => ({ ...prev, jumping: false, y: 220 }));
      }
    }, 20);
  }

  function slide() {
    if (player.sliding || gameOver) return;
    setPlayer(prev => ({ ...prev, sliding: true, height: 20 }));
    setTimeout(() => {
      setPlayer(prev => ({ ...prev, sliding: false, height: 40 }));
    }, 400);
  }

  function moveLeft() {
    if (player.lane > 0 && !gameOver) {
      setPlayer(prev => ({ ...prev, lane: prev.lane - 1 }));
    }
  }

  function moveRight() {
    if (player.lane < 2 && !gameOver) {
      setPlayer(prev => ({ ...prev, lane: prev.lane + 1 }));
    }
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white">
      <h1 className="text-2xl font-bold mb-2">Temple Run Game</h1>
      <p className="mb-2">Score: {score}</p>
      {gameOver && <p className="text-red-400 text-lg">Game Over!</p>}
      <canvas ref={canvasRef} width={400} height={300} className="border-2 border-yellow-500 rounded-2xl bg-black" />
      <div className="flex gap-4 mt-4">
        <button onClick={moveLeft} className="bg-yellow-400 text-black px-3 py-1 rounded">◀</button>
        <button onClick={jump} className="bg-yellow-400 text-black px-3 py-1 rounded">⤒ Jump</button>
        <button onClick={slide} className="bg-yellow-400 text-black px-3 py-1 rounded">⤓ Slide</button>
        <button onClick={moveRight} className="bg-yellow-400 text-black px-3 py-1 rounded">▶</button>
      </div>
    </div>
  );
}
