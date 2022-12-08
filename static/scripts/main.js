/* 
    This is the main sript that manages the game.
    It is run when the page is initially loaded.
*/

// Main player objects
import { Player } from '/static/scripts/objects/player.js'
// UI rendering function
import { renderUI } from '/static/scripts/UI/uiMain.js'
// Various tools (functions) for managing the game
import { newImage, buildWorld, drawWorld, blocks, npcs, ghosts, supplies, texts, background, getLevel, playAudio, playMusic, stopMusic } from '/static/scripts/tools.js'
// Variouse tools (functions) for managing objects, npcs and player
import { scrollOffset, resetOverScroll, resetScroll } from '/static/scripts/objects/objectTools.js'

// main game div container
const main = document.getElementById('game')
// Gets the rect of the game window
const gameSize = main.getBoundingClientRect()
// Main game canvas layer
export const canvas = document.getElementById('mainCanvas')
// Canvas 3d context object
const c = canvas.getContext('2d')

// Sets the size of the game window
canvas.width = gameSize.width
canvas.height = gameSize.height

// Variables for variouse game aspects
// Distance from left edge of screen where screen will begin to scroll
export const blockLeft = 100
// Distance from right edge of screen where screen will begin to scroll
export const blockRight = Math.round(canvas.width - 200)
export const gravity = 1.75 // Fall speed
// If game has been initiated and is not paused
let playing = false
let paused = false
// Max fall speed
const terminalVelocity = 20
// Game has ended?
export let gameOver = false


// Values for if the user is pressing the action keys
// Set using event listeners below
export const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    down: {
        pressed: false
    },
    attack: {
        pressed: false
    },
    draw: {
        pressed: false
    },
    jump: {
        pressed: false
    }
}




/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            INITIALIZATION
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
*/

// Main player variable
export let player
// Gets world data from the server
// Ajax function is stored in the tools script
export let world = await getLevel()
// How long the map is in pixels.
export let finishLine = world.gameLength

// Replaces each item in the world sounds arrays with sound objects
// in other words, for each song in each sound tract, set song as audio object instead of a string
function loadWorldSounds() {
    return new Promise(async resolve => {
        for (const key in world.sounds) {
            world.sounds[key] = await world.sounds[key].map(sound => {
                return new Audio(`/static/sounds/world/${sound}.wav`)
            })
        }
        resolve()
    })
    
}
await loadWorldSounds()

// Button to initialize the game
const initiateButton = document.getElementById('initiateButton')
// When clicked, start the game
initiateButton.addEventListener('click', () => {
    initiate()
})

// Plays the ambiant music. Called from the tools script
playMusic('light')

// Initiates the game
async function initiate() {
    // Adds loading animation to screen and hides the spash image
    main.classList.add('loading')
    initiateButton.classList.add('hide') 

    // Creates player object
    // Parameters are pulled from the world variable that was retrived from the server
    player = new Player({ 
        images: [await newImage('/static/images/red hood sprite.png'), await newImage('/static/images/red hood sprite_flipped.png')],
        position: {x: world.player.start[0], y: world.player.start[1]},
        frames: [12,11],
        frame: [0,0],
        gravity: gravity
    },
    {
        health: world.player.health
    }, canvas)

    // Creates all objects and npcs. Called from the tools script
    await buildWorld(world, canvas)  
    

    // Starts game rendering
    animate()
     
}


// Frame rate throtteling variable
let fpsInterval = 1000 / 45
// Recursive function that handles rendering, user input and object interactions
function animate() {
    playing = true
    // Timeout used to slow down framerate
    setTimeout(() => {
        // If game is not paused, recursivly call animate function again.
        if (!paused) {
            requestAnimationFrame(animate);
        }
        
        // Clears the previous frame of the main game canvas
        c.clearRect(0,0,canvas.width, canvas.height)

        // Updates and renders each object and npc
        drawWorld(c, canvas, scrollOffset, finishLine, terminalVelocity)

        // Udates and renders player
        player.update(c, terminalVelocity, keys, canvas)

        // Renders ui elements (health level and arrow count)
        renderUI()

    }, fpsInterval);
    // Shows the UI (healthbar and arrow slot)
    document.getElementById('ui').classList.add('show')
    // Hides the loading animation
    main.classList.remove('loading')
}

// Function to reset the game to original state
export function reset() {
    gameOver = false
    resetOverScroll()
    // Ensures original sound tract is playing
    playMusic('light')

    resetScroll()

    background.reset()

    blocks.forEach(blk => {
        blk.reset()
    })

    player.reset()
    
    npcs.forEach(npc => {
        npc.reset()
    })
    ghosts.forEach(ghst => {
        ghst.reset()
    })
    texts.forEach(txt => {
        txt.reset()
    })
    supplies.forEach(item => {
        item.reset()
    })

    paused = false
}

/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                CONTROLS
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
*/





