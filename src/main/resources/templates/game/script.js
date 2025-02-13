// Game variables
let points = 0;
let upgradeCost = 10;

// Update points display
function updatePointsDisplay() {
    document.getElementById('points').innerText = points;
}

// Handle click event
document.getElementById('click-button').addEventListener('click', () => {
    points++;
    updatePointsDisplay();
});

// Handle upgrade purchase
document.getElementById('upgrade-button').addEventListener('click', () => {
    if (points >= upgradeCost) {
        points -= upgradeCost;
        upgradeCost *= 2; // Increase cost for next upgrade
        document.getElementById('upgrade-button').innerText = `Upgrade (Cost: ${upgradeCost} points)`;
        updatePointsDisplay();
    } else {
        alert('Not enough points for upgrade!');
    }
});
