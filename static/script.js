// Creates a new image object for the canvas to draw
function newImage(src) {
    return new Promise(resolve => {
        const img = new Image()
        img.src = src
        img.addEventListener('load', () => {
            resolve(img)
        })
    })
}

// Player Sprite
const playerSprite = await newImage('/static/images/red hood sprite.png')
// Platform image
const platImage = await newImage('/static/images/platform.png')

// Canvas div
const canvas = document.querySelector('canvas')
// Canvas 3d context object
const c = canvas.getContext('2d')

const speed = 5 // Player movement speed
const jumpHeight = 20 
const finishLine = 1000 // Length to scroll before winning
const gravity = 1.5 // Fall speed
// Current window size, used for calculations when the window is resized
const win = {
    x: window.innerWidth,
    y: window.innerHeight
}

// Player object class
class Player {
    constructor(image) {
        this.image = image

        this.width = this.image.width / 12
        this.height = this.image.height / 11
        this.contact = {
            t: '',
            r: this.width - 50,
            b: this.height - 35,
            l: 50
        }

        this.flipped = false

        // Position
        this.position = {
            x: 125,
            // Set relative to window height
            y: win.y - this.height - 20
        }
        this.frame = [0,0]
        // Movement speed
        this.velocity = {
            x: 0,
            y: 0
        }
    }

    flip() {
        this.flipped = !this.flipped
    }

    // Draws character to screen
    draw() {
        // c.fillStyle = 'red'
        // c.scale(this.flipped ? -1 : 1, 1)
        c.drawImage(this.image, this.frame[0], this.frame[1], this.width, this.height, this.position.x, this.position.y, this.width, this.height)
    }

    // Draw character and calculate new position
    update() {
        this.draw()
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        if (this.position.y + this.contact.b + this.velocity.y <= canvas.height) {
            this.velocity.y += gravity
        } else {
            this.velocity.y = 0
        }
    }
}

// Platform object class
class Platform {
    constructor({ x, y, image}) {
        // Platform location
        this.position = {
            x: x,
            // Set relative to window height
            y: window.innerHeight - y
        }
        // Platform image to be drawn
        this.image = image

        this.width = image.width
        this.height = image.height

        // Original values entered for position. Used to calculate position on window resize
        this.origin = {
            x,
            y
        }
    }

    // Calculates position and if the image is valid, draws the platform
    draw() {
        this.position.y = window.innerHeight - this.origin.y
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y)
        }
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
const player = new Player(playerSprite)
// Creates each platform
const platforms = [
    new Platform({ x: 200, y: 100, image: platImage }),
    new Platform({ x: 325, y: 150, image: platImage }),
    new Platform({ x: 100, y: 10, image: platImage }),
    new Platform({ x: 1340, y: 10, image: platImage })
]

// Values for if the user is pressing the A or D keys
const keys = {
    right: {
        pressed: false
    },
    left: {
        pressed: false
    }
}

// The scroll index for the environment
let scrollOffset = 0

// Looping function that handles drawing, user input and object interactions
const animate = () => {
    // Recuresive call on each frame
    requestAnimationFrame(animate)

    // Clears the previous frame
    c.clearRect(0,0,canvas.width, canvas.height)

    // Udates player
    player.update()
    // Updates each platform
    platforms.forEach(platform => {
        platform.draw()
    })

    // Player movement and platform scrolling using player velocity
    // Moving to the right
    // If D is pressed and the player is 400 away from screen edge
    if (keys.right.pressed && player.position.x < 400) {
        !player.flipped && player.flip()
        player.velocity.x = speed
    // If A key pressed and player is < 100 away from original x position
    } else if (keys.left.pressed && player.position.x > 100) {
        player.flipped && player.flip()
        player.velocity.x = speed * -1
    } else {
        // Stop player movement
        player.velocity.x = 0

        // Scrolls platforms opposite of player movement when player is at stopping points
        // If D pressed and not at winning location
        if (keys.right.pressed && scrollOffset <= finishLine) {
            scrollOffset += speed
            // Moves each platfrom
            platforms.forEach(platform => {
                platform.position.x -= speed
            })
        // If A pressed and player is not at start
        } else if (keys.left.pressed && scrollOffset >= 0) {
            scrollOffset -= speed
            // Moves each platform
            platforms.forEach(platform => {
                platform.position.x += speed
            })
        }
    }

    // Platform collision
    // Ok... Phew... Lots of conditionals here
    // For each platform, if character is at its height and within its start and ending end, stop the character from falling.
    platforms.forEach(platform => {
        if (player.position.y + player.contact.b <= platform.position.y 
            && player.position.y + player.contact.b + player.velocity.y >= platform.position.y
            && player.position.x + player.contact.r >= platform.position.x
            && player.position.x + player.contact.l <= platform.position.x + platform.width
            ) {
            player.velocity.y = 0;
        }
    })

    // Marks game win
    if (scrollOffset >= finishLine) {
        alert('You Win!')
    }
    
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

// Resizes the canvas when window is resized
const sizeWindow = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    // Sets variables to current window size.
    win.y = window.innerHeight
    win.x = window.innerWidth
}
// Initial canvas size
sizeWindow()

// Detects key presses
window.addEventListener('keydown', ({ keyCode }) => {
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

        case 38:
        case 32:
        case 87:
            // Up
            if (player.velocity.y == 0) {
                player.velocity.y -= jumpHeight
            }
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
    }
})

// Window resize event listener.
window.addEventListener('resize', () => {
    // Calculates the change in window height
    const dif = window.innerHeight - win.y
    // Moves player Y position based on the window size change
    player.position.y += dif
    // Redraws the player
    player.draw()
    // Resizes the canvas
    sizeWindow()
}, true)