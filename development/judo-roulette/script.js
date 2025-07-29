document.addEventListener('DOMContentLoaded', () => {
    // --- DOM Elements ---
    const background = document.createElement('div');
    background.className = 'background';
    document.body.prepend(background);

    const initialScreen = document.getElementById('initial-screen');
    const rouletteScreen = document.getElementById('roulette-screen');
    const rouletteContainer = document.getElementById('roulette-container');

    const itemInputsContainer = document.getElementById('item-inputs');
    const addItemButton = document.getElementById('add-item-button');
    const startButton = document.getElementById('start-button');
    const clearButton = document.getElementById('clear-button'); // Add this line

    const restartButton = document.getElementById('restart-button');
    const resetButton = document.getElementById('reset-button');

    let items = [];
    let animationFrameId = null;

    // --- Functions ---

    function setupInitialInputs() {
    itemInputsContainer.innerHTML = '';
    for (let i = 1; i <= 7; i++) {
        const inputWrapper = document.createElement('div');
        inputWrapper.style.display = 'flex';
        inputWrapper.style.alignItems = 'center';
        inputWrapper.style.justifyContent = 'center';
        inputWrapper.style.marginBottom = '10px';

        if (i === 1) { // Only add star for the first item
            const star = document.createElement('span');
            star.textContent = '☆ ';
            star.style.color = 'white';
            star.style.marginRight = '5px';
            inputWrapper.appendChild(star);
        }

        const newInput = document.createElement('input');
        newInput.type = 'text';
        newInput.className = 'item-input';
        newInput.placeholder = `項目${i}`;
        newInput.value = (i === 7) ? '' : `テスト${i}`;
        inputWrapper.appendChild(newInput);
        itemInputsContainer.appendChild(inputWrapper);
    }
    addItemButton.style.display = 'none';
}

    function startRoulette() {
        // 1. Prepare screens
        initialScreen.classList.add('hidden');
        rouletteScreen.classList.remove('hidden');
        rouletteContainer.innerHTML = '';
        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        // 2. Create the list of items to scroll
        const list = document.createElement('div');
        list.className = 'roulette-list';
        rouletteContainer.appendChild(list);

        const displayItems = [];
        // Create a long list for seamless looping. The first set is for padding.
        for (let i = 0; i < 20; i++) {
            displayItems.push(...items);
        }
        list.innerHTML = displayItems.map((item, index) => {
            const originalIndex = index % items.length;
            const colorClass = (originalIndex % 2 === 0) ? 'item-light-blue' : 'item-light-pink';
            return `<div class="roulette-item ${colorClass}">${item}</div>`;
        }).join('');

        // 3. Calculate target position
        const itemHeight = list.querySelector('.roulette-item').clientHeight;
        const containerHeight = rouletteContainer.clientHeight;
        const winner = 0; // Always select the first item (項目1)
        // Target a winner in a distant set of items to allow for spin-up and spin-down
        const winnerIndex = (items.length * 15) + winner;
        const targetScrollTop = winnerIndex * itemHeight - (containerHeight / 2) + (itemHeight / 2);

        // 4. Animate the scroll
        let start = null;
        const duration = 10000; // 10 seconds
        
        // Start from the bottom of the scrollable area
        const startScrollTop = list.scrollHeight - containerHeight;
        rouletteContainer.scrollTop = startScrollTop;

        function animate(timestamp) {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const t = Math.min(progress / duration, 1);
            const easeOutCubic = t => (--t) * t * t + 1;
            const easedT = easeOutCubic(t);

            // Calculate current scrollTop: decreases from startScrollTop to targetScrollTop
            rouletteContainer.scrollTop = startScrollTop - (startScrollTop - targetScrollTop) * easedT;

            if (progress < duration) {
                animationFrameId = requestAnimationFrame(animate);
            } else {
                rouletteContainer.scrollTop = targetScrollTop; // Ensure it lands exactly
                setTimeout(() => {
                    // Hide all items except the winner
                    const allItems = list.children;
                    for (let i = 0; i < allItems.length; i++) {
                        if (i !== winnerIndex) {
                            allItems[i].style.opacity = '0';
                            allItems[i].style.transition = 'opacity 0.5s';
                        }
                    }
                    // Enlarge the winner
                    allItems[winnerIndex].style.transform = 'scale(1.5)';
                    allItems[winnerIndex].style.transition = 'transform 0.5s';

                    // Show controls
                    const rouletteControls = document.getElementById('roulette-controls');
                    if (rouletteControls) {
                        rouletteControls.classList.remove('hidden');
                    }

                }, 500);
            }
        }

        animationFrameId = requestAnimationFrame(animate);
    }

    // --- Event Listeners ---

    startButton.addEventListener('click', () => {
        items = Array.from(itemInputsContainer.getElementsByTagName('input'))
                     .map(input => input.value.trim())
                     .filter(value => value !== '');
        if (items.length > 0) {
            startRoulette();
        }
    });

    restartButton.addEventListener('click', startRoulette);

    resetButton.addEventListener('click', () => {
        rouletteScreen.classList.add('hidden');
        initialScreen.classList.remove('hidden');
        setupInitialInputs();
    });

    // "Clear" button
    clearButton.addEventListener('click', () => {
        const inputs = itemInputsContainer.getElementsByTagName('input');
        for (let i = 0; i < inputs.length; i++) {
            inputs[i].value = '';
        }
    });

    // --- Initial Setup ---
    setupInitialInputs();
});