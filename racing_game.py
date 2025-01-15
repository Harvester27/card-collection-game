<!DOCTYPE html>
<html lang="cs">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sbírka karet</title>
    <style>
        :root {
            --gold: #ffd700;
            --bronze: #cd7f32;
            --black: #1a1a1a;
            --gray: #3a3a3a;
        }

        body {
            margin: 0;
            padding: 20px;
            background: var(--black);
            font-family: Arial, sans-serif;
            color: white;
            min-height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
        }

        .header {
            text-align: center;
            margin-bottom: 30px;
        }

        .title {
            color: var(--gold);
            font-size: 32px;
            margin-bottom: 10px;
        }

        .progress {
            color: white;
            font-size: 18px;
        }

        .cards-container {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
            margin-bottom: 30px;
        }

        .card {
            width: 180px;
            height: 250px;
            position: relative;
            cursor: pointer;
            transition: transform 0.3s ease;
        }

        .card:hover {
            transform: translateY(-5px);
        }

        .card::before {
            content: '';
            position: absolute;
            inset: -3px;
            background: var(--bronze);
            border-radius: 15px;
            z-index: -1;
            animation: glow 1.5s ease-in-out infinite alternate;
        }

        .card[data-special="true"]::before {
            background: var(--gold);
        }

        .card-inner {
            width: 100%;
            height: 100%;
            background: var(--gray);
            border-radius: 12px;
            overflow: hidden;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .card img {
            width: calc(100% - 10px);
            height: calc(100% - 10px);
            object-fit: cover;
            border-radius: 8px;
        }

        .buttons {
            display: flex;
            gap: 20px;
            margin-top: 20px;
        }

        button {
            padding: 12px 24px;
            border: none;
            border-radius: 8px;
            background: var(--gold);
            color: var(--black);
            font-size: 16px;
            cursor: pointer;
            transition: transform 0.2s, box-shadow 0.2s;
        }

        button:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(255, 215, 0, 0.3);
        }

        .collection-btn {
            position: fixed;
            top: 20px;
            right: 20px;
        }

        @keyframes glow {
            from {
                box-shadow: 0 0 5px currentColor,
                           0 0 10px currentColor,
                           0 0 15px currentColor;
            }
            to {
                box-shadow: 0 0 10px currentColor,
                           0 0 20px currentColor,
                           0 0 30px currentColor;
            }
        }

        .particles {
            position: fixed;
            pointer-events: none;
        }

        .particle {
            position: absolute;
            background: var(--gold);
            border-radius: 50%;
            pointer-events: none;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1 class="title">Sbírka karet</h1>
        <div class="progress">Získáno karet: <span id="progress">0/7</span></div>
    </div>

    <div class="cards-container" id="cards"></div>

    <div class="buttons">
        <button onclick="openPack(3)">3 karty</button>
        <button onclick="openPack(5)">5 karet</button>
        <button onclick="openPack(7)">7 karet</button>
    </div>

    <button class="collection-btn" onclick="toggleCollection()">Sbírka karet</button>

    <script>
        const cards = [
            { name: "Štěpánovský", image: "images/Stepanovsky1.jpg" },
            { name: "Nováková", image: "images/Novakova1.jpg" },
            { name: "Coufal", image: "images/Coufal3.jpg", special: true },
            { name: "Dlugopolský", image: "images/Dlugopolsky1.jpg" },
            { name: "Petrov", image: "images/Petrov1.jpg" },
            { name: "Nistor", image: "images/Nistor1.jpg" },
            { name: "Materna", image: "images/Materna1.jpg" }
        ];

        let unlockedCards = new Set();
        let showingCollection = false;

        function createParticles(x, y) {
            const container = document.createElement('div');
            container.className = 'particles';
            document.body.appendChild(container);

            for (let i = 0; i < 20; i++) {
                const particle = document.createElement('div');
                particle.className = 'particle';
                const size = Math.random() * 4 + 2;
                const angle = Math.random() * Math.PI * 2;
                const velocity = Math.random() * 3 + 2;
                const lifetime = Math.random() * 1000 + 500;

                particle.style.width = size + 'px';
                particle.style.height = size + 'px';
                particle.style.left = x + 'px';
                particle.style.top = y + 'px';

                container.appendChild(particle);

                const vx = Math.cos(angle) * velocity;
                const vy = Math.sin(angle) * velocity;
                let opacity = 1;

                const animate = () => {
                    if (opacity <= 0) {
                        container.remove();
                        return;
                    }

                    opacity -= 1 / (lifetime / 16);
                    particle.style.opacity = opacity;
                    particle.style.left = (parseFloat(particle.style.left) + vx) + 'px';
                    particle.style.top = (parseFloat(particle.style.top) + vy) + 'px';

                    requestAnimationFrame(animate);
                };

                requestAnimationFrame(animate);
            }
        }

        function updateProgress() {
            document.getElementById('progress').textContent = `${unlockedCards.size}/${cards.length}`;
        }

        function renderCards() {
            const container = document.getElementById('cards');
            container.innerHTML = '';

            const displayCards = showingCollection ? cards : cards.slice(0, 3);

            displayCards.forEach(card => {
                const cardElement = document.createElement('div');
                cardElement.className = 'card';
                if (card.special) cardElement.dataset.special = 'true';

                const inner = document.createElement('div');
                inner.className = 'card-inner';

                if (unlockedCards.has(card.image)) {
                    const img = document.createElement('img');
                    img.src = card.image;
                    img.alt = card.name;
                    inner.appendChild(img);
                } else {
                    inner.textContent = '?';
                }

                cardElement.appendChild(inner);
                container.appendChild(cardElement);
            });
        }

        function openPack(size) {
            const availableCards = cards
                .slice(0, size)
                .filter(card => !unlockedCards.has(card.image));

            if (availableCards.length === 0) {
                alert('Všechny karty z tohoto balíčku jsou již odemčené!');
                return;
            }

            const card = availableCards[Math.floor(Math.random() * availableCards.length)];
            unlockedCards.add(card.image);
            
            const cardElement = document.querySelector(`[data-card="${card.image}"]`);
            if (cardElement) {
                const rect = cardElement.getBoundingClientRect();
                createParticles(rect.left + rect.width / 2, rect.top + rect.height / 2);
            }

            updateProgress();
            renderCards();
            saveProgress();
        }

        function toggleCollection() {
            showingCollection = !showingCollection;
            renderCards();
        }

        function saveProgress() {
            localStorage.setItem('unlockedCards', JSON.stringify([...unlockedCards]));
        }

        function loadProgress() {
            const saved = localStorage.getItem('unlockedCards');
            if (saved) {
                unlockedCards = new Set(JSON.parse(saved));
                updateProgress();
                renderCards();
            }
        }

        // Inicializace
        loadProgress();
        renderCards();
    </script>
</body>
</html>