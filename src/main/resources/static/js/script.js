let score = 0;
let doubleIncomeActive = false;
let doubleIncomeTimer = null;
let tripleIncomeActive = false;
let currentSprite = "assets/CatIdle.png"; // Default sprite
let totalFrames = 10;
let frameWidth = 32;
let frameHeight = 32;
let scale = 4;
let frameSpeed = 5; // Lower is faster
let frameCount = 0;
let currentFrame = 0;
let animationFrameId;
let outfit2Bought = false;
let blackCatOutfitBought = false;
let autoClickerActive = false;
let autoClickerInterval = null;
let autoClickerCost = 100;
let autoClickerLevel = 0;
let autoClickerRate = 1000; // 1 click per second initially
let activePopup = null;

// Add near the top with other variables
let clickCombo = 0;
let lastClickTime = 0;
let comboTimeout = null;
const COMBO_TIMEOUT = 1000; // 1 second to maintain combo
const COMBO_MULTIPLIER = 0.01; // Each combo adds 10% bonus
const COMBO_UPDATE_THRESHOLD = 50; // Send message every 10 combos

const SEASONS = {
    SPRING: 'blue_2',
    SUMMER: 'orange_2',
    AUTUMN: 'fiolet_2',
    WINTER: 'pink_2'
};

const DAY_DURATION = 45000; // 30 seconds per day
const HOURS_PER_DAY = 24;
const MS_PER_HOUR = DAY_DURATION / HOURS_PER_DAY;
let currentHour = 0;
let timeProgress = 0;
let currentSeason = SEASONS.SPRING;
let currentDay = 1;
let seasonDay = 1;
let cloudElements = [];
let seasonInterval;

const buttonAnimations = new Map();

const cloudSets = {
    SPRING: 'blue_2',
    SUMMER: 'orange_2',
    AUTUMN: 'fiolet_2',
    WINTER: 'pink_2'
};

const ABILITIES = {
    DOUBLE_POINTS: { day: 1, unlocked: false, name: "Double Points", cost: 10 },
    AUTO_CLICKER: { day: 3, unlocked: false, name: "Auto Clicker", cost: 100 },
    TRIPLE_POWER: { day: 5, unlocked: false, name: "Triple Power", cost: 200 }
};

const ABILITY_UPGRADES = {
    DOUBLE_POINTS: {
        baseCost: 10,
        maxLevel: 10,
        upgradeCosts: Array.from({length: 10}, (_, i) => 10 * (i + 2)),
        multipliers: Array.from({length: 10}, (_, i) => 2 + (i * 0.5)),
        daysToUnlock: Array.from({length: 10}, (_, i) => 1 + (i * 2)),
        currentLevel: 0
    },
    AUTO_CLICKER: {
        baseCost: 100,
        maxLevel: 10,
        upgradeCosts: Array.from({length: 10}, (_, i) => 100 * (i + 2)),
        speedMultipliers: Array.from({length: 10}, (_, i) => 1 + (i * 0.2)),
        daysToUnlock: Array.from({length: 10}, (_, i) => 3 + (i * 2)),
        currentLevel: 0
    },
    TRIPLE_POWER: {
        baseCost: 200,
        maxLevel: 10,
        upgradeCosts: Array.from({length: 10}, (_, i) => 200 * (i + 2)),
        multipliers: Array.from({length: 10}, (_, i) => 3 + (i * 0.5)),
        daysToUnlock: Array.from({length: 10}, (_, i) => 5 + (i * 2)),
        currentLevel: 0
    }
};

const ABILITY_INFO = {
    DOUBLE_POINTS: {
        description: "Double points permanently. Upgrades increase multiplier.",
        upgradeDescription: (level, multiplier) => `Currently: ${multiplier.toFixed(1)}x points`
    },
    AUTO_CLICKER: {
        description: "Automatically clicks the cat. Upgrades increase speed.",
        upgradeDescription: (level, speed) => `Currently: ${(1000/speed).toFixed(1)} clicks/sec`
    },
    TRIPLE_POWER: {
        description: "Triple power-ups last longer. Upgrades increase duration.",
        upgradeDescription: (level, duration) => `Currently: ${duration}s duration`
    }
};

// Update TIME_ACCELERATOR constant
const TIME_ACCELERATOR = {
    name: "Time Accelerator",
    cost: 1500,
    multiplier: 2.5,
    duration: 5000, // 5 seconds
    active: false,
    unlockDay: 5  // Add unlock day requirement
};

