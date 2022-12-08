import { Player } from '/static/scripts/objects/player.js'
import { renderUI } from '/static/scripts/UI/uiMain.js'
import { newImage, buildWorld, drawWorld, blocks, npcs, ghosts, supplies, texts, getLevel, playAudio, playMusic, stopMusic } from '/static/scripts/tools.js'
import { scrollOffset, resetScroll } from '/static/scripts/objects/objectTools.js'

// Canvas div
const main = document.getElementById('game')
const gameSize = main.getBoundingClientRect()
export const canvas = document.getElementById('mainCanvas')
// Canvas 3d context object
const c = canvas.getContext('2d')

// Current window size, used for calculations when the window is resized
let win = {
    x: gameSize.width,
    y: gameSize.height
}
canvas.width = win.x
canvas.height = win.y

// win = sizeWindow(canvas)

export let finishLine = 1500 // Length to scroll before winning
export const blockLeft = 100
export const blockRight = Math.round(canvas.width - 200)
export const gravity = 1.75 // Fall speed
let playing = false
let paused = false
const terminalVelocity = 20
export let gameOver = false


// Values for if the user is pressing the A or D keys
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

export let player
let images = {}
export let world = await getLevel()

function loadWorld() {
    return new Promise(async resolve => {
        for (const key in world.sounds) {
            world.sounds[key] = await world.sounds[key].map(sound => {
                return new Audio(`/static/sounds/world/${sound}.wav`)
            })
        }
        resolve()
    })
    
}
await loadWorld()

const initiateButton = document.getElementById('initiateButton')
initiateButton.addEventListener('click', () => {
    initiate()
})

playMusic('light')

async function initiate() {
    main.classList.add('loading')
    initiateButton.classList.add('hide') 

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

    await buildWorld(world, canvas, images)  
    

    // Initiates the game
    animate()
    playing = true
    document.getElementById('ui').classList.remove('hide') 
}

// initiate()


// Frame rate throtteling variable
let fpsInterval = 1000 / 45
// Looping function that handles drawing, user input and object interactions
function animate() {
    // Timeout used to slowdown framerate
    setTimeout(() => {
        if (!paused) {
            requestAnimationFrame(animate);
        }
        
        // Clears the previous frame
        c.clearRect(0,0,canvas.width, canvas.height)

        

        drawWorld(c, canvas, scrollOffset, finishLine, terminalVelocity)

        // Udates player
        player.update(c, terminalVelocity, keys, canvas)

        main.classList.remove('loading')
    }, fpsInterval);

    renderUI()
}

main.classList.add('loaded')

/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                CONTROLS
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
*/

export function reset() {
    gameOver = false

    playMusic('light')

    resetScroll()

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
    console.log('hello!')
}



// Detects key presses
window.addEventListener('keydown', e => {
    const keyCode = e.keyCode
    console.log(keyCode)
    switch (keyCode) {
        case 13:
            //  Esc
            !playing && initiate()
            break
        case 27:
            //  Esc
            playing && pauseGame()
            break
        case 38:
        case 32:
        case 87:
            // W
            // [Spacebar]
            // Up
            if (paused) return
            keys.jump.pressed = true
            if (player.velocity.y == 0 && player.jump) {
                player.jump = false
                player.velocity.y -= player.jumpHeight
                player.attacking = false
                player.weaponState = 0
            }
            e.preventDefault()
            break
        case 97:
        case 70:
            // numpad 1
            // F (Shoot)
            if (player.sliding == 0) {
                player.weaponState = 1
            }
            
            
            keys.draw.pressed = true
            break
        case 69:
        case 96:
            // E
            // numpad 0
            keys.attack.pressed = true
            break

        case 37:
        case 65:
            // A
            // Left
            keys.left.pressed = true
            break

        
        case 39:
        case 68:
            // D
            // Right
            keys.right.pressed = true
            break

        case 40:
        case 83:
        case 17:
            // Down
            // S
            // Ctrl
            e.preventDefault()
            if (player.running && !keys.down.pressed && player.sliding == 0) {
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
            // Left
            keys.left.pressed = false
            break

        case 39:
        case 68:
            // Right
            keys.right.pressed = false
            break

        // case 32:
        // case 87:
        //     // Up
        //     player.velocity.y -= jumpHeight
        //     break
        case 40:
        case 83:
        case 17:
            // Down
            // S
            // Ctrl
            keys.down.pressed = false
            break
    
        case 38:
        case 32:
        case 87:
            // W
            // [Spacebar]
            // Up
            keys.jump.pressed = false
        
        case 97:
        case 70:
            // numpad 1
            // F (Shoot)
            if (player.weaponState == 2) {
                player.weaponState = 3
            } else {
                player.weaponState = 0
            }
            keys.draw.pressed = true
            break

        case 69:
        case 96:
            // E
            // numpad 0
            keys.attack.pressed = false
            break
    }

})

const pauseButton = document.getElementById('pauseButton')
const resumeButton = document.getElementById('closeMenu')
const resetButton = document.getElementById('resetGame')
pauseButton.addEventListener('click', pauseGame)

resumeButton.addEventListener('click', pauseGame)

resetButton.addEventListener('click', () => {
    toggleGameOverMenu()
    reset()
    animate()
})

function pauseGame() {
    paused = !paused
    pauseButton.classList.toggle('paused')
    animate()
}

// Window resize event listener.
// window.addEventListener('resize', () => {
//     // Calculates the change in window height
//     const dif = window.innerHeight - win.y
//     // Moves player Y position based on the window size change
//     player.position.y += dif
//     // Redraws the player
//     player.draw(c)
//     // Resizes the canvas
//     win = sizeWindow(canvas)

    
// }, true)


export function setGameEnd(end) {
    finishLine = end
}

const gameWonAudio = new Audio('/static/sounds/world/win.wav')
export function showGameHasWon() {
    stopMusic()
    paused = true
    gameOver = true
    toggleGameOverMenu(`
        <h3>Congradulations</h3>
        <h4>You Won!</h4>\<p>Thank you for playing my game.</p>
    `, 'gamewon')
    gameWonAudio.paused && playAudio(gameWonAudio)
}

const gameOverAudio = new Audio('/static/sounds/world/lose.wav')
export function showGameHasLost() {
    stopMusic()
    paused = true
    gameOver = true
    toggleGameOverMenu(`
        <img class="death-image" src="/static/images/ui/death.png">
        <h3>You died...</h3>
    `, 'gameover')
    gameOverAudio.paused && playAudio(gameOverAudio)
}

function toggleGameOverMenu(msg, clas) {
    const box = document.getElementById('gameOverMenu')
    if (!clas) {
        box.classList = ''
    } else {
        box.children[0].innerHTML = msg
        box.classList = `show ${clas}`
    }
    
}