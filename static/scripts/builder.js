/*
    This script manages the builder dev tool for creating the main level layout.
    It is run when the /build page is loaded.

    The page is a series of squares/recatangles that resize to fit the screen.

    Each sqaure represents a 24px x 24px space in the final game.

    known issue:
    Sprites (npcs and player) postions are not accurate. They need to be placed above the desired placement or the will be placed below the floor
*/

// Main div container
const main = document.getElementById('level')
// Element holding the information for which type of block will be placed
const ind = document.getElementById('indicator')

// Array to hold the type information for the block to be placed.
let type = []
// Array to hold the physics information for the block to be placed.
let blocking = [0]
// mouse is pressed
let clicking = false
// if true will add keystroked to blocking array
let blockingEdit = false
// is level information compiled
let built = false
// World data object to be sent to server
let world = {}
// if key is down to add sprite
let addingSprite = false
// if key is down to add supply item
let addingSupply = false
// Current dom element being dragged
let elementSelected = {}
// Dom element representing the player
const player = document.getElementById('player')
// List of dom elements representing npcs
let sprites = document.querySelectorAll('.sprite')
// List of dom elements representing supply items
let supplies = document.querySelectorAll('.supply')
// Each square in the dom representing a 24 x 24 space
const square = document.querySelector('.square')
// if dragging element
let dragging = false

// If player is being hovered over
player.addEventListener('mouseover', e => {
    if (!clicking) {
        // If mouse is not down, select player
        elementSelected = player
    }
})
// If mouse leaves player
player.addEventListener('mouseout', e => {
    if (elementSelected == player && !clicking) {
        // if player is currently selected and mouse is not clicked, reset selected item
        elementSelected = {}
    }
})

// for each npc item
sprites.forEach(sprite => {
    // 
    setSpriteTileCount(sprite)
    setItemPosition(sprite)
    sprite.addEventListener('mouseover', () => {
        if (!clicking) {
            elementSelected = sprite
        }
    })
    sprite.addEventListener('mouseout', () => {
        if (elementSelected == sprite && !clicking) {
            elementSelected = {}
        }
    })
})

supplies.forEach(item => {
    // Sets attributes on the element for the number of 24 x 24 spaces away from the left bottom of the screen the element is
    setSpriteTileCount(item)
    // sets the elements position in the builder
    setItemPosition(item)
    // if mouse hovers item and is not clicking, select item
    item.addEventListener('mouseover', () => {
        if (!clicking) {
            elementSelected = item
        }
    })
    // if mouse leaves item and item is currently selected, reset item selected variable
    item.addEventListener('mouseout', () => {
        if (elementSelected == item && !clicking) {
            elementSelected = {}
        }
    })
})

// Sets the position and position attributes of added npcs
function setNewSpritePosition(sprite) {
    // if element is selected and mouse is not clicking
    if(!clicking && elementSelected == sprite) {
        // Gets the size of the squares in the builder
        const squareRect = square.getBoundingClientRect()
        // Gets elements position in window
        const spriteRect = sprite.getBoundingClientRect()
        // resets selected element
        elementSelected = {}

        // set position attributes attributes
        // elements left position divided by the width of the squares rounded down
        sprite.setAttribute('data-left', Math.floor(parseInt(spriteRect.left) / squareRect.width))
        // elements position from the bottom divided by the height of the quares rounded down
        sprite.setAttribute('data-bottom', Math.floor((window.innerHeight - parseInt(spriteRect.top)) / squareRect.height))

        // Sets elements position based on the position attributes just created.
        setItemPosition(sprite)
    }
}

// for each square on the screen
const spots = document.querySelectorAll('.square').forEach(sqr => {
    // When hovered
    sqr.addEventListener('mouseover', e => {
        // if not clicking, dont do anything
        if (!clicking) return
        
        // if mouse is clicking
        setSquareData()
        
    })
    sqr.addEventListener('mousedown', e => {
        setSquareData()
    })

    function setSquareData() {
        // if dragging element, dont do anything
        if (dragging) return
        // if type information is empty
        if (type.length == 0) {
            // Set square information to defaults
            sqr.classList = 'square'
            sqr.setAttribute('data-type', 'x')
            sqr.setAttribute('data-blocking', '')
            sqr.innerHTML = ''
        } else {
            // if type has info
            // change square data based on type and blocking arrays
            const clas = type.join('')
            sqr.classList = `square selected ${clas}`
            sqr.setAttribute('data-type', clas)
            sqr.setAttribute('data-blocking', blocking.join(''))
            sqr.innerHTML = `<span>${blocking.join('')}</span>`
        }
    }
})

// If clicking in window, set clicking to true
window.addEventListener('mousedown', e => {
    clicking = true
})
// If not clicking in window
window.addEventListener('mouseup', () => {
    // set clicking to false
    clicking = false
    // reset selected element variable
    elementSelected = {}
    // set dragging to false
    dragging = false
})

