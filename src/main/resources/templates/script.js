let score = 0;
let doubleIncomeActive = false;
let doubleIncomeTimer = null;
let tripleIncomeActive = false;
let currentSprite = "components/CatIdle.png"; // Default sprite
let totalFrames = 10;
let frameWidth = 32;
let frameHeight = 32;
let scale = 4;
let frameSpeed = 5; // Lower is faster
let frameCount = 0;
let currentFrame = 0;
let animationFrameId;
let outfit2Bought = false;
let isDogPurchased = false;
let blackCatOutfitBought = false;

function addPoint(event) {
  // Get the mouse position relative to both canvases
  const canvasRect = canvas.getBoundingClientRect();
  const dogCanvasRect = dogCanvas.getBoundingClientRect();
  const mouseX = event.clientX - canvasRect.left;
  const mouseY = event.clientY - canvasRect.top;
  const dogMouseX = event.clientX - dogCanvasRect.left;
  const dogMouseY = event.clientY - dogCanvasRect.top;

  // Cat sprite position and dimensions
  const catX = 60;
  const catY = 10;
  const catWidth = frameWidth * scale;
  const catHeight = frameHeight * scale;

  // Dog sprite position and dimensions
  const dogX = 0;
  const dogY = 10;
  const dogWidth = dogFrameWidth * dogScale;
  const dogHeight = dogFrameHeight * dogScale;

  // Check cat click
  if (
      mouseX >= catX &&
      mouseX <= catX + catWidth &&
      mouseY >= catY &&
      mouseY <= catY + catHeight
  ) {
      let pointsToAdd = doubleIncomeActive ? 2 : 1;
      pointsToAdd = tripleIncomeActive ? pointsToAdd * 3 : pointsToAdd;
      score += pointsToAdd;
      document.getElementById("score").innerText = score;
      spawnFish(event.clientX, event.clientY);
  }

  // Check dog click (only if purchased)
  if (isDogPurchased &&
      dogMouseX >= dogX &&
      dogMouseX <= dogX + dogWidth &&
      dogMouseY >= dogY &&
      dogMouseY <= dogY + dogHeight
  ) {
      score += 2; // Add 2 points for clicking the dog
      document.getElementById("score").innerText = score;
      spawnBone(event.clientX, event.clientY);
  }
}

function spawnFish(x, y) {
  const fishImages = [
    "components/fish1.png",
    "components/fish2.png",
    "components/fish3.png",
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

function spawnBone(x, y) {
  const boneImages = [
      "components/bone1.png",
      "components/bone2.png"
  ];
  const bone = document.createElement("img");
  bone.src = boneImages[Math.floor(Math.random() * boneImages.length)];
  bone.classList.add("bone");

  // Randomize the starting position
  const randomXOffset = Math.floor(Math.random() * 50) - 25;
  const randomYOffset = Math.floor(Math.random() * 50) - 25;
  const randomRotation = Math.floor(Math.random() * 360);

  bone.style.left = `${x - 25 + randomXOffset}px`;
  bone.style.top = `${y - 25 + randomYOffset}px`;
  bone.style.transform = `rotate(${randomRotation}deg)`;

  document.body.appendChild(bone);
  bone.style.animationDuration = `${Math.random() * 1.5 + 1.5}s`;

  setTimeout(() => bone.remove(), 3000);
}

function buyDoubleIncome() {
  if (score >= 10) {
    score -= 10; // Deduct points for purchase
    document.getElementById("score").innerText = score;

    // Activate double income for 10 seconds
    doubleIncomeActive = true;
    setTimeout(() => {
      doubleIncomeActive = false;
    }, 10000); // Reset after 10 seconds
  } else {
    alert("Not enough points!");
  }
}

function buyOutfit2() {
  if (score >= 50) {
    score -= 50; // Deduct points for purchase
    document.getElementById("score").innerText = score;
    outfit2Bought = true;
    alert("Outfit 2 purchased! You can now equip it.");
  } else {
    alert("Not enough points to buy Outfit 2!");
  }
}


function buyBlackCatOutfit() {
if (score >= 30) {
score -= 30; // Deduct points for purchase
document.getElementById("score").innerText = score;
blackCatOutfitBought = true;
alert("BlackCatIdle purchased! You can now equip it.");
} else {
alert("Not enough points to buy BlackCatIdle!");
}
}


function switchOutfit(spritePath, frames, width, height, newScale) {
  if (spritePath === "components/Box3.png" && !outfit2Bought) {
    alert("You need to buy Outfit 2 first!");
    return;
  }
  if (spritePath === "components/BlackCatIdle.png" && !blackCatOutfitBought) {
    alert("You need to buy Black first!");
    return;
  }
  
  currentSprite = spritePath;
  totalFrames = frames;
  frameWidth = width;
  frameHeight = height;
  scale = newScale;
  loadSprite();
}

function buyDog() {
  if (isDogPurchased) {
    alert("You already have a dog companion!");
    return;
  }
  
  if (score >= 20) {
      score -= 20;
      document.getElementById("score").innerText = score;
      isDogPurchased = true;
      document.getElementById("dogCanvas").style.display = "block";
      alert("Dog companion purchased! Take good care of it!");
  } else {
      alert("Not enough points! You need 20 points to buy a dog companion.");
  }
}

function spawnPowerUp() {
  const powerUp = document.createElement("img");
  powerUp.src = "components/powerUp.png";
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
const dogCanvas = document.getElementById("dogCanvas");
const dogCtx = dogCanvas.getContext("2d");

// Set canvas sizes
canvas.width = 178;
canvas.height = 150;
dogCanvas.width = 195;
dogCanvas.height = 150;

// Load sprites
const sprite = new Image();
sprite.src = currentSprite;

const dogSprite = new Image();
dogSprite.src = 'components/Dogidle.png';
const dogFrames = 4;
const dogFrameWidth = 60; // Adjust based on your sprite sheet
const dogFrameHeight = 40; // Adjust based on your sprite sheet
const dogScale = 3.5;
let dogCurrentFrame = 0;
let dogFrameCount = 0;

function animateSprite() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  dogCtx.clearRect(0, 0, dogCanvas.width, dogCanvas.height);

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

  // Draw dog sprite - moved closer to cat
  let dogFrameX = dogCurrentFrame * dogFrameWidth;
  dogCtx.drawImage(
      dogSprite,
      dogFrameX, 0,
      dogFrameWidth, dogFrameHeight,
      0, 10, // Moved X position closer to left edge
      dogFrameWidth * dogScale,
      dogFrameHeight * dogScale
  );

  // Update frames
  frameCount++;
  if (frameCount >= frameSpeed) {
    currentFrame = (currentFrame + 1) % totalFrames;
    frameCount = 0;
  }

  dogFrameCount++;
  if (dogFrameCount >= frameSpeed) {
    dogCurrentFrame = (dogCurrentFrame + 1) % dogFrames;
    dogFrameCount = 0;
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

// Start animation when image loads
loadSprite();
