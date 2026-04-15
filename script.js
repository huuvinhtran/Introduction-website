// Grab the knight element from the DOM to manipulate its position and animation
const knight = document.getElementById('knight');

// --- DYNAMIC SCREEN CALCULATIONS ---
const screenWidth = window.innerWidth;
const screenHeight = window.innerHeight;
const floorLevel = (screenHeight * 0.8) - 64; // Ground starts at 80% down, minus knight height

// --- CHARACTER STATE & PHYSICS ---
let x = 200;               
let y = floorLevel;        // Start the knight exactly on our new dynamic floor
let velocityY = 0;         
const gravity = 0.4;       
const jumpPower = -22;   
let isJumping = false;     
const speed = 8;

// --- MULTIPLE BALLOONS DATA ---
const balloons = [
    { id: 'balloon-1', panelId: 'intro', x: 200, y: 170, width: 40, height: 40, isPopped: false },
    { id: 'balloon-2', panelId: 'myself', x: 600, y: 170, width: 40, height: 40, isPopped: false },
    { id: 'balloon-3', panelId: 'project', x: 1000, y: 170, width: 40, height: 40, isPopped: false },
    { id: 'balloon-4', panelId: 'contact', x: 1400, y: 170, width: 40, height: 40, isPopped: false }
];

// --- AUTO-PILOT STATE ---
let autoTargetBalloon = null; // Stores the balloon the player just clicked

// --- INITIALIZE BALLOONS (RUNS ONCE) ---
balloons.forEach(b => {
    const el = document.getElementById(b.id);
    el.style.left = b.x + 'px';
    el.style.top = b.y + 'px';
    el.style.cursor = 'pointer'; // Makes it look clickable on desktop
    
    // Listen for clicks/taps to engage Auto-Pilot
    el.addEventListener('click', () => {
        if (!b.isPopped) {
            autoTargetBalloon = b; 
        }
    });
});

// --- ATTACK STATE ---
let isAttacking = false;   
let attackFrames = 0;      

// --- INPUT TRACKING ---
const keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, a: false, s: false, w: false, d: false };

window.addEventListener('keydown', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = true;
    if (e.code === 'Space') {
        isAttacking = true;
        attackFrames = 15; 
    }
});

window.addEventListener('keyup', (e) => {
    if (keys.hasOwnProperty(e.key)) keys[e.key] = false;
});

// --- MAIN GAME LOOP ---
function update() {
    let newClass = 'idle-right'; 

    // --- AUTO-PILOT LOGIC ---
    if (autoTargetBalloon) {
        let targetX = autoTargetBalloon.x - 12; 

        // 1. Walk to the balloon
        if (Math.abs(x - targetX) > speed) {
            if (x < targetX) { 
                x += speed; 
                newClass = 'walk-right'; 
            } else { 
                x -= speed; 
                newClass = 'walk-left'; 
            }
        } 
        // 2. We are under the balloon! Time to Jump and Cut.
        else {
            x = targetX; // Snap exactly to the center position
            
            // Jump! (This fires the exact frame the knight arrives)
            if (!isJumping && y >= floorLevel && !autoTargetBalloon.isPopped) {
                velocityY = jumpPower; 
                isJumping = true;      
            }

            // Trigger the attack (cut) when the knight jumps high enough
            if (isJumping && y <= autoTargetBalloon.y + 60 && !isAttacking) {
                isAttacking = true;
                attackFrames = 15; 
            }
        }

        // 3. Turn off Auto-Pilot ONLY when the balloon officially pops
        if (autoTargetBalloon.isPopped) {
            autoTargetBalloon = null;
        }

    }
    // --- MANUAL CONTROLS ---
    else {
        if (keys.ArrowRight || keys.d) { 
            x += speed; 
            newClass = 'walk-right'; 
        } else if (keys.ArrowLeft || keys.a) { 
            x -= speed; 
            newClass = 'walk-left'; 
        }

        if ((keys.ArrowUp || keys.w) && !isJumping) {
            velocityY = jumpPower; 
            isJumping = true;      
        }
    }

    // Stop the knight from walking off the left or right edges
    if (x < 0) x = 0;
    if (x > screenWidth - 64) x = screenWidth - 64;

    // Apply Gravity
    velocityY += gravity; 
    y += velocityY;       
    
    // Ground Collision Detection
    if (y >= floorLevel) {
        y = floorLevel;     
        velocityY = 0;      
        isJumping = false;  
    }

    // Attack & Balloon Collision Logic (RESTORED!)
    if (isAttacking) {
        newClass = 'attack-right'; 
        attackFrames--;            
        
        if (attackFrames <= 0) isAttacking = false; 

        let knightWidth = 64;
        let knightHeight = 64;

        // Loop through all balloons to check for hitbox overlap
        balloons.forEach(balloon => {
            if (!balloon.isPopped) {
                // The Hitbox Math
                if (x < balloon.x + balloon.width &&
                    x + knightWidth > balloon.x &&
                    y < balloon.y + balloon.height &&
                    y + knightHeight > balloon.y) {
                    
                    // 1. Pop the balloon
                    balloon.isPopped = true;
                    document.getElementById(balloon.id).classList.add('popped'); 
                    
                    // 2. Display the corresponding portfolio HTML panel
                    document.getElementById(balloon.panelId).style.display = 'block'; 

                    // 3. NEW: Set a timer to respawn the balloon after 1.5 seconds (1500 milliseconds)
                    setTimeout(() => {
                        balloon.isPopped = false; // Tell the game it's alive again
                        document.getElementById(balloon.id).classList.remove('popped'); // Restore its size
                    }, 650);
                }
            }
        });
    }

    // Update the DOM
    knight.style.left = x + 'px';
    knight.style.top = y + 'px';
    
    if (knight.className !== newClass) {
        knight.className = newClass;
    }

    requestAnimationFrame(update);
}

// UI EVENT LISTENERS
document.querySelectorAll('.close-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.parentElement.style.display = 'none'; 
    });
});

update();