// if mouse is moving in window
window.addEventListener('mousemove', e => {
    // if dragging an element
    if (elementSelected.style && clicking) {
        // set dragging to true
        dragging = true
        // reset block setting variables
        type = []
        blocking = [0]
        ind.innerHTML = ''
        // move element with mouse
        elementSelected.style.left = e.clientX + 'px'
        elementSelected.style.top = e.clientY + 'px'
    }
})

// on key presses
window.addEventListener('keydown', ({ keyCode }) => {
    console.log(keyCode)
    switch(keyCode) {
        case 32:
            // Space
            // Set keystrokes to record info for blocking
            blockingEdit = true
            break
        case 49:
            // 1
            // add physics blocking 1 (only top)
            blocking[0] == 0 ? blocking = [1] : blocking.push(1)
            break
        case 50:
            // 2
            // add physics blocking 2 (only sides)
            blocking[0] == 0 ? blocking = [2] : blocking.push(2)
            
            break
        case 51:
            // 3
            // add physics blocking 3 (only sides and bottom)
            blocking[0] == 0 ? blocking = [3] : blocking.push(3)
            
            break
        case 52:
            // 4
            // add physics blocking 4 (all sides)
            blocking[0] == 0 ? blocking = [4] : blocking.push(4)
            
            break
        case 65:
            // a
            // iff adding supply item, add arrows, else set adding sprite to true
            if (addingSupply) {
                addSupplyItem('arrows')
            } else {
                addingSprite = true
            }
            
            break
        case 66:
            // b
            // add b to type information
            type.push('b')
            break
        case 67:
            // c
            // add c to type information
            type.push('c')
            
            break
        case 68:
            // d
            // if dragging element and d is clicked, DELETE element.
            if (clicking && elementSelected !== {}) {
                elementSelected.remove()
                elementSelected = {}
                sprites = document.querySelectorAll('.sprite')
                supplies = document.querySelectorAll('.supply')
            }
            break
        case 69:
            // e
            // add e to type information
            type.push('e')
            break
        case 71:
            // g
            // If adding sprite, add guy npc
            if (addingSprite) {
                addNewSprite('guy')
            }
            break
        case 72:
            // h
            // if adding supply item, add health pack
            if (addingSupply) {
                addSupplyItem('health')
            }
            break
        case 73:
            // i
            // if adding sprites, add imp npc, else set adding supply item to true
            if (addingSprite) {
                addNewSprite('imp')
            } else {
                addingSupply = true
            }
            break
        case 76:
            // l
            // add l to type information
            type.push('l')
            break
        case 80:
            // p
            // compile and display world data
            compileWorld()
            break
        case 82:
            // r
            // if displaying compiled world data, hide data to make more changes
            built && makeMoreChanges()
            break
        case 84:
            // t
            // add t to type information
            type.push('t')
            break
        case 83:
            // s
            // if displaying world data, send to server to be saved
            // else if adding a sprite, add a skeleton
            // else if editing block data, add s
            // else add s to type information
            if (built) {
                saveWorldToFile()
            } else if (addingSprite) {
                addNewSprite('skel')
            } else if (blockingEdit) {
                blocking.push('s')
            } else {
                type.push('s')
            }
            break
        case 86:
            // v
            // add v to type information
            type.push('v')
            break
        case 87:
            // w
            // add w to type information
            type.push('w')
            break
        case 81:
            // q
            // clears data variables
            type = []
            blocking = []
            break        
    }
    // Sets indicator where the information for the next block is displayed (bottom right corner of screen)
    ind.innerHTML = `${blocking.join('')}.${type.join('')}`
})

// key up events
window.addEventListener('keyup', ({ keyCode }) => {
    switch(keyCode) {
        case 32:
            // space
            blockingEdit = false
            break
        case 65:
            // a
            addingSprite = false
            break
        case 73: {
            addingSupply = false
            break
        }
    }
})