// Add near the top with other constants
const CART_RESPONSES = [
    "Meow-velous clicking skills... *if you were trying to lose*! 🐱",
    "Are you farming points or just paw-crastinating? Get moving! 😼",
    "Even a sleeping cat could score better than that! *yawns* 😴",
    "Paw-lease! My grandma clicks faster than you! 🐾",
    "Is this your first time using a mouse? Because it shows! 😸"
];

const SESSION_ID = 'session_' + Math.random().toString(36).substring(7);

let permanentMultiplier = 1;
let timeMultiplier = 1;
let timeAcceleratorTimeout = null;

// Replace GAME_UPDATE_RESPONSES with a function to create game update messages
function createGameUpdateMessage(updateType, ...args) {
    switch(updateType) {
        case 'ABILITY_UPGRADE':
            return `Hey Car(T), just upgraded ${args[0]} to level ${args[1]}!`;
        case 'ABILITY_UNLOCK':
            return `Car(T), I just unlocked ${args[0]}! What do you think?`;
        case 'OUTFIT_PURCHASE':
            return `Check out my new ${args[0]} outfit, Car(T)! How do I look?`;
        case 'FAILED_PURCHASE':
            return `Ugh, I can't afford ${args[0]} - it costs ${args[1]} points...`;
        case 'TIME_ACCELERATOR':
            return `Just activated the time accelerator, Car(T)! Going fast!`;
        // Add to createGameUpdateMessage function
        case 'COMBO':
            return `${args[0]}x COMBO! Is that all you got?`;
        case 'COMBO_BREAK':
            return `Broke your ${args[0]}x combo! Too slow, just like in Valorant!`;
        case 'SCORE_UPDATE':
            return `Current score: ${args[0]} points. ${args[1] || ''}`;
        default:
            return `Hey Car(T), something happened in the game!`;
    }
}

// Update sendGameUpdateToCat function to only show AI's response
async function sendGameUpdateToCat(updateType, ...args) {
    const message = createGameUpdateMessage(updateType, ...args);
    try {
        const response = await fetch('https://cat-4-naym.onrender.com/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ 
                message: message,
                session_id: SESSION_ID
            })
        });
        
        const data = await response.json();
        // Only show the AI's response, not the game update message
        addMessage(data.response, false);
    } catch (error) {
        console.error('Error:', error);
        addMessage("Lost connection! Too many fish in the server? 🐟", false);
    }
}

// Remove entire CloudGenerator class

// Add near the top with other global variables
const SOUNDS = {
    click: new Audio('sounds/click.wav'),
    purchase: new Audio('sounds/purchase.wav'),
    chat: new Audio('sounds/chat.mp3')
};

// Ensure sounds are loaded with proper volume
Object.values(SOUNDS).forEach(sound => {
    sound.volume = 0.3; // Set to 30% volume
});

// Update addPoint function
function addPoint(event) {
  const canvasRect = canvas.getBoundingClientRect();
  const mouseX = event.clientX - canvasRect.left;
  const mouseY = event.clientY - canvasRect.top;

  const catX = 60;
  const catY = 10;
  const catWidth = frameWidth * scale;
  const catHeight = frameHeight * scale;

  if (mouseX >= catX && mouseX <= catX + catWidth && mouseY >= catY && mouseY <= catY + catHeight) {
    SOUNDS.click.currentTime = 0; // Reset sound to start
    SOUNDS.click.play();
    
    const now = Date.now();
    if (now - lastClickTime < COMBO_TIMEOUT) {
        clickCombo++;
        if (clickCombo % COMBO_UPDATE_THRESHOLD === 0) {
            sendGameUpdateToCat('COMBO', clickCombo);
        }
    } else {
        if (clickCombo >= COMBO_UPDATE_THRESHOLD) {
            sendGameUpdateToCat('COMBO_BREAK', clickCombo);
        }
        clickCombo = 1;
    }
    lastClickTime = now;

    // Clear existing timeout and set new one
    if (comboTimeout) clearTimeout(comboTimeout);
    comboTimeout = setTimeout(() => {
        if (clickCombo >= COMBO_UPDATE_THRESHOLD) {
            sendGameUpdateToCat('COMBO_BREAK', clickCombo);
        }
        clickCombo = 0;
    }, COMBO_TIMEOUT);

    let pointsToAdd = permanentMultiplier;
    pointsToAdd *= (1 + (clickCombo - 1) * COMBO_MULTIPLIER); // Add combo bonus
    pointsToAdd = tripleIncomeActive ? pointsToAdd * 3 : pointsToAdd;
    
    score += pointsToAdd;
    document.getElementById("score").innerText = Math.round(score);
    spawnFish(event.clientX, event.clientY);
  }
}