// Detects key presses
window.addEventListener('keydown', e => {
    const keyCode = e.keyCode
    // console.log(keyCode)
    switch (keyCode) {
        case 13:
            //  Enter - Starts game from splash screen
            !playing && initiate()
            break
        case 27:
            //  Esc - Pauses game
            playing && pauseGame()
            break
        case 38:
        case 32:
        case 87:
            // W
            // [Spacebar]
            // Up
            // Player jumping action
            if (paused) return
            keys.jump.pressed = true
            // If playing is not already jumping
            if (player.velocity.y == 0 && player.jump) {
                player.jump = false
                player.velocity.y -= player.jumpHeight
                // Stops any attack or weapon animations
                player.attacking = false
                player.weaponState = 0
            }
            // Prevents keypress from scrolling the page.
            e.preventDefault()
            break
        case 97:
        case 70:
            // numpad 1
            // F (Shoot)
            // If playing is not sliding, start shooting animation
            // Weapon state is used to determin at which point the animation is at.
            // 0 is not drawn, 1 is in the proccess of drawing, 2 is fully drawn and 3 is shooting
            if (player.sliding == 0) {
                player.weaponState = 1
            }
            
            keys.draw.pressed = true
            break
        case 69:
        case 96:
            // E
            // numpad 0 (attack)
            keys.attack.pressed = true
            break

        case 37:
        case 65:
            // A
            // Left (move left)
            keys.left.pressed = true
            break
        
        case 39:
        case 68:
            // D
            // Right (move right)
            keys.right.pressed = true
            break

        case 40:
        case 83:
        case 17:
            // Down
            // S
            // Ctrl (slide)
            // prevents key from scrolling page
            e.preventDefault()
            // If playing is running and not already sliding
            if (player.running && !keys.down.pressed && player.sliding == 0) {
                // Slide player based on the current movement direction
                player.flipped ? player.sliding = 24 : player.sliding = -24
            }
            keys.down.pressed = true
            break
    }
})

// Detects when user stops pressing key
window.addEventListener('keyup', ({ keyCode }) => {
    switch (keyCode) {
        case 37:
        case 65:
            // Left (stop running left)
            keys.left.pressed = false
            break

        case 39:
        case 68:
            // Right (stop running right)
            keys.right.pressed = false
            break
        case 40:
        case 83:
        case 17:
            // Down
            // S
            // Ctrl (reset attack)
            keys.down.pressed = false
            break
    
        case 38:
        case 32:
        case 87:
            // W
            // [Spacebar]
            // Up (reset jump)
            keys.jump.pressed = false
        
        case 97:
        case 70:
            // numpad 1
            // F (Shoot)
            // If bow is fully drawn, set to weapon state 3 (fire arrow)
            if (player.weaponState == 2) {
                player.weaponState = 3
            } else {
                // If not fully drawn, reset animation
                player.weaponState = 0
            }
            keys.draw.pressed = true
            break

        case 69:
        case 96:
            // E
            // numpad 0 (reset attack)
            keys.attack.pressed = false
            break
    }

})

//  --- Menu buttons and actions


const pauseButton = document.getElementById('pauseButton')
const resumeButton = document.getElementById('closeMenu')
const resetButton = document.getElementById('resetGame')

// Toggle game pause when pause button is pressed
pauseButton.addEventListener('click', () => {
    pauseGame()
})

// Resume game when resume button (in pause menu) is pressed
resumeButton.addEventListener('click', () => {
    pauseGame(true)
})

// Resets game when the reload button (in gameover of game won menu) is pressed
resetButton.addEventListener('click', () => {
    // Closes game over menu
    toggleGameOverMenu()
    // Resets game
    reset()
    // Restarts game rendering
    animate()
})

function pauseGame(resumeGame) {
    // Prevents game from unpausing if the game is over
    if (gameOver) return
    // ensure the game is resumed and not repaused when resume button is pressed
    if (resumeGame) {
        paused = false
        pauseButton.classList.remove('paused')
        animate()
        return
    }
    // Toggles game pause state
    paused = !paused
    pauseButton.classList.toggle('paused')
    animate()
}

// Sets game end based on world data. Called from tools script
export function setGameEnd(end) {
    finishLine = end
}

// show game victory senario when game is won. Called from skeleton object script when killed
// Victory music
const gameWonAudio = new Audio('/static/sounds/world/win.wav')
export function showGameHasWon() {
    // Stops current sound tract. Lives in tools script
    stopMusic()
    // passes and ends game
    paused = true
    gameOver = true
    // Show victory message to user
    toggleGameOverMenu(`
        <h3>Congradulations</h3>
        <h4>You Won!</h4>\<p>Thank you for playing my game.</p>
    `, 'gamewon')
    // Plays victory sound is not already playing
    gameWonAudio.paused && playAudio(gameWonAudio)
}

// shows game lose senario. Called player object script whenever player dies
const gameOverAudio = new Audio('/static/sounds/world/lose.wav')
export function showGameHasLost() {
    // Stops current sound tract
    stopMusic()
    //  pauses and ends game
    paused = true
    gameOver = true
    // Shows death message to user
    toggleGameOverMenu(`
        <img class="death-image" src="/static/images/ui/death.png">
        <h3>You died...</h3>
    `, 'gameover')
    // Plays game over audio if not already playing
    gameOverAudio.paused && playAudio(gameOverAudio)
}

// Function to open game over menu (vitory or defeat)
function toggleGameOverMenu(msg, clas) {
    // Message box element
    const box = document.getElementById('gameOverMenu')
    // Set box text to provided HTML message
    box.children[0].innerHTML = msg
    // if a style class is provided, set box classlist to that class
    if (clas) {
        box.classList = `show ${clas}`
        
    } else {
        box.classList = ''
    }
    
    
}