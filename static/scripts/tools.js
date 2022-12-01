import { Block } from '/static/scripts/objects/block.js'
import { Background } from '/static/scripts/objects/background.js'
import { setGameEnd } from '/static/scripts/main.js'
import { Imp } from '/static/scripts/objects/imp.js'
import { Wall } from '/static/scripts/objects/invisibleWall.js'
import { Ghost } from '/static/scripts/objects/ghost.js'
import { Text } from '/static/scripts/objects/text.js'
import { showMessage, clearMessage } from '/static/scripts/page.js'


// Creates a new image object for the canvas to draw
export function newImage(src) {
    return new Promise(resolve => {
        const img = new Image()
        img.src = src
        img.addEventListener('load', () => {
            resolve(img)
        })
    })
}

// Resizes the canvas when window is resized
export function sizeWindow(canvas, blockRight) {
    canvas.minWidth = 408
    canvas.minHeight = 204
    canvas.width = Math.floor(window.innerWidth * .65)
    canvas.height = Math.floor(window.innerWidth * .65) / 2

    blockRight = Math.round(canvas.width - 200)
    // Sets variables to current window size.
    return {
        y: window.innerHeight,
        x: window.innerWidth
    }
}

export const blocks = []
export const npcs = []
export const ghosts = []
export const texts = []

const sounds = []
export const background = new Background()

export function buildWorld(map, canvas) {
    return new Promise(async resolve => {
        const backImages = []
        const div = document.getElementById('background')
        await map.images.background.forEach(async img => {
            const canv = document.createElement('canvas')
            div.append(canv)
            backImages.push({img: await newImage(img.img), index: img.index})
        })
        background.elements = div
        background.images = backImages

        setGameEnd(map.gameLength)
        await addObjects(map.objectsHash, map.objectsHash.length - 1, canvas)

        map.sounds.forEach(sound => {
            sounds.push(new Audio(`/static/sounds/world/${sound}.wav`))
        })
        playSounds()

        map.text.forEach(txt => {
            texts.push(new Text(txt, canvas))
        })
        
        map.npcs.forEach(async npc => {
            let guy
            if (npc.type == 'imp') {
                guy = new Imp({ 
                    images: [await newImage(npc.images[0]), await newImage(npc.images[1])],
                    position: {x: npc.start[0], y: npc.start[1]},
                    frames: npc.frames
                }, npc, canvas)
            }
            npcs.push(guy)
        })

        map.ghosts.forEach(async ghst => {
            ghosts.push(new Ghost({
                images: [await newImage(ghst.images[0]), await newImage(ghst.images[1])],
                position: {x: ghst.start[0], y: ghst.start[1]},
                frames: ghst.frames,
                frame: ghst.frame ? ghst.frame : null
            }, ghst, canvas))
        })
        
        resolve()
    })
}

let si = 0
let notified = false
function playSounds() {
    let play = sounds[si].play()
    if(play !== undefined) {
        play.then(() => {
            notified && clearMessage()
            sounds[si].onended(() => {
                si + 1 >= sounds.length ? si = 0 : si++
                playSounds()
            })
        }).catch(err => {
            if (err.name == 'NotAllowedError' && !notified) {
                window.setTimeout(() => {
                    showMessage('Your browser is blocking audio autoplay. For the best experience unblock audio.')
                    notified = true
                }, 3000)
            }
            setTimeout(() => {
                playSounds()
            }, 2000)
        })
    }
    // play.then().catch(err => { console.log(err) })    
    sounds[si].volume = .5
}

export function drawWorld(c, canvas, scroll, end, terminalVelocity) {
    background.draw(c, canvas, scroll)

    // Updates each platform
    blocks.forEach(block => {
        if (block.position.x + block.width > 0 && block.position.x < canvas.width && block.position.y + block.height > 0 && block.position.y < canvas.height) {
            block.draw(c, canvas, scroll)
        }
        
    })

    texts.forEach(txt => {
        txt.draw(c)
    })

    ghosts.forEach(ghst => {
        if (ghst.position.x + ghst.width > 0 && ghst.position.x < canvas.width && ghst.position.y + ghst.height > 0 && ghst.position.y < canvas.height) {
            ghst.update(c)
        }
    })

    npcs.forEach(npc => {
        const dist = 150
        if (npc.position.x + npc.width > dist * -1 && npc.position.x < canvas.width + dist && npc.position.y + npc.height > dist * -1 && npc.position.y < canvas.height + dist) {
            npc.alive && npc.update(c, canvas, terminalVelocity)
        }
    })
}

const images = {}

let progX = 0
let progY = 0

const addObjects = (levels, canvas) => {
    return new Promise(async resolve => {
        for (let i = levels.length - 1; i >= 0; i--) {
            if(levels[i] == '') {
                progY += 24
                continue
            }
            const objs = levels[i].split(' ')
            for (let j = 0; j < objs.length; j++) {
                const dets = objs[j].split('.')
                if (dets[0] == 'x') {
                    if (dets[1]) {
                        progX += 24 * parseInt(dets[1])
                    } else {
                        progX += 24
                    }
                    continue
                }
                const params = {

                    type: dets[1].includes('e') ? 'end' : dets[1].includes('s') ? 'start' : 'center',

                    position: {
                        x: progX,
                        y: progY + 24
                    },
                    blocking: dets[0].includes('1') ? {t: true} : dets[0].includes('2') ? {r: true, l: true} : dets[0].includes('3') ? {r: true, b: true, l: true} : dets[0].includes('4') ? {t: true, r: true, b: true, l: true} : {},
                    
                    blockEdge: [],

                    width: 24,
                    height: 24
                }
                if (dets[0].includes('p')) params.blockEdge.push('player')
                if (dets[0].includes('s')) params.blockEdge.push('sprite')
                
                if (dets[1] == 'e') {
                    blocks.push(new Wall(params))
                    progX = params.position.x + 24
                    continue
                }

                images[dets[1]] ? null : images[dets[1]] = await newImage(`/static/images/objects/${dets[1]}.png`)

                params.position.y = progY + images[dets[1]].height
                params.image = images[dets[1]],
                params.width = images[dets[1]].width,
                params.height = images[dets[1]].height
                
                if (dets[2]) {
                    let idx = parseInt(dets[2])
                    for (let l = 0; l < idx; l++) {
                        l == 0 ? null : params.position.x += images[dets[1]].width
                        blocks.push(new Block(params))
                    }
                    progX = params.position.x + images[dets[1]].width
                } else {
                    progX += images[dets[1]].width
                    blocks.push(new Block(params))
                }
                
                
            }
            progX = 0
            progY += 24
        }
        resolve()
    })
}

export function getLevel() {
    return new Promise(async resolve => {
        const url = '/data?level=1'
        const data = await ajax('GET', url)
        resolve(JSON.parse(data))
    })
}

export function ajax(method, url, data) {
    return new Promise(resolve => {
        let htp = new XMLHttpRequest();

        htp.onreadystatechange = function() {
            if (this.readyState == 4 && (this.status == 200 || this.status == 201)) {
                // If response from server is good, return the response
                resolve(this.response)
            } else if(this.readyState == 4) {
                console.log(this.status)
                // If response is bad, return error status html to loaded into page.
                let message = '<p>Could not get data from server</p>'
                if(this.status == 404) message = '<p>' + this.statusText + '</p>'
                resolve('<h1>Error ' + this.status + '</h1>' + message)
            }
        };
        
        htp.open(method, url);
        if(data) {
            htp.setRequestHeader( 'Content-Type', 'application/json' )
            htp.send(JSON.stringify(data))
        } else {
            htp.send()
        }
    })
}