function spawnFish(x, y) {
  const fishImages = [
    "assets/fish1.png",
    "assets/fish2.png",
    "assets/fish3.png",
  ];
  const fish = document.createElement("img");
  fish.src = fishImages[Math.floor(Math.random() * fishImages.length)];
  fish.classList.add("fish");

  // Randomize the starting position within a range
  const randomXOffset = Math.floor(Math.random() * 50) - 25;
  const randomYOffset = Math.floor(Math.random() * 50) - 25;

  const randomRotation = Math.floor(Math.random() * 360);

  fish.style.left = `${x - 25 + randomXOffset}px`;
  fish.style.top = `${y - 25 + randomYOffset}px`;
  fish.style.transform = `rotate(${randomRotation}deg)`;

  document.body.appendChild(fish);

  fish.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`;

  setTimeout(() => fish.remove(), 3000);
}

function buyAndEquip(item, cost, frames, width, height, newScale) {
  if (item === 'doubleIncome') {
    const upgrade = ABILITY_UPGRADES.DOUBLE_POINTS;
    if (!ABILITIES.DOUBLE_POINTS.unlocked) {
        if (score >= cost) {
            SOUNDS.purchase.currentTime = 0;
            SOUNDS.purchase.play();
            score -= cost;
            ABILITIES.DOUBLE_POINTS.unlocked = true;
            upgrade.currentLevel = 1;
            permanentMultiplier = upgrade.multipliers[0];
            updateAbilityButton('DOUBLE_POINTS', `Double Points (Level 1) - Next upgrade at day ${upgrade.daysToUnlock[1]}`);
            sendGameUpdateToCat('ABILITY_UNLOCK', 'Double Points');
        } else {
            sendGameUpdateToCat('FAILED_PURCHASE', 'Double Points', cost);
        }
    } else if (upgrade.currentLevel < upgrade.maxLevel && currentDay >= upgrade.daysToUnlock[upgrade.currentLevel]) {
        const upgradeCost = upgrade.upgradeCosts[upgrade.currentLevel];
        if (score >= upgradeCost) {
            SOUNDS.purchase.currentTime = 0;
            SOUNDS.purchase.play();
            score -= upgradeCost;
            upgrade.currentLevel++;
            permanentMultiplier = upgrade.multipliers[upgrade.currentLevel - 1];
            updateAbilityButton('DOUBLE_POINTS', 
                upgrade.currentLevel < upgrade.maxLevel 
                    ? `Double Points (Level ${upgrade.currentLevel}) - Next upgrade at day ${upgrade.daysToUnlock[upgrade.currentLevel]}`
                    : `Double Points (MAX Level ${upgrade.currentLevel})`
            );
            sendGameUpdateToCat('ABILITY_UPGRADE', 'Double Points', upgrade.currentLevel);
        } else {
            showPopup('Not Enough Points', `You need ${upgradeCost} points to upgrade!`);
            sendGameUpdateToCat('FAILED_PURCHASE', 'Double Points upgrade', upgradeCost);
        }
    }
    document.getElementById("score").innerText = Math.round(score);
    return;
  }

  // For outfits
  const isOutfit2 = item === "assets/Box3.png";
  const isBlackCat = item === "assets/BlackCatIdle.png";
  
  // Check if already bought
  if ((isOutfit2 && outfit2Bought) || (isBlackCat && blackCatOutfitBought)) {
    switchOutfit(item, frames, width, height, newScale);
    return;
  }

  // Try to buy if not owned
  if (score >= cost) {
    SOUNDS.purchase.currentTime = 0;
    SOUNDS.purchase.play();
    score -= cost;
    document.getElementById("score").innerText = Math.round(score);
    
    if (isOutfit2) {
      outfit2Bought = true;
      updateButtonText("outfit2Button", "All Boxed UP!");
      updateButtonText("outfit2ButtonMenu", "All Boxed UP!");
    } else if (isBlackCat) {
      blackCatOutfitBought = true;
      updateButtonText("blackCatButton", "The Wise One");
      updateButtonText("blackCatButtonMenu", "The Wise One");
    }
    
    switchOutfit(item, frames, width, height, newScale);
    const outfitName = isOutfit2 ? "Box Outfit" : (isBlackCat ? "Black Cat" : "Unknown Outfit");
    sendGameUpdateToCat('OUTFIT_PURCHASE', outfitName);
  } else {
    showPopup('Not Enough Points', `You need ${cost} points to buy this!`);
    sendGameUpdateToCat('FAILED_PURCHASE', isOutfit2 ? "Box Outfit" : "Black Cat", cost);
  }
}

function updateButtonText(buttonId, text) {
    const button = document.getElementById(buttonId);
    if (button) {
        const canvas = button.querySelector('.preview-canvas');
        button.innerHTML = '';  // Clear existing content
        if (canvas) button.appendChild(canvas);  // Keep the canvas preview
        const textSpan = document.createElement('span');
        textSpan.textContent = text;
        button.appendChild(textSpan);
    }
}

function switchOutfit(spritePath, frames, width, height, newScale) {
  if (spritePath === "assets/Box3.png" && !outfit2Bought) {
    showPopup('Outfit Locked', 'You need to buy this outfit first!');
    return;
  }
  if (spritePath === "assets/BlackCatIdle.png" && !blackCatOutfitBought) {
    showPopup('Outfit Locked', 'You need to buy BlackCatIdle first!');
    return;
  }
  
  currentSprite = spritePath;
  totalFrames = frames;
  frameWidth = width;
  frameHeight = height;
  scale = newScale;
  loadSprite();
}

function toggleMenu() {
  const menuItems = document.getElementById("menuItems");
  menuItems.style.display = menuItems.style.display === "none" ? "block" : "none";
}

function spawnPowerUp() {
  const powerUp = document.createElement("img");
  powerUp.src = "assets/powerUp.png";
  powerUp.classList.add("power-up");

  // Randomize the vertical position
  const randomY = Math.floor(Math.random() * (window.innerHeight - 50));
  powerUp.style.top = `${randomY}px`;

  document.body.appendChild(powerUp);

  powerUp.addEventListener("animationend", () => powerUp.remove());

  powerUp.addEventListener("click", () => {
    activateTripleIncome();
    powerUp.remove();
  });
}

function activateTripleIncome() {
  tripleIncomeActive = true;
  setTimeout(() => {
    tripleIncomeActive = false;
  }, 10000); // Reset after 10 seconds
}

setInterval(spawnPowerUp, 30000); // Spawn power-up every 30 seconds

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

// Set canvas sizes
canvas.width = 178;
canvas.height = 150;

// Load sprites
const sprite = new Image();
sprite.src = currentSprite;

function animateSprite() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw cat sprite
  let frameX = currentFrame * frameWidth;
  ctx.drawImage(
      sprite,
      frameX, 0,
      frameWidth, frameHeight,
      60, 10, // Keep cat position
      frameWidth * scale,
      frameHeight * scale
  );

  // Update frames
  frameCount++;
  if (frameCount >= frameSpeed) {
    currentFrame = (currentFrame + 1) % totalFrames;
    frameCount = 0;
  }

  animationFrameId = requestAnimationFrame(animateSprite);
}

function loadSprite() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
  }
  sprite.src = currentSprite;
  sprite.onload = () => {
    currentFrame = 0; // Reset frame index
    frameCount = 0; // Reset frame count
    animateSprite();
  };
}

function createButtonAnimation(buttonId, spritePath, frames, width, height) {
    const button = document.getElementById(buttonId);
    if (!button) return;

    const canvas = document.createElement('canvas');
    canvas.width = width * 1.5;  // Make canvas larger for better quality
    canvas.height = height * 1.5;
    canvas.classList.add('preview-canvas');
    
    const ctx = canvas.getContext('2d');
    ctx.imageSmoothingEnabled = false;  // Keep pixel art sharp
    
    const sprite = new Image();
    sprite.src = spritePath;
    
    let currentFrame = 0;
    let frameCount = 0;
    
    const animate = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        let frameX = currentFrame * width;
        ctx.drawImage(
            sprite,
            frameX, 0,
            width, height,
            0, 0,
            canvas.width, canvas.height
        );
        
        frameCount++;
        if (frameCount >= frameSpeed) {
            currentFrame = (currentFrame + 1) % frames;
            frameCount = 0;
        }
        
        buttonAnimations.set(buttonId, requestAnimationFrame(animate));
    };
    
    sprite.onload = () => {
        button.innerHTML = '';  // Clear button content
        button.appendChild(canvas);  // Add canvas
        const text = document.createElement('span');  // Create text element
        text.textContent = button.getAttribute('data-text') || button.textContent;
        button.appendChild(text);
        animate();
    };
}

function initializeButtonAnimations() {
    createButtonAnimation('outfit1Button', 'assets/Idle.png', 10, 32, 32);
    createButtonAnimation('outfit2Button', 'assets/Box3.png', 4, 32, 32);
    createButtonAnimation('blackCatButton', 'assets/BlackCatIdle.png', 7, 32, 32);
    
    // Do the same for menu buttons
    createButtonAnimation('outfit1ButtonMenu', 'assets/Idle.png', 10, 32, 32);
    createButtonAnimation('outfit2ButtonMenu', 'assets/Box3.png', 4, 32, 32);
    createButtonAnimation('blackCatButtonMenu', 'assets/BlackCatIdle.png', 7, 32, 32);
}

document.addEventListener('DOMContentLoaded', initializeButtonAnimations);

function switchTab(tabId) {
    // Get the container that holds the clicked tab
    const container = document.querySelector(`#${tabId}`).closest('.tab-container');
    
    // Remove active class from all tabs and contents in this container
    container.querySelectorAll('.tab-button').forEach(tab => tab.classList.remove('active'));
    container.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
    
    // Add active class to clicked tab and its content
    const button = container.querySelector(`.tab-button:nth-child(${tabId.includes('powerups') ? '1' : '2'})`);
    const content = container.querySelector(`#${tabId}`);
    
    button.classList.add('active');
    content.classList.add('active');
}

