const main = document.getElementById('level')
const ind = document.getElementById('indicator')

let type = []
let blocking = [0]
let clicking = false
let blockingEdit = false
let built = false
let world = {}
let addingSprite = false
let addingPlayer = false
let addingSupply = false
let previousMousePosition = [0,0]
let spriteSelected = {}
const player = document.getElementById('player')
let sprites = document.querySelectorAll('.sprite')
let supplies = document.querySelectorAll('.supply')
const square = document.querySelector('.square')

player.addEventListener('mouseover', e => {
    if (!clicking) {
        spriteSelected = player
    }
})
player.addEventListener('mouseout', e => {
    if (spriteSelected == player && !clicking) {
        spriteSelected = {}
    }
})

sprites.forEach(sprite => {
    setSpriteTileCount(sprite)
    setItemPosition(sprite)
    sprite.addEventListener('mouseover', () => {
        if (!clicking) {
            spriteSelected = sprite
        }
    })
    sprite.addEventListener('mouseout', () => {
        if (spriteSelected == sprite && !clicking) {
            spriteSelected = {}
        }
    })
})

supplies.forEach(item => {
    setSpriteTileCount(item)
    setItemPosition(item)
    item.addEventListener('mouseover', () => {
        if (!clicking) {
            spriteSelected = item
        }
    })
    item.addEventListener('mouseout', () => {
        if (spriteSelected == item && !clicking) {
            spriteSelected = {}
        }
    })
})

function setNewSpritePosition(sprite) {
    if(!clicking && spriteSelected == sprite) {
        const squareRect = square.getBoundingClientRect()
        spriteSelected = {}

        sprite.setAttribute('data-left', Math.floor(parseInt(sprite.style.left) / squareRect.width))
        sprite.setAttribute('data-bottom', Math.floor((window.innerHeight - parseInt(sprite.style.top)) / squareRect.height))

        setItemPosition(sprite)
    }
}

const spots = document.querySelectorAll('.square').forEach(sqr => {
    sqr.addEventListener('mouseover', e => {
        if (!clicking) return
        
        if (type.length == 0) {
            sqr.classList = 'square'
            sqr.setAttribute('data-type', 'x')
            sqr.setAttribute('data-blocking', '')
            sqr.innerHTML = ''
        } else if (spriteSelected !== {}) {
            const clas = type.join('')
            sqr.classList = `square selected ${clas}`
            sqr.setAttribute('data-type', clas)
            sqr.setAttribute('data-blocking', blocking.join(''))
            sqr.innerHTML = `<span>${blocking.join('')}</span>`
        }
    })
    sqr.addEventListener('mousedown', e => {
        if (type.length == 0) {
            sqr.classList = 'square'
            sqr.setAttribute('data-type', 'x')
            sqr.setAttribute('data-blocking', '')
            sqr.innerHTML = ''
        } else {
            const clas = type.join('')
            sqr.classList = `square selected ${clas}`
            sqr.setAttribute('data-type', clas)
            sqr.setAttribute('data-blocking', blocking.join(''))
            sqr.innerHTML = `<span>${blocking.join('')}</span>`
        }
    })
})

window.addEventListener('mousedown', e => {
    previousMousePosition = [e.clientX, e.clientY]
    clicking = true
})
window.addEventListener('mouseup', () => {
    clicking = false
    setNewSpritePosition(spriteSelected)
})
window.addEventListener('mousemove', e => {
    if (spriteSelected.style && clicking) {
        type = []
        blocking = [0]
        ind.innerHTML = ''
        spriteSelected.style.left = e.clientX + 'px'
        spriteSelected.style.top = e.clientY + 'px'
    }
})

window.addEventListener('keydown', ({ keyCode }) => {
    console.log(keyCode)
    switch(keyCode) {
        case 32:
            // Space
            blockingEdit = true
            break
        case 49:
            // 1
            blocking[0] == 0 ? blocking = [1] : blocking.push(1)
            break
        case 50:
            // 2
            blocking[0] == 0 ? blocking = [2] : blocking.push(2)
            
            break
        case 51:
            // 3
            blocking[0] == 0 ? blocking = [3] : blocking.push(3)
            
            break
        case 52:
            // 4
            blocking[0] == 0 ? blocking = [4] : blocking.push(4)
            
            break
        case 65:
            // a
            if (addingSupply) {
                addSupplyItem('arrows')
            } else {
                addingSprite = true
            }
            
            break
        case 66:
            // b
            type.push('b')
            break
        case 67:
            // c
            type.push('c')
            
            break
        case 68:
            // d
            if (clicking && spriteSelected !== {}) {
                spriteSelected.remove()
                spriteSelected = {}
                sprites = document.querySelectorAll('.sprite')
                supplies = document.querySelectorAll('.supply')
            }
            break
        case 69:
            // e
            type.push('e')
            break
        case 71:
            // g
            if (addingSprite) {
                addNewSprite('guy')
            }
            break
        case 72:
            // h
            if (addingSupply) {
                addSupplyItem('health')
            }
            break
        case 73:
            // i
            if (addingSprite) {
                addNewSprite('imp')
            } else {
                addingSupply = true
            }
            break
        case 76:
            // l
            type.push('l')
            break
        case 80:
            // p
            saveWorld()
            break
        case 82:
            // r
            built && makeMoreChanges()
            break
        case 84:
            // t
            type.push('t')
            break
        case 83:
            // s
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
            type.push('v')
            break
        case 87:
            // w
            type.push('w')
            break
        case 81:
            // q
            type = []
            blocking = []
            break
        case 90:
            // z
            erase = true
            break
        
    }
    ind.innerHTML = `${blocking.join('')}.${type.join('')}`
})

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

