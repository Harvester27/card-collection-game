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
    time: 1200, // 20 minut v sekundách
    score: { home: 0, away: 0 },
    events: [],
    isPlaying: false
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
      { type: 'shot', message: 'Střela na bránu!' },
      { type: 'goal', message: 'GÓÓÓL!' },
      { type: 'penalty', message: 'Vyloučení na 2 minuty' },
      { type: 'save', message: 'Skvělý zákrok brankáře!' }
    ];
    
    const randomEvent = events[Math.floor(Math.random() * events.length)];
    const randomPlayer = () => {
      const players = [
        ...selectedTeam.forwards,
        ...selectedTeam.defenders,
        selectedTeam.goalkeeper
      ];
      return cards.find(card => card.id === players[Math.floor(Math.random() * players.length)]);
    };
    
    const player = randomPlayer();
    return {
      ...randomEvent,
      player: player.name,
      time: formatTime(matchState.time),
      id: Date.now()
    };
  };

  const startMatch = () => {
    if (isTeamComplete()) {
      setShowMatch(true);
      setShowTeamSelection(false);
      setMatchState(prev => ({ ...prev, isPlaying: true }));
      
      // Spustíme časomíru a generování událostí
      const timer = setInterval(() => {
        setMatchState(prev => {
          if (prev.time <= 0) {
            if (prev.period < 3) {
              // Další třetina
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
              // Konec zápasu
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

          // Generujeme náhodné události každých ~30 sekund
          if (Math.random() < 0.03) {
            const event = generateGameEvent(selectedTeam);
            if (event.type === 'goal') {
              return {
                ...prev,
                time: prev.time - 1,
                score: { ...prev.score, home: prev.score.home + 1 },
                events: [event, ...prev.events]
              };
            }
            return {
              ...prev,
              time: prev.time - 1,
              events: [event, ...prev.events]
            };
          }

          return {
            ...prev,
            time: prev.time - 1
          };
        });
      }, 1000);

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
              {/* Horní panel s logy a časomírou */}
              <div className="flex justify-between items-center mb-8 bg-black/50 p-6 rounded-xl">
                <img src="/Images/HC_Lopaty_Praha.png" alt="HC Lopaty Praha" className="h-24 object-contain" />
                <div className="text-center">
                  <div className="text-4xl font-bold text-yellow-400 mb-2">
                    {matchState.score.home} : {matchState.score.away}
                  </div>
                  <div className="text-3xl font-mono text-white">
                    {formatTime(matchState.time)}
                  </div>
                  <div className="text-xl text-yellow-200 mt-2">
                    {matchState.period}. třetina
                  </div>
                </div>
                <img src="/Images/Litvinov_Lancers.png" alt="Litvínov Lancers" className="h-24 object-contain" />
              </div>

              {/* Hrací plocha */}
              <div className="relative w-full h-96 bg-gradient-to-b from-blue-900/30 to-blue-950/30 rounded-xl mb-8 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4/5 h-4/5 border-2 border-blue-400/20 rounded-full"></div>
                </div>
                
                {/* Aktivní hráči na ledě */}
                <div className="absolute inset-0 grid grid-cols-3 gap-4 p-8">
                  {/* Brankář */}
                  <div className="flex justify-center items-center">
                    <img 
                      src={cards.find(card => card.id === selectedTeam.goalkeeper)?.image}
                      alt="Brankář"
                      className="w-20 h-24 object-contain transform hover:scale-110 transition-transform"
                    />
                  </div>
                  {/* Obránci */}
                  <div className="grid grid-rows-2 gap-4">
                    {selectedTeam.defenders.map(id => (
                      <div key={id} className="flex justify-center items-center">
                        <img 
                          src={cards.find(card => card.id === id)?.image}
                          alt="Obránce"
                          className="w-20 h-24 object-contain transform hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}
                  </div>
                  {/* Útočníci */}
                  <div className="grid grid-rows-3 gap-4">
                    {selectedTeam.forwards.map(id => (
                      <div key={id} className="flex justify-center items-center">
                        <img 
                          src={cards.find(card => card.id === id)?.image}
                          alt="Útočník"
                          className="w-20 h-24 object-contain transform hover:scale-110 transition-transform"
                        />
                      </div>
                    ))}
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