function buyAutoClicker() {
    const upgrade = ABILITY_UPGRADES.AUTO_CLICKER;
    if (!ABILITIES.AUTO_CLICKER.unlocked) {
        if (score >= upgrade.baseCost) {
            SOUNDS.purchase.currentTime = 0;
            SOUNDS.purchase.play();
            score -= upgrade.baseCost;
            ABILITIES.AUTO_CLICKER.unlocked = true;
            upgrade.currentLevel = 1;
            startAutoClicker();
            updateAutoClickerButton();
            sendGameUpdateToCat('ABILITY_UNLOCK', 'Auto Clicker');
        } else {
            sendGameUpdateToCat('FAILED_PURCHASE', 'Auto Clicker', upgrade.baseCost);
        }
    } else if (upgrade.currentLevel < upgrade.maxLevel && currentDay >= upgrade.daysToUnlock[upgrade.currentLevel]) {
        const upgradeCost = upgrade.upgradeCosts[upgrade.currentLevel];
        if (score >= upgradeCost) {
            SOUNDS.purchase.currentTime = 0;
            SOUNDS.purchase.play();
            score -= upgradeCost;
            upgrade.currentLevel++;
            updateAutoClickerRate();
            updateAutoClickerButton();
            sendGameUpdateToCat('ABILITY_UPGRADE', 'Auto Clicker', upgrade.currentLevel);
        } else {
            sendGameUpdateToCat('FAILED_PURCHASE', 'Auto Clicker upgrade', upgradeCost);
        }
    }
    document.getElementById("score").innerText = Math.round(score);
}

