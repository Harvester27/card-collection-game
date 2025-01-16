'use client';

import React, { useState, useEffect } from 'react';

const ConfettiParticle = ({ color }) => {
  const style = {
    position: 'fixed',
    width: '8px',
    height: '8px',
    backgroundColor: color,
    borderRadius: '50%',
    pointerEvents: 'none',
    animation: `confetti-fall ${2 + Math.random() * 2}s linear forwards`,
    left: `${Math.random() * 100}vw`,
    top: '-10px',
  };

  return <div style={style} />;
};

const CardGame = () => {
  const [unlockedCards, setUnlockedCards] = useState(new Set());
  const [showCollection, setShowCollection] = useState(false);
  const [currentCards, setCurrentCards] = useState([]);
  const [confetti, setConfetti] = useState([]);
  const [money, setMoney] = useState(100);
  const [selectedCard, setSelectedCard] = useState(null);
  const [showTeamSelection, setShowTeamSelection] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState({
    goalkeeper: null,
    defenders: [],
    forwards: []
  });
  const [showMatch, setShowMatch] = useState(false);
  const [matchState, setMatchState] = useState({
    period: 1,
    time: 1200,
    score: { home: 0, away: 0 },
    events: [],
    isPlaying: false,
    gameSpeed: 1,
    playerStats: {
      goals: {},
      assists: {},
      saves: {},
      saveAccuracy: {}
    },
    penalties: []
  });
  
  const cards = [
    { id: 1, name: "Štěpánovský", image: "/Images/Stepanovsky1.jpg", rarity: "common", position: "defender" },
    { id: 2, name: "Nováková", image: "/Images/Novakova1.jpg", rarity: "common", position: "goalkeeper" },
    { id: 3, name: "Coufal", image: "/Images/Coufal3.jpg", rarity: "legendary", position: "defender" },
    { id: 4, name: "Dlugopolský", image: "/Images/Dlugopolsky1.jpg", rarity: "rare", position: "forward" },
    { id: 5, name: "Petrov", image: "/Images/Petrov1.jpg", rarity: "common", position: "forward" },
    { id: 6, name: "Nistor", image: "/Images/Nistor1.jpg", rarity: "rare", position: "goalkeeper" },
    { id: 7, name: "Materna", image: "/Images/Materna1.jpg", rarity: "epic", position: "forward" }
  ];

  const packPrices = {
    3: 30,
    5: 50,
    7: 70
  };

  const gameSpeedOptions = [1, 2, 4, 8, 16, 32, 64];

  const setGameSpeed = (speed) => {
    setMatchState(prev => ({ ...prev, gameSpeed: speed }));
  };

  const createConfetti = () => {
    const colors = ['#FFD700', '#FFA500', '#FF4500'];
    const particles = Array.from({ length: 50 }, (_, i) => ({
      id: `confetti-${Date.now()}-${i}`,
      color: colors[Math.floor(Math.random() * colors.length)]
    }));
    setConfetti(particles);
    
    setTimeout(() => {
      setConfetti([]);
    }, 4000);
  };

  const openPack = (size) => {
    if (currentCards.length > 0) {
      alert('Nejdřív přesuňte rozbalené karty do sbírky!');
      return;
    }

    if (money < packPrices[size]) {
      alert('Nemáte dostatek peněz!');
      return;
    }

    const availableCards = cards.filter(card => !unlockedCards.has(card.id));
    if (availableCards.length === 0) {
      alert('Všechny karty jsou již odemčené!');
      return;
    }

    setMoney(prev => prev - packPrices[size]);
    const drawnCards = [];
    const maxCards = Math.min(size, availableCards.length);
    
    for (let i = 0; i < maxCards; i++) {
      const remainingCards = availableCards.filter(card => !drawnCards.includes(card));
      const randomCard = remainingCards[Math.floor(Math.random() * remainingCards.length)];
      drawnCards.push(randomCard);
    }

    setCurrentCards(drawnCards);
    createConfetti();
  };

  const collectCards = () => {
    if (currentCards.length > 0) {
      setUnlockedCards(prev => new Set([...prev, ...currentCards.map(card => card.id)]));
      setCurrentCards([]);
    }
  };

  const canPlayMatch = () => {
    const unlockedPlayersByPosition = cards
      .filter(card => unlockedCards.has(card.id))
      .reduce((acc, card) => {
        acc[card.position] = (acc[card.position] || 0) + 1;
        return acc;
      }, {});

    return (unlockedPlayersByPosition.goalkeeper >= 1 &&
            unlockedPlayersByPosition.defender >= 2 &&
            unlockedPlayersByPosition.forward >= 3);
  };

  const startTeamSelection = () => {
    if (canPlayMatch()) {
      setShowTeamSelection(true);
    } else {
      alert('Pro zápas potřebujete: 1 brankáře, 2 obránce a 3 útočníky!');
    }
  };

  const selectPlayer = (card) => {
    if (!showTeamSelection) return;

    setSelectedTeam(prev => {
      const newTeam = { ...prev };
      
      // Pokud je hráč již vybrán, odeberte ho
      if (prev.goalkeeper === card.id || 
          prev.defenders.includes(card.id) || 
          prev.forwards.includes(card.id)) {
        if (prev.goalkeeper === card.id) newTeam.goalkeeper = null;
        if (prev.defenders.includes(card.id)) newTeam.defenders = prev.defenders.filter(id => id !== card.id);
        if (prev.forwards.includes(card.id)) newTeam.forwards = prev.forwards.filter(id => id !== card.id);
        return newTeam;
      }

      // Přidejte hráče do správné kategorie
      switch (card.position) {
        case 'goalkeeper':
          if (newTeam.goalkeeper === null) {
            newTeam.goalkeeper = card.id;
          }
          break;
        case 'defender':
          if (newTeam.defenders.length < 2 && !newTeam.defenders.includes(card.id)) {
            newTeam.defenders.push(card.id);
          }
          break;
        case 'forward':
          if (newTeam.forwards.length < 3 && !newTeam.forwards.includes(card.id)) {
            newTeam.forwards.push(card.id);
          }
          break;
      }
      return newTeam;
    });
  };

  const isTeamComplete = () => {
    return selectedTeam.goalkeeper !== null && 
           selectedTeam.defenders.length === 2 && 
           selectedTeam.forwards.length === 3;
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const generateGameEvent = (selectedTeam) => {
    const events = [
      { type: 'shot', message: 'Střela na bránu!', probability: 0.4 },
      { type: 'goal', message: 'GÓÓÓL!', probability: 0.2 },
      { type: 'penalty', message: 'Vyloučení na 2 minuty', probability: 0.2 },
      { type: 'save', message: 'Skvělý zákrok brankáře!', probability: 0.2 }
    ];
    
    // Vážený výběr události podle pravděpodobnosti
    const totalProb = events.reduce((sum, event) => sum + event.probability, 0);
    let random = Math.random() * totalProb;
    let randomEvent;
    
    for (const event of events) {
      random -= event.probability;
      if (random <= 0) {
        randomEvent = event;
        break;
      }
    }

    const availablePlayers = [
      ...selectedTeam.forwards,
      ...selectedTeam.defenders,
      selectedTeam.goalkeeper
    ].filter(id => {
      // Vyloučení hráči nemohou generovat události
      return id !== null && !matchState.penalties.find(p => p.playerId === id);
    });
    
    if (availablePlayers.length === 0) return null;
    
    const randomId = availablePlayers[Math.floor(Math.random() * availablePlayers.length)];
    const player = cards.find(card => card.id === randomId);
    if (!player) return null;

    const event = {
      ...randomEvent,
      player: player.name,
      playerId: player.id,
      time: formatTime(matchState.time),
      id: Date.now()
    };

    if (event.type === 'penalty') {
      // Přidáme vyloučení
      setMatchState(prev => ({
        ...prev,
        penalties: [...prev.penalties, {
          playerId: player.id,
          timeLeft: 120,
          startTime: prev.time
        }]
      }));
    } else if (event.type === 'goal' && availablePlayers.length > 1) {
      // Asistence pouze pokud máme víc než jednoho hráče na ledě
      const possibleAssisters = availablePlayers.filter(id => id !== player.id);
      if (possibleAssisters.length > 0) {
        const assisterId = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
        const assister = cards.find(card => card.id === assisterId);
        if (assister) {
          event.assist = assister.name;
          event.assistId = assister.id;
        }
      }
    }

    return event;
  };

  const startMatch = () => {
    if (isTeamComplete()) {
      setShowMatch(true);
      setShowTeamSelection(false);
      setMatchState(prev => ({ ...prev, isPlaying: true }));
      
      const timer = setInterval(() => {
        setMatchState(prev => {
          const timeDecrease = prev.gameSpeed;
          
          // Aktualizace trestů
          const updatedPenalties = prev.penalties
            .map(penalty => ({
              ...penalty,
              timeLeft: Math.max(0, penalty.timeLeft - timeDecrease)
            }))
            .filter(penalty => penalty.timeLeft > 0);

          if (prev.time <= 0) {
            if (prev.period < 3) {
              return {
                ...prev,
                period: prev.period + 1,
                time: 1200,
                events: [...prev.events, { 
                  type: 'period',
                  message: `Konec ${prev.period}. třetiny!`,
                  time: '00:00',
                  id: Date.now()
                }]
              };
            } else {
              clearInterval(timer);
              return {
                ...prev,
                isPlaying: false,
                events: [...prev.events, {
                  type: 'end',
                  message: 'Konec zápasu!',
                  time: '00:00',
                  id: Date.now()
                }]
              };
            }
          }

          if (Math.random() < 0.03 * prev.gameSpeed) {
            const event = generateGameEvent(selectedTeam);
            if (!event) return { ...prev, time: prev.time - timeDecrease };
            
            const newStats = { ...prev.playerStats };

            if (event.type === 'goal') {
              newStats.goals[event.playerId] = (newStats.goals[event.playerId] || 0) + 1;
              if (event.assistId) {
                newStats.assists[event.assistId] = (newStats.assists[event.assistId] || 0) + 1;
              }
              return {
                ...prev,
                time: prev.time - timeDecrease,
                score: { ...prev.score, home: prev.score.home + 1 },
                events: [event, ...prev.events],
                playerStats: newStats
              };
            } else if (event.type === 'save' && event.playerId === selectedTeam.goalkeeper) {
              newStats.saves[event.playerId] = (newStats.saves[event.playerId] || 0) + 1;
              newStats.saveAccuracy[event.playerId] = 90 + Math.floor(Math.random() * 10);
              return {
                ...prev,
                time: prev.time - timeDecrease,
                events: [event, ...prev.events],
                playerStats: newStats
              };
            }

            return {
              ...prev,
              time: prev.time - timeDecrease,
              events: [event, ...prev.events]
            };
          }

          return {
            ...prev,
            time: prev.time - timeDecrease,
            penalties: updatedPenalties
          };
        });
      }, 1000 / matchState.gameSpeed);

      return () => clearInterval(timer);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-gray-900 to-black p-8">
      <style jsx global>{`
        @keyframes confetti-fall {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(720deg);
            opacity: 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>

      {confetti.map((particle) => (
        <ConfettiParticle key={particle.id} color={particle.color} />
      ))}

      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-12 animate-[float_4s_ease-in-out_infinite]">
          <div className="inline-block bg-black/30 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border border-yellow-500/20">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 via-yellow-300 to-yellow-400 text-transparent bg-clip-text mb-4">
              Sbírka karet
            </h1>
            <div className="flex justify-center gap-8 mb-4">
              <div className="bg-black/40 px-6 py-3 rounded-xl border border-yellow-500/20">
                <p className="text-yellow-100 text-xl">
                  Získáno: <span className="font-bold text-yellow-400">{unlockedCards.size}</span> / <span className="font-bold text-yellow-400">{cards.length}</span>
                </p>
              </div>
              <div className="bg-black/40 px-6 py-3 rounded-xl border border-yellow-500/20">
                <p className="text-yellow-100 text-xl">
                  Peníze: <span className="font-bold text-yellow-400">{money} Kč</span>
                </p>
              </div>
            </div>
            {!showCollection && (
              <button
                onClick={() => canPlayMatch() ? alert('Můžete začít zápas!') : alert('Pro zápas potřebujete: 1 brankáře, 2 obránce a 3 útočníky!')}
                className={`bg-gradient-to-r ${canPlayMatch() ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'from-gray-500 to-gray-600 cursor-not-allowed'} 
                  text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-300 
                  ${canPlayMatch() ? 'hover:scale-105 active:scale-95' : ''} border-2 border-white/20`}
                disabled={!canPlayMatch()}
              >
                Hrát zápas {!canPlayMatch() && '(Neúplná sestava)'}
              </button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 justify-items-center mb-8">
          {!showCollection ? (
            <>
              {[3, 5, 7].map((packSize) => (
                <div
                  key={packSize}
                  className="transform transition-transform hover:scale-105 active:scale-95"
                  onClick={() => openPack(packSize)}
                >
                  <div className={`cursor-pointer rounded-lg overflow-hidden shadow-xl relative group ${
                    currentCards.length > 0 ? 'opacity-50 cursor-not-allowed' : ''
                  }`}>
                    <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/30 to-yellow-700/30 group-hover:opacity-75 transition-opacity"></div>
                    <img
                      src="/Images/LancersBalicek.jpg"
                      alt={`Balíček ${packSize} karet`}
                      className="w-64 h-80 object-cover"
                    />
                    <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/90 to-transparent">
                      <h3 className="text-xl font-bold text-yellow-400 text-center mb-1">
                        Balíček {packSize} karet
                      </h3>
                      <p className="text-white text-center">
                        Cena: {packPrices[packSize]} Kč
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </>
          ) : (
            <>
              {cards.map((card) => (
                <div
                  key={card.id}
                  className="transform transition-all duration-300 hover:scale-105 cursor-pointer"
                  onClick={() => unlockedCards.has(card.id) && setSelectedCard(card)}
                >
                  <div className={`
                    relative overflow-hidden rounded-lg shadow-xl
                    ${unlockedCards.has(card.id) 
                      ? 'bg-gradient-to-br from-yellow-500 to-yellow-700 p-0.5' 
                      : 'bg-zinc-800 p-0.5'}
                  `}>
                    {unlockedCards.has(card.id) ? (
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-56 object-contain rounded"
                      />
                    ) : (
                      <div className="w-full h-56 flex items-center justify-center text-4xl text-gray-500">
                        ?
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </>
          )}
        </div>

        {selectedCard && (
          <div 
            className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 cursor-pointer backdrop-blur-sm"
            onClick={() => setSelectedCard(null)}
          >
            <div className="transform transition-all duration-300 hover:scale-105">
              <div className="bg-gradient-to-br from-yellow-500 to-yellow-700 p-0.5 rounded-lg shadow-2xl">
                <img
                  src={selectedCard.image}
                  alt={selectedCard.name}
                  className="w-auto h-[80vh] object-contain rounded"
                />
              </div>
              <div className="text-center mt-4">
                <p className="text-yellow-400 text-xl font-bold">{selectedCard.name}</p>
                <p className="text-yellow-200 text-lg capitalize">{selectedCard.rarity}</p>
              </div>
            </div>
          </div>
        )}

        {currentCards.length > 0 && (
          <div className="fixed bottom-0 left-0 right-0 bg-black bg-opacity-90 p-4">
            <div className="max-w-7xl mx-auto">
              <div className="grid grid-cols-7 gap-4 justify-items-center">
                {currentCards.map(card => (
                  <div key={card.id} className="transform transition-all duration-300 hover:scale-105">
                    <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-xl p-0.5">
                      <img
                        src={card.image}
                        alt={card.name}
                        className="w-full h-56 object-contain rounded"
                      />
                    </div>
                  </div>
                ))}
              </div>
              <div className="text-center mt-4">
                <button
                  onClick={collectCards}
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-8 rounded-full transform transition-transform hover:scale-105 active:scale-95"
                >
                  Přesunout do sbírky
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="fixed top-4 right-4 flex flex-col gap-4">
          <button
            onClick={() => setShowCollection(!showCollection)}
            className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-black font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95 border-2 border-yellow-400/20"
          >
            {showCollection ? 'Zpět na balíčky' : 'Zobrazit sbírku'}
          </button>
          {!showCollection && (
            <button
              onClick={startTeamSelection}
              className={`bg-gradient-to-r ${canPlayMatch() ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'from-gray-500 to-gray-600 cursor-not-allowed'} 
                text-white font-bold py-3 px-6 rounded-xl shadow-lg transform transition-all duration-300 
                ${canPlayMatch() ? 'hover:scale-105 active:scale-95' : ''} border-2 border-white/20`}
              disabled={!canPlayMatch()}
            >
              Hrát zápas {!canPlayMatch() && '(Neúplná sestava)'}
            </button>
          )}
        </div>

        {showTeamSelection && (
          <div className="fixed inset-0 bg-black/90 flex flex-col items-center justify-center z-50 p-8">
            <h2 className="text-3xl font-bold text-yellow-400 mb-8">Vyberte svou sestavu</h2>
            <div className="grid grid-cols-3 gap-8 mb-8">
              <div className="text-center">
                <h3 className="text-xl font-bold text-yellow-200 mb-4">Brankář ({selectedTeam.goalkeeper ? '1/1' : '0/1'})</h3>
                <div className="grid gap-4">
                  {cards.filter(card => card.position === 'goalkeeper' && unlockedCards.has(card.id)).map(card => (
                    <div
                      key={card.id}
                      onClick={() => selectPlayer(card)}
                      className={`cursor-pointer transform transition-all duration-300 hover:scale-105 
                        ${selectedTeam.goalkeeper === card.id ? 'ring-4 ring-green-500' : ''}`}
                    >
                      <img src={card.image} alt={card.name} className="w-32 h-40 object-contain rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-yellow-200 mb-4">Obránci ({selectedTeam.defenders.length}/2)</h3>
                <div className="grid gap-4">
                  {cards.filter(card => card.position === 'defender' && unlockedCards.has(card.id)).map(card => (
                    <div
                      key={card.id}
                      onClick={() => selectPlayer(card)}
                      className={`cursor-pointer transform transition-all duration-300 hover:scale-105 
                        ${selectedTeam.defenders.includes(card.id) ? 'ring-4 ring-green-500' : ''}`}
                    >
                      <img src={card.image} alt={card.name} className="w-32 h-40 object-contain rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-xl font-bold text-yellow-200 mb-4">Útočníci ({selectedTeam.forwards.length}/3)</h3>
                <div className="grid gap-4">
                  {cards.filter(card => card.position === 'forward' && unlockedCards.has(card.id)).map(card => (
                    <div
                      key={card.id}
                      onClick={() => selectPlayer(card)}
                      className={`cursor-pointer transform transition-all duration-300 hover:scale-105 
                        ${selectedTeam.forwards.includes(card.id) ? 'ring-4 ring-green-500' : ''}`}
                    >
                      <img src={card.image} alt={card.name} className="w-32 h-40 object-contain rounded-lg" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowTeamSelection(false)}
                className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95"
              >
                Zrušit
              </button>
              <button
                onClick={startMatch}
                disabled={!isTeamComplete()}
                className={`bg-gradient-to-r ${isTeamComplete() ? 'from-green-500 to-green-600 hover:from-green-600 hover:to-green-700' : 'from-gray-500 to-gray-600 cursor-not-allowed'} 
                  text-white font-bold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-300 
                  ${isTeamComplete() ? 'hover:scale-105 active:scale-95' : ''}`}
              >
                Spustit zápas
              </button>
            </div>
          </div>
        )}

        {showMatch && (
          <div className="fixed inset-0 bg-black/95 flex flex-col items-center z-50 p-8 overflow-y-auto">
            <div className="w-full max-w-6xl">
              {/* Horní panel s logy, časomírou a ovládáním rychlosti */}
              <div className="flex justify-between items-center mb-8 bg-black/50 p-6 rounded-xl">
                <img src="/Images/Litvinov_Lancers.png" alt="Litvínov Lancers" className="h-24 object-contain" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    {matchState.score.away} : {matchState.score.home}
                  </div>
                  <div className="text-3xl font-mono text-white">
                    {formatTime(matchState.time)}
                  </div>
                  <div className="text-xl text-yellow-200 mt-2">
                    {matchState.period}. třetina
                  </div>
                  {/* Tresty */}
                  {matchState.penalties.length > 0 && (
                    <div className="mt-2 flex justify-center gap-4">
                      {matchState.penalties.map(penalty => {
                        const player = cards.find(c => c.id === penalty.playerId);
                        return (
                          <div key={`${penalty.playerId}-${penalty.startTime}`} className="bg-red-900/80 px-3 py-1 rounded-lg">
                            <span className="text-white text-sm">{player?.name}</span>
                            <span className="text-red-300 text-sm ml-2">{Math.ceil(penalty.timeLeft / 60)}:00</span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                  {/* Ovládání rychlosti */}
                  <div className="flex justify-center gap-2 mt-4">
                    {gameSpeedOptions.map(speed => (
                      <button
                        key={speed}
                        onClick={() => setGameSpeed(speed)}
                        className={`px-3 py-1 rounded ${
                          matchState.gameSpeed === speed
                            ? 'bg-yellow-500 text-black font-bold'
                            : 'bg-gray-700 text-white hover:bg-gray-600'
                        } text-sm transition-colors`}
                      >
                        {speed}×
                      </button>
                    ))}
                  </div>
                </div>
                <img src="/Images/HC_Lopaty_Praha.png" alt="HC Lopaty Praha" className="h-24 object-contain" />
              </div>

              {/* Vylepšená ledová plocha */}
              <div className="relative w-full h-[600px] bg-[#e8f0f0] rounded-[200px] mb-8 overflow-hidden border-8 border-blue-900/30">
                {/* Červené čáry */}
                <div className="absolute left-0 right-0 top-1/2 h-1 bg-red-600 transform -translate-y-1/2"></div>
                <div className="absolute left-1/3 right-1/3 top-0 bottom-0 border-l-2 border-r-2 border-red-600"></div>
                
                {/* Modré čáry */}
                <div className="absolute w-1 h-full bg-blue-600 left-1/4"></div>
                <div className="absolute w-1 h-full bg-blue-600 right-1/4"></div>
                
                {/* Kruhy na vhazování */}
                <div className="absolute left-1/6 top-1/4 w-24 h-24 border-2 border-red-600 rounded-full"></div>
                <div className="absolute left-1/6 bottom-1/4 w-24 h-24 border-2 border-red-600 rounded-full"></div>
                <div className="absolute right-1/6 top-1/4 w-24 h-24 border-2 border-red-600 rounded-full"></div>
                <div className="absolute right-1/6 bottom-1/4 w-24 h-24 border-2 border-red-600 rounded-full"></div>
                <div className="absolute left-1/2 top-1/2 w-24 h-24 border-2 border-red-600 rounded-full transform -translate-x-1/2 -translate-y-1/2"></div>
                
                {/* Brankoviště */}
                <div className="absolute left-8 top-1/2 w-16 h-32 border-2 border-red-600 rounded-r-lg transform -translate-y-1/2"></div>
                <div className="absolute right-8 top-1/2 w-16 h-32 border-2 border-red-600 rounded-l-lg transform -translate-y-1/2"></div>

                {/* Domácí tým - upravená formace podle trestů */}
                <div className="absolute left-0 right-1/2 top-0 bottom-0 grid grid-cols-3 gap-4 p-8">
                  {/* Brankář */}
                  <div className="flex justify-center items-center">
                    <div className="relative">
                      <img 
                        src={cards.find(card => card.id === selectedTeam.goalkeeper)?.image}
                        alt="Brankář"
                        className={`w-24 h-32 object-contain transform hover:scale-110 transition-transform rounded-lg shadow-lg
                          ${matchState.penalties.some(p => p.playerId === selectedTeam.goalkeeper) ? 'opacity-50' : ''}`}
                      />
                      {/* Statistiky brankáře */}
                      {matchState.playerStats.saves[selectedTeam.goalkeeper] > 0 && (
                        <div className="absolute -bottom-6 left-0 right-0 text-center">
                          <div className="bg-blue-900/80 text-white text-sm px-2 py-1 rounded-lg">
                            {matchState.playerStats.saves[selectedTeam.goalkeeper]} zákroků
                            <br />
                            Úspěšnost: {matchState.playerStats.saveAccuracy[selectedTeam.goalkeeper]}%
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                  {/* Obránci */}
                  <div className="grid grid-rows-2 gap-8">
                    {selectedTeam.defenders.map(id => (
                      <div key={id} className="flex justify-center items-center">
                        <div className="relative">
                          <img 
                            src={cards.find(card => card.id === id)?.image}
                            alt="Obránce"
                            className={`w-24 h-32 object-contain transform hover:scale-110 transition-transform rounded-lg shadow-lg
                              ${matchState.penalties.some(p => p.playerId === id) ? 'opacity-50' : ''}`}
                          />
                          {/* Góly a asistence */}
                          <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                            {Array.from({ length: matchState.playerStats.goals[id] || 0 }).map((_, i) => (
                              <img key={i} src="/Images/puck.png" alt="Gól" className="w-4 h-4" />
                            ))}
                            {matchState.playerStats.assists[id] > 0 && (
                              <span className="bg-yellow-500/80 text-black font-bold text-sm px-2 rounded-lg">
                                A: {matchState.playerStats.assists[id]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Útočníci */}
                  <div className="grid grid-rows-3 gap-4">
                    {selectedTeam.forwards.map(id => (
                      <div key={id} className="flex justify-center items-center">
                        <div className="relative">
                          <img 
                            src={cards.find(card => card.id === id)?.image}
                            alt="Útočník"
                            className={`w-24 h-32 object-contain transform hover:scale-110 transition-transform rounded-lg shadow-lg
                              ${matchState.penalties.some(p => p.playerId === id) ? 'opacity-50' : ''}`}
                          />
                          {/* Góly a asistence */}
                          <div className="absolute -bottom-6 left-0 right-0 flex justify-center gap-2">
                            {Array.from({ length: matchState.playerStats.goals[id] || 0 }).map((_, i) => (
                              <img key={i} src="/Images/puck.png" alt="Gól" className="w-4 h-4" />
                            ))}
                            {matchState.playerStats.assists[id] > 0 && (
                              <span className="bg-yellow-500/80 text-black font-bold text-sm px-2 rounded-lg">
                                A: {matchState.playerStats.assists[id]}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Vyloučení hráči */}
                {matchState.penalties.length > 0 && (
                  <div className="absolute bottom-4 left-4 flex gap-4">
                    {matchState.penalties.map(penalty => {
                      const player = cards.find(c => c.id === penalty.playerId);
                      return (
                        <div key={`${penalty.playerId}-${penalty.startTime}`} className="relative">
                          <img 
                            src={player?.image}
                            alt={player?.name}
                            className="w-20 h-28 object-contain rounded-lg shadow-lg border-2 border-red-600"
                          />
                          <div className="absolute -bottom-2 left-0 right-0 text-center">
                            <span className="bg-red-900/80 text-white text-sm px-2 py-1 rounded-lg">
                              {Math.ceil(penalty.timeLeft / 60)}:00
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Soupeřův tým */}
                <div className="absolute left-1/2 right-0 top-0 bottom-0 grid grid-cols-3 gap-4 p-8">
                  {/* Útočníci */}
                  <div className="grid grid-rows-3 gap-4">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="flex justify-center items-center">
                        <div className="w-24 h-32 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-4xl text-gray-600 transform hover:scale-110 transition-transform">
                          ?
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Obránci */}
                  <div className="grid grid-rows-2 gap-8">
                    {[1, 2].map(i => (
                      <div key={i} className="flex justify-center items-center">
                        <div className="w-24 h-32 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-4xl text-gray-600 transform hover:scale-110 transition-transform">
                          ?
                        </div>
                      </div>
                    ))}
                  </div>
                  {/* Brankář */}
                  <div className="flex justify-center items-center">
                    <div className="w-24 h-32 bg-gray-800 rounded-lg shadow-lg flex items-center justify-center text-4xl text-gray-600 transform hover:scale-110 transition-transform">
                      ?
                    </div>
                  </div>
                </div>
              </div>

              {/* Seznam událostí */}
              <div className="bg-black/50 rounded-xl p-6">
                <h3 className="text-2xl font-bold text-yellow-400 mb-4">Průběh zápasu</h3>
                <div className="space-y-2">
                  {matchState.events.map(event => (
                    <div 
                      key={event.id}
                      className={`p-3 rounded ${
                        event.type === 'goal' ? 'bg-green-900/50' :
                        event.type === 'penalty' ? 'bg-red-900/50' :
                        'bg-blue-900/50'
                      }`}
                    >
                      <span className="text-yellow-200 font-mono">{event.time}</span>
                      <span className="mx-2 text-white">
                        {event.player && `${event.player} - `}{event.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {!matchState.isPlaying && (
                <div className="mt-8 text-center">
                  <button
                    onClick={() => setShowMatch(false)}
                    className="bg-yellow-500 hover:bg-yellow-600 text-black font-bold py-3 px-8 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 active:scale-95"
                  >
                    Zpět do menu
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CardGame;