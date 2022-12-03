const main = document.getElementById('level')
const ind = document.getElementById('indicator')

let type = []
let blocking = [0]
let clicking = false
let blockingEdit = false
let built = false
let world = {}


const spots = document.querySelectorAll('.square').forEach(sqr => {
    sqr.addEventListener('mouseover', e => {
        if (!clicking) return
        
        if (type.length == 0) {
            sqr.classList = 'square'
            sqr.innerHTML = ''
        } else {
            const clas = type.join('')
            sqr.classList = `square selected ${clas}`
            sqr.setAttribute('data-type', clas)
            sqr.setAttribute('data-blocking', blocking.join(''))
            sqr.innerHTML = `<span>${blocking.join('')}.${type.join('')}</span>`
        }
    })
    sqr.addEventListener('mousedown', e => {
        if (type.length == 0) {
            sqr.classList = 'square'
            sqr.innerHTML = ''
        } else {
            const clas = type.join('')
            sqr.classList = `square selected ${clas}`
            sqr.setAttribute('data-type', clas)
            sqr.setAttribute('data-blocking', blocking.join(''))
            sqr.innerHTML = `<span>${blocking.join('')}.${type.join('')}</span>`
        }
    })
})

window.addEventListener('mousedown', () => {
    clicking = true
})
window.addEventListener('mouseup', () => {
    clicking = false
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
        case 66:
            // b
            type.push('b')
            break
        case 67:
            // c
            type.push('c')
            break
        case 69:
            // e
            type.push('e')
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
            } else {
                if (blockingEdit) {
                    blocking.push('s')
                } else {
                    type.push('s')
                }
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
    }
})

const saveWorld = () => {
    world = {}
    const rows = document.querySelectorAll('.row')
    world.gameLength = (24 * parseInt(main.getAttribute('data-x'))) - 966
    world.objectsHash = []

    for (let i = 0; i < rows.length; i++) {
        const row = rows[i]
        let rowBlockData = ''
        let notX = false
        let currentBlockType = ''
        let blockCountRepeat = 1
        for (let j = 0; j < row.children.length; j++) {
            const block = row.children[j]
            const blockType = block.getAttribute('data-type')

            if (currentBlockType == blockType) {
                blockCountRepeat++
            } else {
                if (blockCountRepeat > 1) {
                    rowBlockData = rowBlockData + `.${blockCountRepeat}`
                    blockCountRepeat = 1
                    currentBlockType = blockType
                } else {
                    currentBlockType = blockType
                }
                if (currentBlockType == 'x') {
                    rowBlockData = rowBlockData + `${j > 0 ? ' ' : ''}x`
                } else {
                    notX = true
                    rowBlockData = rowBlockData + `${j > 0 ? ' ' : ''}${block.getAttribute('data-blocking')}.${currentBlockType}`
                }
            }
        }
        if (!notX) {
            if (world.objectsHash.length > 0) {
                world.objectsHash.push('')
            }
        } else {
            world.objectsHash.push(rowBlockData)
        }
        
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