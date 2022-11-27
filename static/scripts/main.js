import { Player } from '/static/scripts/objects/player.js'
import { renderUI } from '/static/scripts/UI/uiMain.js'
import { newImage, buildWorld, drawWorld, blocks, npcs, getLevel } from '/static/scripts/tools.js'
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

const jumpHeight = 18
export let finishLine = 1500 // Length to scroll before winning
export const blockLeft = 100
export const blockRight = Math.round(canvas.width - 200)
export const gravity = 1.75 // Fall speed
const terminalVelocity = 34
let gameOver = false


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
let imp
let images = {}
let world = await getLevel()

async function initiate() {
    // Player Sprite
    const playerImg = await newImage('/static/images/red hood sprite.png')
    const playerFlipped = await newImage('/static/images/red hood sprite_flipped.png')
    
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
    
}

initiate()


// Frame rate throtteling variable
let fpsInterval = 1000 / 45
// Looping function that handles drawing, user input and object interactions
function animate() {
    // Timeout used to slowdown framerate
    setTimeout(() => {
        requestAnimationFrame(animate);
        // Clears the previous frame
        c.clearRect(0,0,canvas.width, canvas.height)

        drawWorld(c, canvas, scrollOffset, finishLine, terminalVelocity)

        // Udates player
        player.update(c, terminalVelocity, keys, canvas)
        // Marks game win
        if (scrollOffset >= finishLine && !gameOver) {
            gameOver = true
            player.position.x = player.position.x -1
            console.log('you win')
        }
    }, fpsInterval);

    renderUI()

    // requestAnimationFrame(animate)
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
    player.reset()
    blocks.forEach(blk => {
        blk.reset()
    })
    resetScroll()
    npcs.forEach(npc => {
        npc.reset()
    })
}



// Detects key presses
window.addEventListener('keydown', ({ keyCode }) => {
    // console.log(keyCode)
    switch (keyCode) {
        case 38:
        case 32:
        case 87:
            // W
            // [Spacebar]
            // Up
            keys.jump.pressed = true
            if (player.velocity.y == 0 && player.jump) {
                player.jump = false
                player.velocity.y -= jumpHeight
                // player.sliding > 0 ? player.velocity.x += 10 : player.sliding < 0 ? player.velocity.x -= 10 : null
            }
            break
        case 96:
        case 70:
            // numpad 0
            // F (Shoot)
            if (player.sliding == 0) {
                player.weaponState = 1
            }
            
            
            keys.draw.pressed = true
            break
        case 67:
        case 97:
            // C
            // numpad 1
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
        
        case 96:
        case 70:
            // numpad 0
            // F (Shoot)
            if (player.weaponState == 2) {
                player.weaponState = 3
            } else {
                player.weaponState = 0
            }
            keys.draw.pressed = true
            break

        case 67:
        case 97:
            // C
            // numpad 1
            keys.attack.pressed = false
            break
    }

})

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