// Compiles world information and displays it to user
const compileWorld = () => {
    // Adds world dimensions from the main div container attributes
    world = {
        dimensions: {
            x: parseInt(main.getAttribute('data-x')),
            y: parseInt(main.getAttribute('data-y'))
        }
    }
    // grabs all rows of squares
    const rows = document.querySelectorAll('.row')
    // sets game length
    // number of squares times 24 minus screen width (rough)
    world.gameLength = (24 * parseInt(main.getAttribute('data-x'))) - 966

    // Sets player start position
    world.player = {
        start: [
            parseInt(player.getAttribute('data-left')) * 24 - 24,
            parseInt(player.getAttribute('data-bottom')) * 24 + 24
        ]
    }

    // initialized sprites (npc) array
    world.sprites = []
    // for each sprite
    for (let i = 0; i < sprites.length; i++) {
        const thisSprite = sprites[i]
        // add sprite type and start position
        // position (x and y) times 24 minus 24
        world.sprites.push({
            type: thisSprite.getAttribute('data-type'),
            start: [
                parseInt(thisSprite.getAttribute('data-left')) * 24 - 24,
                parseInt(thisSprite.getAttribute('data-bottom')) * 24 + 24
            ]
        })
    }

    // initializes supply items array
    world.supplies = []
    // for each supply item
    for (let i = 0; i < supplies.length; i++) {
        const thisItem = supplies[i]
        // add item type and start position
        // position (x and y) times 24 minus 24
        world.supplies.push({
            type: thisItem.getAttribute('data-type'),
            start: [
                parseInt(thisItem.getAttribute('data-left')) * 24 - 24,
                parseInt(thisItem.getAttribute('data-bottom')) * 24 + 24
            ]
        })
    }

    // initialized world object hass array
    world.objectsHash = []
    // for each row of squares
    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        // initializes row string
        let rowBlockData = ''
        for (let j = 0; j < row.children.length; j++) {
            const block = row.children[j]
            const blockType = block.getAttribute('data-type')
            // appends physics blocking and block type string to main row string
            // if x (empty), don't add physics blocking
            // will add an extra space for all after first square in row
            // else add all data to string
            if (blockType == 'x') {
                rowBlockData = rowBlockData + `${j > 0 ? ' ' : ''}x`
            } else {
                rowBlockData = rowBlockData + `${j > 0 ? ' ' : ''}${block.getAttribute('data-blocking')}.${blockType}`
            }
            // example result for each square: 4.te
            // 4 = blocking all sides; te = (top end) image reference in /static/images/objects/environment folder
        }
        world.objectsHash.push(rowBlockData)
        
    }
    // display compiled data
    // hides builder
    main.style.visibility = 'hidden'
    // hides indicatior
    ind.style.visibility = 'hidden'
    // adds data to page
    document.getElementById('results').innerHTML = JSON.stringify(world)
    // sets built variable to true
    built = true
}

// hides compiled data and allows further editing
const makeMoreChanges = () => {
    // shows builder and indicator
    main.style.visibility = 'visible'
    ind.style.visibility = 'visible'
    // removes compiled data from page
    document.getElementById('results').innerHTML = ''
    built = false
}

// Sends data to server to be saved (ajax)
const saveWorldToFile = () => {
    // ajax object
    let htp = new XMLHttpRequest();

    htp.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
            // If response from server is good, alert that the level has been saved
            alert(this.response)
        } else if(this.readyState == 4) {
            console.log(this.status)
            // If response is bad, alert error status
            let message = 'Could not post data to server'
            if(this.status == 404) message = this.statusText
            alert('Error: ' + this.status + ', ' + message)
        }
    };
    
    // sets routing and data and sends to server
    htp.open('POST', '/build');
    htp.setRequestHeader( 'Content-Type', 'application/json' )
    htp.send(JSON.stringify(world))
}

// adds supply item to page
function addSupplyItem(type) {
    const div = document.createElement('div')
    div.classList = `supply ${type}`
    div.setAttribute('data-left', 0)
    div.setAttribute('data-bottom', 0)
    div.setAttribute('data-type', type)
    main.append(div)
    supplies = document.querySelectorAll('.supply')
    div.addEventListener('mouseover', () => {
        if (!clicking) {
            elementSelected = div
        }
    })
    div.addEventListener('mouseout', () => {
        if (elementSelected == div && !clicking) {
            elementSelected = {}
        }
    })
}

// adds npc to page
function addNewSprite(type) {
    const div = document.createElement('div')
    div.classList = `sprite ${type}`
    div.setAttribute('data-left', 0)
    div.setAttribute('data-bottom', 0)
    div.setAttribute('data-type', type)
    main.append(div)
    sprites = document.querySelectorAll('.sprite')
    div.addEventListener('mouseover', () => {
        if (!clicking) {
            elementSelected = div
        }
    })
    div.addEventListener('mouseout', () => {
        if (elementSelected == div && !clicking) {
            elementSelected = {}
        }
    })
}

// moves item on page based on the items dom attributes
function setItemPosition(item) {
    const squareRect = square.getBoundingClientRect()

    const itemSetLeft = parseInt(item.getAttribute('data-left'))
    const itemSetTop = parseInt(item.getAttribute('data-bottom'))

    const itemRect = item.getBoundingClientRect()

    item.style.left = `${itemSetLeft * squareRect.width}px`
    item.style.top = `${window.innerHeight - (itemSetTop * squareRect.height) - itemRect.width}px`
    
}

// sets tile count (tile being a 24 x 24 space)
function setSpriteTileCount(sprite) {
    sprite.setAttribute('data-left', (parseInt(sprite.getAttribute('data-left')) / 24) + 1)
    sprite.setAttribute('data-bottom', (parseInt(sprite.getAttribute('data-bottom')) / 24) - 1)
}

// sets player tile count and position
setSpriteTileCount(player)
setItemPosition(player)

// moves all items when window is being resized
window.addEventListener('resize', () => {
    const squareRect = square.getBoundingClientRect()

    document.documentElement.style.setProperty('--square-w', squareRect.width);
    document.documentElement.style.setProperty('--square-h', squareRect.height);

    setItemPosition(player)
    sprites.forEach(sprite => {
        setItemPosition(sprite)
    })
    supplies.forEach(item => {
        setItemPosition(item)
    })
})