function startAutoClicker() {
    autoClickerActive = true;
    updateAutoClickerRate();
}

function updateAutoClickerRate() {
    // Clear existing interval if any
    if (autoClickerInterval) {
        clearInterval(autoClickerInterval);
    }
    
    // Calculate new rate: gets faster with each level
    // Base rate of 1000ms, reduces by 10% per level, minimum 100ms
    const newRate = Math.max(100, autoClickerRate / (1 + (autoClickerLevel * 0.1)));
    
    // Start new interval with updated rate
    autoClickerInterval = setInterval(() => {
        // Simulate click at cat's position
        const catX = canvas.offsetLeft + 60 + (frameWidth * scale / 2);
        const catY = canvas.offsetTop + 10 + (frameHeight * scale / 2);
        
        // Create click event
        const clickEvent = new MouseEvent('click', {
            clientX: catX,
            clientY: catY
        });
        
        // Dispatch event
        document.body.dispatchEvent(clickEvent);
    }, newRate);
}

function updateAutoClickerButton() {
    const upgrade = ABILITY_UPGRADES.AUTO_CLICKER;
    const button = document.querySelector('#autoClickerButton');
    if (button) {
        if (upgrade.currentLevel < upgrade.maxLevel) {
            const nextCost = upgrade.upgradeCosts[upgrade.currentLevel];
            const nextUnlock = upgrade.daysToUnlock[upgrade.currentLevel];
            button.textContent = `Auto Clicker (Level ${upgrade.currentLevel}) - ${nextCost} Points (Day ${nextUnlock})`;
        } else {
            button.textContent = `Auto Clicker (MAX Level ${upgrade.currentLevel})`;
        }
    }
}

