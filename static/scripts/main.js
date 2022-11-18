import { Player } from '/static/scripts/objects/player.js'
import { Block } from '/static/scripts/objects/block.js'
import { newImage, sizeWindow } from '/static/scripts/tools.js'

// Player Sprite
const playerSprite = await newImage('/static/images/red hood sprite.png')
const playerFlipped = await newImage('/static/images/red hood sprite_flipped.png')

// Platform image
const platImage = await newImage('/static/images/platform.png')

// Canvas div
const canvas = document.querySelector('canvas')
// Canvas 3d context object
const c = canvas.getContext('2d')

const speed = 5 // Player movement speed
const jumpHeight = 18
const finishLine = 1000 // Length to scroll before winning
const gravity = 1.75 // Fall speed
const terminalVelocity = 30
let gameOver = false
// Current window size, used for calculations when the window is resized
let win = {
    x: window.innerWidth,
    y: window.innerHeight
}
// Values for if the user is pressing the A or D keys
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    },
    draw: {
        pressed: false
    },
    slide: {

    }
}

/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                            INITIALIZATION
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
*/

// Creates player
const player = new Player(playerSprite, playerFlipped, win)
// Creates each collision block
const blocks = [
    new Block({ x: 200, y: 124, blocking: {x: false, y: true}, image: platImage }),
    new Block({ x: 325, y: 148, blocking: {x: false, y: true}, image: platImage }),
    new Block({ x: 450, y: 200, blocking: {x: false, y: true}, image: platImage }),
    new Block({ x: 525, y: 280, blocking: {x: false, y: true}, image: platImage }),
    new Block({ x: 100, y: 24, blocking: {x: true, y: true}, image: platImage }),
    new Block({ x: 1340, y: 24, blocking: {x: true, y: true}, image: platImage }),
    new Block({ x: 600, y: 24, blocking: {x: true, y: true}, image: platImage }),
    new Block({ x: 450, y: 48, blocking: {x: true, y: true}, image: platImage }),
]

win = sizeWindow(canvas)


// The scroll index for the environment
let scrollOffset = 0

// Frame rate throtteling variable
let fpsInterval = 1000 / 45

