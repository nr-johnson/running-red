import { Block } from '/static/scripts/objects/block.js'
import { Background } from '/static/scripts/objects/background.js'
import { setGameEnd } from '/static/scripts/main.js'
import { Npc } from '/static/scripts/objects/npc.js'
import { Imp } from '/static/scripts/objects/imp.js'
import { Wall } from '/static/scripts/objects/invisibleWall.js'

const guys = {
    imp: Imp
}


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
        
        map.npcs.forEach(async npc => {
            let guy
            if (npc.type == 'generic') {
                npc.sprite[0] = await newImage(npc.sprite[0])
                npc.sprite[1] = npc.sprite[1].length > 0 ? await newImage(npc.sprite[1]) : null
                guy = new Npc(npc, canvas)
            } else {
                guy = new guys[npc.type](npc, canvas)
            }
            
            npcs.push(guy)
        })
        
        resolve()
    })
}

export function drawWorld(c, canvas, scroll, end) {
    background.draw(c, canvas, scroll)

    c.fillRect(end, canvas.height - 96, 24, 96)
    // Updates each platform
    blocks.forEach(block => {
        block.draw(c, canvas, scroll)
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
                    position: {
                        x: progX,
                        y: progY + 24
                    },
                    blocking: dets[0] == '1' ? {t: true} : dets[0] == '2' ? {r: true, l: true} : dets[0] == '3' ? {r: true, b: true, l: true} : dets[0] == '4' ? {t: true, r: true, b: true, l: true} : {},
                    
                    width: 24,
                    height: 24
                }

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