function initializeSeasons() {
    startDay();
    setInterval(updateDay, DAY_DURATION);
    setInterval(updateTime, 100); // Update time every 100ms for smooth progress
}

// Update updateDay function to check time accelerator
function updateDay() {
    currentDay++;
    seasonDay++;
    currentHour = 0;
    timeProgress = 0;
    
    if (seasonDay > 7) { // Update to use DAYS_PER_SEASON
        seasonDay = 1;
        changeSeasons();
    }
    
    checkDayUnlocks();
    updateDayDisplay();
    updateTimeAcceleratorButton(); // Add this line
}

function changeSeasons() {
    switch(currentSeason) {
        case SEASONS.SPRING:
            currentSeason = SEASONS.SUMMER;
            break;
        case SEASONS.SUMMER:
            currentSeason = SEASONS.AUTUMN;
            break;
        case SEASONS.AUTUMN:
            currentSeason = SEASONS.WINTER;
            break;
        case SEASONS.WINTER:
            currentSeason = SEASONS.SPRING;
            break;
    }
}

function clearClouds() {
    cloudElements.forEach(cloud => cloud.remove());
    cloudElements = [];
}

function startDay() {
    // Empty function or remove if not needed elsewhere
}

function updateDayDisplay() {
    const dayCounter = document.getElementById('dayCounter');
    dayCounter.className = 'time-display';
    dayCounter.innerHTML = `
        <div class="day-info">Day ${currentDay}</div>
        <div class="time-info">${formatHour(currentHour)}</div>
        <div class="time-progress">
            <div class="time-progress-bar" style="width: ${timeProgress}%"></div>
        </div>
    `;
}

function formatHour(hour) {
    const period = hour >= 12 ? 'PM' : 'AM';
    const h = hour % 12 || 12;
    return `${h}:00 ${period}`;
}

function updateTime() {
    timeProgress = (timeProgress + (100 / (DAY_DURATION / 100)) * timeMultiplier) % 100;
    currentHour = Math.floor((timeProgress / 100) * HOURS_PER_DAY);
    updateDayDisplay();
}

const formatTime = (days) => {
    const daysLeft = Math.max(0, days - currentDay);
    return daysLeft === 0 ? 'Available now!' : `Available in ${daysLeft} days`;
};

function checkDayUnlocks() {
    Object.entries(ABILITIES).forEach(([key, ability]) => {
        const button = document.querySelector(`[data-ability="${key}"]`);
        const buttonMobile = document.querySelector(`[data-ability="${key}-mobile"]`);
        const upgrade = ABILITY_UPGRADES[key];
        const info = ABILITY_INFO[key];
        
        [button, buttonMobile].forEach(btn => {
            if (!btn) return;

            if (currentDay < ability.day) {
                btn.style.display = 'flex';
                btn.disabled = true;
                btn.innerHTML = `
                    <div class="ability-info">
                        <div class="ability-header">
                            <span class="ability-name">${ability.name}</span>
                            <span class="ability-level">${formatTime(ability.day)}</span>
                        </div>
                        <div class="ability-description">${info.description}</div>
                        <div class="ability-progress">
                            <div class="ability-progress-bar" style="width: ${Math.min(100, (currentDay/ability.day) * 100)}%"></div>
                        </div>
                    </div>
                `;
                return;
            }

            btn.style.display = 'flex';
            
            if (!ability.unlocked) {
                btn.classList.add('unlocked');
                btn.disabled = false;
                btn.innerHTML = `
                    <div class="ability-info">
                        <div class="ability-header">
                            <span class="ability-name">${ability.name}</span>
                            <span class="ability-level">Cost: ${ability.cost} Points</span>
                        </div>
                        <div class="ability-description">${info.description}</div>
                        <div class="ability-progress unlockable">
                            <div class="ability-progress-bar" style="width: 100%"></div>
                        </div>
                    </div>
                `;
            } else if (upgrade.currentLevel < upgrade.maxLevel) {
                const nextUnlockDay = upgrade.daysToUnlock[upgrade.currentLevel];
                const currentBonus = key === 'AUTO_CLICKER' ? 
                    upgrade.speedMultipliers[upgrade.currentLevel - 1] :
                    upgrade.multipliers[upgrade.currentLevel - 1];
                const nextBonus = key === 'AUTO_CLICKER' ? 
                    upgrade.speedMultipliers[upgrade.currentLevel] :
                    upgrade.multipliers[upgrade.currentLevel];
                const progressPercent = (upgrade.currentLevel / upgrade.maxLevel) * 100;
                const nextCost = upgrade.upgradeCosts[upgrade.currentLevel];
                const isUpgradeAvailable = currentDay >= nextUnlockDay;
                
                btn.innerHTML = `
                    <div class="ability-info">
                        <div class="ability-header">
                            <span class="ability-name">${ability.name}</span>
                            <span class="ability-level">Level ${upgrade.currentLevel}/${upgrade.maxLevel}</span>
                        </div>
                        <div class="ability-stats">
                            <div class="current-bonus">${info.upgradeDescription(upgrade.currentLevel, currentBonus)}</div>
                            <div class="next-bonus">Next: ${info.upgradeDescription(upgrade.currentLevel + 1, nextBonus)}</div>
                        </div>
                        <div class="ability-next">
                            ${isUpgradeAvailable ? 
                                `Upgrade available: ${nextCost} Points` :
                                formatTime(nextUnlockDay)
                            }
                        </div>
                        <div class="ability-progress ${isUpgradeAvailable ? 'can-upgrade' : ''}">
                            <div class="ability-progress-bar" 
                                style="width: ${isUpgradeAvailable ? 100 : (currentDay/nextUnlockDay * 100)}%">
                            </div>
                        </div>
                    </div>
                `;
                if (isUpgradeAvailable) {
                    btn.classList.add('can-upgrade');
                } else {
                    btn.classList.remove('can-upgrade');
                }
            } else {
                // maxed level code...
            }
        });
    });
}