// Looping function that handles drawing, user input and object interactions
const animate = () => {
    // Timeout used to slowdown framerate
    setTimeout(function () {
        requestAnimationFrame(animate);
    
        // Clears the previous frame
        c.clearRect(0,0,canvas.width, canvas.height)

        // Udates player
        player.update(c, gravity, terminalVelocity)
        // Updates each platform
        blocks.forEach(block => {
            block.draw(c)
        })

        // Imobilaze player if damage animation is playing
        if (player.damaging > 0) return

        // Player movement and platform scrolling using player velocity
        // Moving to the right
        // If D is pressed and the player is < 60% away from right screen edge
        if (player.weaponState <= 0) {
            if ((keys.right.pressed || (player.velocity.x > 0 && player.sliding > 0)) && player.position.x < finishLine) {
                !player.flipped && player.flip()
                player.running = true
                player.velocity.x = speed
    
            // Moving to the left
            // If A key pressed and player is > 10% away from left screen edge
            } else if ((keys.left.pressed || (player.velocity.x < 0 && player.sliding > 0)) && player.position.x > 100) {
                player.flipped && player.flip()
                player.running = true
                player.velocity.x = speed * -1
            } else {
                // Stop player movement
                player.velocity.x = 0
                
                // Scrolls platforms opposite of player movement when player is at stopping points (simulates progression)
                // If D pressed and not at winning location
                if (keys.right.pressed && scrollOffset <= finishLine) {
                    scrollOffset += speed
                    player.running = true
                    // Moves each platfrom
                    blocks.forEach(block => {
                        block.position.x -= speed
                    })
                // If A pressed and player is not at start
                } else if (keys.left.pressed && scrollOffset >= 0) {
                    scrollOffset -= speed
                    player.running = true
                    // Moves each platform
                    blocks.forEach(block => {
                        block.position.x += speed
                    })
                } else {
                    player.running = false
                }
            }
        } else {
            player.velocity.x = 0
            running = false
        }
        

        // Platform collision
        // Ok... Phew... Lots of conditionals here
        // For each platform, if character is at its height and within its start and ending end, stop the character from falling.
        blocks.forEach(block => {
            // Vertical collision detection
            if (block.blocking.y) {
                if (player.position.y + player.contact.b <= block.position.y 
                    && player.position.y + player.contact.b + player.velocity.y > block.position.y
                    && player.position.x + player.contact.r >= block.position.x
                    && player.position.x + player.contact.l <= block.position.x + block.width
                    ) {
                    if (player.velocity.y > player.fallDamage) {
                        player.damaging = 20
                        player.position.y = block.position.y - player.contact.b - 1
                    } else {
                        player.position.y = block.position.y - player.contact.b
                    }
                    
                    player.velocity.y = 0
                }
            }

            // Horizontal collision detection
            if (block.blocking.x) {
                const btm = player.position.y + player.contact.b
                const top = player.position.y + player.contact.t
                if (btm <= block.position.y) return
                if(keys.right.pressed) {
                    if ((player.position.x + player.contact.r >= block.position.x
                        || player.position.x + player.contact.r + player.velocity.x > block.position.x)
                        && player.position.x + player.contact.r < block.position.x + (block.width / 2)
                        && !(top > block.position.y + block.height)
                    ) {
                        player.position.x = block.position.x - player.width + (player.width - player.contact.r) - 1
                        player.velocity.x = 0
                        player.running = false
                        
                    }
                }
                
                if (keys.left.pressed) {
                    if ((player.position.x + player.contact.l <= block.position.x + block.width
                        || player.position.x + player.contact.l - player.velocity.x < block.position.x + block.width)
                        && player.position.x + player.contact.l > block.position.x + (block.width / 2)
                        && !(top > block.position.y + block.height)
                    ) {
                        player.position.x = block.position.x + block.width - player.contact.l
                        player.velocity.x = 0
                        player.running = false
                    }
                }

                if (player.position.x + player.contact.r >= block.position.x
                    && player.position.x + player.contact.l <= block.position.x + block.width
                    && player.position.y + 36 < block.position.x + block.height
                    && player.sliding > 0
                ) {
                    player.sliding = 4
                }
            }
        })

        // Marks game win
        if (scrollOffset >= finishLine && !gameOver) {
            gameOver = true
            player.position.x = finishLine -1
            alert('You Win!')
        }
    }, fpsInterval);



    // requestAnimationFrame(animate)
    

       
}
// Initiates the game
animate()

/*
////////////////////////////////////////////////////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////////////////////////////////////////////////
                                                CONTROLS
///////////////////////////////////////////////////////////////////////////////////////////////////////////
//////////////////////////////////////////////////////////////////////////////////////////////////////////
*/



// Detects key presses
window.addEventListener('keydown', ({ keyCode }) => {
    console.log(keyCode)
    switch (keyCode) {
        case 37:
        case 65:
            // Left
            keys.left.pressed = true
            break

        case 83:
            // Down
            break

        case 40:
        case 39:
        case 68:
            // Right
            keys.right.pressed = true
            break
        
        case 17:
            if (player.velocity.x != 0) {
                player.sliding = 24
            }
            break

        case 38:
        case 32:
        case 87:
            // Up
            if (player.velocity.y == 0) {
                player.velocity.y -= jumpHeight
            }
            break
        
        case 69:
            // Shoot
            player.weaponState = 1
            keys.draw.pressed = true
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

        case 83:
            // Down
            break

            case 40:
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
    
        case 69:
            // Shoot
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
window.addEventListener('resize', () => {
    // Calculates the change in window height
    const dif = window.innerHeight - win.y
    // Moves player Y position based on the window size change
    player.position.y = player.position.y + dif
    // Redraws the player
    player.draw(c)
    // Resizes the canvas
    win = sizeWindow(canvas)
}, true)