const saveWorld = () => {
    world = {
        dimensions: {
            x: parseInt(main.getAttribute('data-x')),
            y: parseInt(main.getAttribute('data-y'))
        }
    }
    const rows = document.querySelectorAll('.row')
    world.gameLength = (24 * parseInt(main.getAttribute('data-x'))) - 966
    world.objectsHash = []
    world.player = {
        start: [
            parseInt(player.getAttribute('data-left')) * 24 - 24,
            parseInt(player.getAttribute('data-bottom')) * 24 + 24
        ]
    }

    world.sprites = []
    for (let i = 0; i < sprites.length; i++) {
        const thisSprite = sprites[i]
        world.sprites.push({
            type: thisSprite.getAttribute('data-type'),
            start: [
                parseInt(thisSprite.getAttribute('data-left')) * 24 - 24,
                parseInt(thisSprite.getAttribute('data-bottom')) * 24 + 24
            ]
        })
    }

    world.supplies = []
    for (let i = 0; i < supplies.length; i++) {
        const thisItem = supplies[i]
        world.supplies.push({
            type: thisItem.getAttribute('data-type'),
            start: [
                parseInt(thisItem.getAttribute('data-left')) * 24 - 24,
                parseInt(thisItem.getAttribute('data-bottom')) * 24 + 24
            ]
        })
    }

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        let rowBlockData = ''
        for (let j = 0; j < row.children.length; j++) {
            const block = row.children[j]
            const blockType = block.getAttribute('data-type')
            if (blockType == 'x') {
                rowBlockData = rowBlockData + `${j > 0 ? ' ' : ''}x`
            } else {
                rowBlockData = rowBlockData + `${j > 0 ? ' ' : ''}${block.getAttribute('data-blocking')}.${blockType}`
            }
        }
        world.objectsHash.push(rowBlockData)
        
    }
    main.style.visibility = 'hidden'
    ind.style.visibility = 'hidden'
    document.getElementById('results').innerHTML = JSON.stringify(world)
    built = true
}

const makeMoreChanges = () => {
    main.style.visibility = 'visible'
    ind.style.visibility = 'visible'
    document.getElementById('results').innerHTML = ''
    built = false
}

const saveWorldToFile = () => {
    console.log(world)
    let htp = new XMLHttpRequest();

    htp.onreadystatechange = function() {
        if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
            // If response from server is good, return the response
            alert(this.response)
        } else if(this.readyState == 4) {
            console.log(this.status)
            // If response is bad, return error status html to loaded into page.
            let message = 'Could not post data to server'
            if(this.status == 404) message = this.statusText
            alert('Error: ' + this.status + ', ' + message)
        }
    };
    
    htp.open('POST', '/build');
    htp.setRequestHeader( 'Content-Type', 'application/json' )
    htp.send(JSON.stringify(world))
}

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
            spriteSelected = div
        }
    })
    div.addEventListener('mouseout', () => {
        if (spriteSelected == div && !clicking) {
            spriteSelected = {}
        }
    })
}

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
            spriteSelected = div
        }
    })
    div.addEventListener('mouseout', () => {
        if (spriteSelected == div && !clicking) {
            spriteSelected = {}
        }
    })
}

function setItemPosition(item) {
    const squareRect = square.getBoundingClientRect()

    const itemSetLeft = parseInt(item.getAttribute('data-left'))
    const itemSetTop = parseInt(item.getAttribute('data-bottom'))

    const itemRect = item.getBoundingClientRect()

    item.style.left = `${itemSetLeft * squareRect.width}px`
    item.style.top = `${window.innerHeight - (itemSetTop * squareRect.height) - itemRect.width}px`
    
}

function setSpriteTileCount(sprite) {
    sprite.setAttribute('data-left', (parseInt(sprite.getAttribute('data-left')) / 24) + 1)
    sprite.setAttribute('data-bottom', (parseInt(sprite.getAttribute('data-bottom')) / 24) - 1)
}

setSpriteTileCount(player)
setItemPosition(player)

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