// Add function to update time accelerator button state
function updateTimeAcceleratorButton() {
    const buttons = document.querySelectorAll('.time-accelerator');
    buttons.forEach(btn => {
        if (currentDay < TIME_ACCELERATOR.unlockDay) {
            btn.disabled = true;
            btn.innerHTML = `Locked (Unlocks Day ${TIME_ACCELERATOR.unlockDay})`;
        } else {
            btn.disabled = false;
            btn.innerHTML = `Time Skipper (${TIME_ACCELERATOR.cost} Points)`;
        }
    });
}

function updateAbilityButton(id, text) {
    const buttons = document.querySelectorAll(`[data-ability="${id}"]`);
    buttons.forEach(button => {
        button.textContent = text;
        button.classList.add('active');
    });
}

function showPopup(title, message) {
    if (activePopup) {
        activePopup.remove();
    }

    const popup = document.createElement('div');
    popup.className = 'popup-overlay';
    popup.innerHTML = `
        <div class="popup-content">
            <div class="popup-title">${title}</div>
            <div class="popup-message">${message}</div>
            <button class="popup-button">OK</button>
        </div>
    `;

    document.body.appendChild(popup);
    activePopup = popup;

    // Force reflow for animation
    popup.offsetHeight;
    popup.classList.add('active');

    popup.querySelector('.popup-button').addEventListener('click', () => {
        popup.classList.remove('active');
        setTimeout(() => popup.remove(), 300);
        activePopup = null;
    });
}

// Update buyTimeAccelerator function
function buyTimeAccelerator() {
    if (currentDay < TIME_ACCELERATOR.unlockDay) {
        showPopup('Locked', `Unlocks on day ${TIME_ACCELERATOR.unlockDay}`);
        return;
    }

    if (TIME_ACCELERATOR.active) {
        showPopup('Already Active', 'Time Accelerator is already running!');
        return;
    }

    if (score >= TIME_ACCELERATOR.cost) {
        SOUNDS.purchase.currentTime = 0;
        SOUNDS.purchase.play();
        score -= TIME_ACCELERATOR.cost;
        document.getElementById("score").innerText = Math.round(score);
        activateTimeAccelerator();
        sendGameUpdateToCat('TIME_ACCELERATOR');
    } else {
        showPopup('Not Enough Points', `You need ${TIME_ACCELERATOR.cost} points!`);
        sendGameUpdateToCat('FAILED_PURCHASE', 'Time Accelerator', TIME_ACCELERATOR.cost);
    }
}

function activateTimeAccelerator() {
    TIME_ACCELERATOR.active = true;
    timeMultiplier = TIME_ACCELERATOR.multiplier;
    const button = document.querySelector('#timeAcceleratorButton');
    if (button) button.classList.add('auto-active');
    
    // Clear existing timeout if any
    if (timeAcceleratorTimeout) clearTimeout(timeAcceleratorTimeout);
    
    timeAcceleratorTimeout = setTimeout(() => {
        TIME_ACCELERATOR.active = false;
        timeMultiplier = 1;
        if (button) button.classList.remove('auto-active');
    }, TIME_ACCELERATOR.duration);
}

