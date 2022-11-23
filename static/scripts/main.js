import { Player } from '/static/scripts/objects/player.js'
import { renderUI } from '/static/scripts/UI/uiMain.js'
import { newImage, buildWorld, drawWorld, blocks, npcs } from '/static/scripts/tools.js'
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
const gravity = 1.75 // Fall speed
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
    down : {
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
let world = { 
    gameLength: 1600,
    player: {
        start: [100, 0],
        health: 100
    },
    npcs: [
        {
            note: 'fox',
            type: 'generic',
            start: [500, 33],
            health: 100,
            interactive: false,
            physics: false,
            sprite: [
                '/static/images/sprites/Fox Sprite Sheet_flipped.png',
                '/static/images/sprites/Fox Sprite Sheet.png'
            ],
            speed: .75,
            contact: {mt: 10, t: 10, r: 42, b: -8, l: 12},
            frames: [14, 7],
            delay: 12,
            animated: [{from: [1,0], to: [1,1], key: 'right', time: 1},
            {from: [6,0], to: [6,6], key: null, time: 7},
            {from: [5,0], to: [5,5], key: null, time: 300},
            {from: [2,0], to: [2,7], key: 'right', time: 300},
            {from: [1,0], to: [1, 13], key: null, time: 50},
            {from: [1,0], to: [1,1], key: 'left', time: 1},
            {from: [6,0], to: [6,6], key: null, time: 7},
            {from: [5,0], to: [5,5], key: null, time: 300},
            {from: [2,0], to: [2,7], key: 'left', time: 300}]
        },
        {
            type: 'imp',
            start: [910, 35],
            health: 100,
            animated: [
                {key: ['left'], time: 260},
                {key: null, time: 200},
                {key: ['right', 'down'], time: 180},
                {key: ['right'], time: 200},
            ]
        },
        {
            note: 'squirrel',
            type: 'generic',
            start: [200, 21],
            health: 100,
            interactive: false,
            physics: false,
            sprite: [
                '/static/images/sprites/Squirrel Sprite Sheet_flipped.png',
                '/static/images/sprites/Squirrel Sprite Sheet.png'
            ],
            speed: .75,
            contact: {mt: 10, t: 10, r: 0, b: 3, l: 0},
            frames: [8,7],
            delay: 20,
            animated: [
                {from: [0,0], to: [0,4], key: null, time: 20},
                {from: [1,0], to: [1,4], key: null, time: 20},
                {from: [2,0], to: [2,7], key: 'right', time: 200},
                {from: [3,0], to: [3,3], key: null, time: 100},
                {from: [4,0], to: [4,1], key: null, time: 200},
                {from: [2,0], to: [2,7], key: 'left', time: 10},
                {from: [3,0], to: [3,3], key: null, time: 100},
                {from: [4,0], to: [4,1], key: null, time: 200},
                {from: [2,0], to: [2,7], key: 'right', time: 10},
                {from: [0,0], to: [0,4], key: null, time: 20},
                {from: [1,0], to: [1,4], key: null, time: 20},
                {from: [2,0], to: [2,7], key: 'left', time: 200}
            ]
        }
    ],
    objectsHash: [
        'x.15 1.gs 1.g 1.ge',
        '',
        '',
        'x.15 1.gs 1.g 1.ge',
        '',
        '',
        'x.15 4.gs 4.g 4.ge',
        'x.30 4.gs 4.g 4.ge',
        'x.30 4.e x.2 4.gs 4.g 4.ge',
        'x.5 1.gs 1.g.5 1.ge x.4 1.gs 1.g.45 1.ge'
    ],
    images: {
        background: [
            {img: '/static/images/backgrounds/woods_1.png', index: 0},
            {img: '/static/images/backgrounds/woods_2.png', index: 1},
            {img: '/static/images/backgrounds/woods_3.png', index: 2}
        ]
    }
}

async function initiate() {
    // Player Sprite
    const playerImg = await newImage('/static/images/red hood sprite.png')
    const playerFlipped = await newImage('/static/images/red hood sprite_flipped.png')
    
    await buildWorld(world, canvas, images)
    // Creates player

    player = new Player(playerImg, playerFlipped, world.player, canvas)

    // Initiates the game
    animate()
    
}

initiate(c, canvas, scrollOffset, finishLine)


// Frame rate throtteling variable
let fpsInterval = 1000 / 45
// Looping function that handles drawing, user input and object interactions
function animate() {
    // Timeout used to slowdown framerate
    setTimeout(() => {
        requestAnimationFrame(animate);
        
        

        // Clears the previous frame
        c.clearRect(0,0,canvas.width, canvas.height)

        drawWorld(c, canvas, scrollOffset, finishLine)
        
        npcs.forEach(npc => {
            if (npc.alive) {
                npc.update(c, canvas, gravity, terminalVelocity)
            }
            
        })

        // Udates player
        player.update(c, gravity, terminalVelocity, canvas)
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
        case 81:
            // numpad 0
            // Q (Shoot)
            if (player.sliding == 0) {
                player.weaponState = 1
            }
            
            
            keys.draw.pressed = true
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
        case 81:
            // numpad 0
            // Q (Shoot)
            if (player.weaponState == 2) {
                player.weaponState = 3
            } else {
                player.weaponState = 0
            }
            keys.draw.pressed = true
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