// Add these functions at the end of the file
function toggleChat() {
    document.querySelector('.chat-container').classList.toggle('minimized');
}

// Update addMessage function
function addMessage(text, isUser) {
    if (!isUser) {
        SOUNDS.chat.currentTime = 0;
        SOUNDS.chat.play();
    }
    const messagesDiv = document.getElementById('chatMessages');
    const message = document.createElement('div');
    message.className = `message ${isUser ? 'user-message' : 'bot-message'}`;
    
    if (!isUser) {
        const avatar = document.createElement('div');
        avatar.className = 'bot-avatar';
        const img = document.createElement('img');
        img.src = currentSprite; // Use current cat sprite as avatar
        avatar.appendChild(img);
        message.appendChild(avatar);
    }
    
    // Add emoji and formatting to Car(T)'s messages
    if (!isUser) {
        text = text.replace(/\b(noob|rookie|player)\b/gi, '𝗇𝗈𝗈𝖻');
        text = text.replace(/!([^!]|$)/g, '! 😼$1');
        text = text.replace(/\?([^?]|$)/g, '? 🤔$1');
    }
    
    message.innerHTML += text;
    messagesDiv.appendChild(message);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
    
    // Animate avatar if it's a bot message
    if (!isUser) {
        const frameCount = totalFrames;
        let currentFrame = 0;
        
        const animateAvatar = () => {
            const img = message.querySelector('.bot-avatar img');
            if (img) {
                const frameX = currentFrame * frameWidth;
                img.style.transform = `translateX(-${frameX}px)`;
                currentFrame = (currentFrame + 1) % frameCount;
            }
        };
        
        setInterval(animateAvatar, 100);
    }
}

function getRandomResponse() {
    return CART_RESPONSES[Math.floor(Math.random() * CART_RESPONSES.length)];
}

// Update sendMessage function
async function sendMessage() {
    const input = document.getElementById('messageInput');
    const text = input.value.trim();
    
    if (text) {
        addMessage(text, true);
        input.value = '';
        
        try {
            const response = await fetch('https://cat-4-naym.onrender.com/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    message: text,
                    session_id: SESSION_ID
                })
            });
            
            const data = await response.json();
            addMessage(data.response, false);
        } catch (error) {
            console.error('Error:', error);
            addMessage("Git gud! JK, I'm having connection issues! Try again?", false);
        }
    }
}

// Add event listener for Enter key
document.getElementById('messageInput').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        sendMessage();
    }
});

// Initialize chat with a welcome message
document.addEventListener('DOMContentLoaded', () => {
    // ...existing code...
    addMessage("Well, well, well... Look who decided to join the party! Ready to get carried or what?", false);
});

// Add periodic score updates function
function initializeScoreUpdates() {
    setInterval(() => {
        const messages = [
            "Still stuck at",
            "Grinding away at",
            "Somehow managed to reach",
            "Look who made it to",
            "Not bad, sitting at",
            "Your clicks got you to"
        ];
        const message = messages[Math.floor(Math.random() * messages.length)];
        sendGameUpdateToCat('SCORE_UPDATE', score, message);
    }, 30000); // Every 30 seconds
}

// Add near the top with other variables
const TITLE_SCREEN_DURATION = 3000; // 3 seconds

// Update the DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    // Show title screen for specified duration
    setTimeout(() => {
        const titleScreen = document.getElementById('titleScreen');
        titleScreen.classList.add('fade-out');
        
        // Remove from DOM after fade animation
        setTimeout(() => {
            titleScreen.remove();
        }, 1000);
    }, TITLE_SCREEN_DURATION);

    // ...existing initialization code...
    initializeButtonAnimations();
    initializeSeasons();
    updateTimeAcceleratorButton();
    initializeScoreUpdates();
});

// Start animation when image loads
loadSprite();

document.addEventListener('DOMContentLoaded', () => {
    initializeButtonAnimations();
    initializeSeasons();
    updateTimeAcceleratorButton();
    initializeScoreUpdates(); // Add this line
});


let images = [
    "assets/bg/lake.jpg", 
    "assets/bg/night.jpg", 
    "assets/bg/flowerland.jpg",
    "assets/bg/autumn.jpg",
    "assets/bg/grass.jpg",
    "assets/bg/winter.jpg"
];

let currentIndex = 0;

function changeBackground() {
    document.body.style.backgroundImage = `url('${images[currentIndex]}')`;
    currentIndex = (currentIndex + 1) % images.length;
    setTimeout(changeBackground, currentIndex === 0 ? 20000 : 10000);
}

setTimeout(changeBackground, 10000);