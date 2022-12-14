/*
    Script file for managing the game.
    The functions are called as needed by the main script and objects scripts
*/

// Imports for needed functions and variables
import { Block } from '/static/scripts/objects/block.js'
import { Background } from '/static/scripts/objects/background.js'
import { setGameEnd, world } from '/static/scripts/main.js'
import { Imp } from '/static/scripts/objects/imp.js'
import { Guy } from '/static/scripts/objects/guy.js'
import { Skeleton } from '/static/scripts/objects/skeleton.js'
import { Wall } from '/static/scripts/objects/invisibleWall.js'
import { Ghost } from '/static/scripts/objects/ghost.js'
import { Text } from '/static/scripts/objects/text.js'
import { PickupItem } from '/static/scripts/objects/supplies.js'
import { showMessage } from '/static/scripts/page.js'


// Creates a new image object for the canvas to draw
// Returns a promise so things can be loaded in correct order
export function newImage(src) {
    return new Promise(resolve => {
        const img = new Image()
        img.src = src
        img.addEventListener('load', () => {
            resolve(img)
        })
    })
}


// Arrays of each item to be rendered (Enviroments pieces, npcs, supply items, etc.)
// These are referenced by several other script files
export const blocks = []
export const npcs = []
export const ghosts = []
export const texts = []
export const supplies = []

// Initialized background object
export const background = new Background()

// Builds the world. Called by main script when user presses the "Start Game" button
export function buildWorld(map, canvas) {
    return new Promise(async resolve => {
        // map variable is the "map" of the world used to determin what/how many/where

        // Assembles background layers
        const backImages = []
        const div = document.getElementById('background')
        await map.images.background.forEach(async img => {
            const canv = document.createElement('canvas')
            div.append(canv)
            backImages.push({img: await newImage(img.img), index: img.index})
        })
        background.elements = div
        background.images = backImages

        // Sets gameLength variable in the main script file
        setGameEnd(map.gameLength)

        // Calls function to add collision objects
        await addObjects(map.objectsHash)

        // Adds text objects
        map.text && map.text.forEach(txt => {
            texts.push(new Text(txt, canvas))
        })
        
        // Adds NPCs
        map.npcs && map.npcs.forEach(async (npc, index) => {
            let newNPC
            // Base paramiters used for every npc as provided by the current npc in the loop
            const params = {
                images: npc.images ? [await newImage(npc.images[0]), await newImage(npc.images[1])] : null,
                position: {x: npc.start[0], y: npc.start[1]},
                frames: npc.frames
            }
            // Only three types of npcs, each gets its own object type
            if (npc.type == 'imp') {
                newNPC = new Imp(params, {...npc, index}, canvas)
            } else if (npc.type == 'guy') {
                newNPC = new Guy(params, {...npc, index}, canvas)
            } else if (npc.type == 'skel') {
                newNPC = new Skeleton(params, {...npc, index}, canvas)
            }
            // Add npc to array
            npcs.push(newNPC)
        })

        // Adds "ghost" npcs to the game.
        // ghosts are npcs that have no interactivity with the player or other npcs and are just there for aesthetics.
        map.ghosts && map.ghosts.forEach(async ghst => {
            ghosts.push(new Ghost({
                images: [await newImage(ghst.images[0]), await newImage(ghst.images[1])],
                position: {x: ghst.start[0], y: ghst.start[1]},
                frames: ghst.frames,
                frame: ghst.frame ? ghst.frame : null
            }, ghst, canvas))
        })

        // Adds supply items (for player to pick up) to the game
        map.supplies && map.supplies.forEach(item => {
            // Only two supply item types. Both share the same object type.
            if (item.type == 'arrows') {
                supplies.push(new PickupItem({
                    type: 'arrowCount',
                    position: [item.start[0], item.start[1]],
                    count: 5,
                    image: '/static/images/objects/world/Arrow Icon_multiple.png'
                }, canvas))
            } else if (item.type == 'health') {
                supplies.push(new PickupItem({
                    type: 'health',
                    position: [item.start[0], item.start[1]],
                    count: 50,
                    image: '/static/images/objects/world/Health Pack Icon.png'
                }, canvas))
            }
        })
        
        resolve()
    })
}

// Function to play audio file. Used by several other scripts.
export function playAudio(audio) {
    let play = audio.play()
    // If audio can be played. play it. 
    if(play !== undefined) {
        play.then().catch(err => {
            // If audio can't be played and error is of not allowed type, then user has autoplay blocked
            if (err.name == 'NotAllowedError') {
                // Show message to user that it would be better to turn autoplay on
                // Delay allows time for game to fully load, making it feel smoother and grab the right amount of attention
                window.setTimeout(() => {
                    showMessage('Your browser is blocking audio autoplay. For the best experience unblock audio and refresh the page.')
                }, 3000)
            }
        })
    }
}

// current index for the song in selected sountract
let si = 0
// Name of current soundtract (stored in the "world" variable provided by the main script file)
let currentSoundTract = ''
let musicIsStopped = false
// sounds, or songs, in the current tract
let sounds = []

// Initiates the sound tract on game page load. Called by main script file
export function playMusic(newTract) {
    // Prevents the game from playing overlapping music
    if (newTract == currentSoundTract && !musicIsStopped) return
    musicIsStopped = false
    currentSoundTract = newTract
    sounds.length > 0 && stopMusic()
    sounds = world.sounds[newTract]
    // Plays the sound tract
    playSounds()
}

// Recursive function to play each song in the current sound tract
function playSounds() {
    if (musicIsStopped) return
    // Danger sound tract should be louder
    currentSoundTract == 'danger' ? sounds[si].volume = 1 : sounds[si].volume = .5
    // Plays currently selected song in the tract
    playAudio(sounds[si])
    // On song end, select next sound (or go to beginning if at end), and recall the function
    sounds[si].addEventListener('ended', () => {
        sounds.forEach(sound => {
            sound.pause()
        })
        si + 1 >= sounds.length ? si = 0 : si++
        playSounds()
    })
}

// Stops the current sound tract. Used when displaying death or victory messages to the user.
export function stopMusic() {
    musicIsStopped = true
    sounds.forEach(sound => {
        sound.pause()
    })
    sounds = []
}

// Renders all items in the world. (not the player. That is called by the main script file)
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
        // If ghost is in the view aria, update
        if (ghst.position.x + ghst.width > 0 && ghst.position.x < canvas.width && ghst.position.y + ghst.height > 0 && ghst.position.y < canvas.height) {
            ghst.update(c)
        }
    })

    npcs.forEach(npc => {
        const dist = 150
        // if npc is within 'dist' beyond the edges of the screen, update
        // Added distance was so that the npc would continue to chase the player even if not currently on the screen
        if (npc.position.x + npc.width > dist * -1 && npc.position.x < canvas.width + dist && npc.position.y + npc.height > dist * -1 && npc.position.y < canvas.height + dist) {
            npc.alive && npc.update(c, canvas, terminalVelocity)
        }
    })

    supplies.forEach(item => {
        // if item is on screen, update
        if (item.position.x + item.width > 0 && item.position.x < canvas.width && item.position.y + item.height > 0 && item.position.y < canvas.height) {
            item.update(c)
        }
    })
}

// Images for the blocks to be rendered
const images = {}
// Variables used for calculating the position of blocks on the screen
// this is done in 24px spaces
let progX = 0
let progY = 0

// determins block type, calculated position, and adds it to game
// Called by buildWorld function
const addObjects = (levels) => {
    return new Promise(async resolve => {
        // for each "layer" of the game (each layer is 24px high)
        // Starts at the end of the array (or the bottom of the game) and moves back
        for (let i = levels.length - 1; i >= 0; i--) {
            // If layer if empty, continue to next layer
            if(levels[i] == '') {
                progY += 24
                continue
            }
            // splites the level string. The resulting array is each object in the layer
            const objs = levels[i].split(' ')
            // For each object in the layer
            for (let j = 0; j < objs.length; j++) {
                // period seperates the string of the object
                // the data before the first period is physiscs (sprite/player blocking), after is block type (used to dermin which image should be used)
                // if there is a second period, it's used to to indicate how many of this block is to be placed.
                // Eaxample: 4.te.5
                    // 4 = player/npc collision on all sides
                    // te = image reference in the "/static/images/objects/environment" folder
                    // 5 = five of the blocks should be place sequencially
                // this system was built before I created the builder. The builder does not use the second period, so that feature of this function is currently obsolete
                const dets = objs[j].split('.')
                // x is used to indicate an empty space.
                if (dets[0] == 'x') {
                    // if more than one is added, move current x position by that many spaces, else, just move by one space
                    if (dets[1]) {
                        progX += 24 * parseInt(dets[1])
                    } else {
                        progX += 24
                    }
                    continue
                }
                // params for the block object
                const params = {    
                    // Block type.
                    // used by npcs so they know if they are on an edge
                    type: dets[1].includes('e') ? 'end' : dets[1].includes('s') ? 'start' : 'center',

                    // Postion of the block
                    position: {
                        x: progX,
                        y: progY + 24
                    },
                    // Block collision
                    // 0 = no blocking, 1 = blocking on on top, 2 = blocking only on sides, 3 = block on sides EXCEPT the top, 4 = block on all sides
                    blocking: dets[0].includes('1') ? {t: true} : dets[0].includes('2') ? {r: true, l: true} : dets[0].includes('3') ? {r: true, b: true, l: true} : dets[0].includes('4') ? {t: true, r: true, b: true, l: true} : {},
                    
                    // if block is an edge, this is used to compunicate if the player or npcs are allowed to fall of the edge.
                    // if 'sprite' is included in the array, it will stop npcs.
                    blockEdge: [],

                    // size of block
                    width: 24,
                    height: 24
                }
                // Adds edge fall off prevention to the block
                if (dets[0].includes('p')) params.blockEdge.push('player')
                if (dets[0].includes('s')) params.blockEdge.push('sprite')
                
                // if block is of an emty type, add empty wall object to game
                // This is just an invisible barrier
                if (dets[1] == 'e') {
                    blocks.push(new Wall(params))
                    progX = params.position.x + 24
                    continue
                }

                // gets block image
                images[dets[1]] ? null : images[dets[1]] = await newImage(`/static/images/objects/environment/${dets[1]}.png`)

                // sets absolute y position
                params.position.y = progY + images[dets[1]].height
                // Adds block image to params
                params.image = images[dets[1]],
                // Adds image size to params
                params.width = images[dets[1]].width,
                params.height = images[dets[1]].height
                
                // If more than one, add set count
                // This feature is obsolets since making the builder
                if (dets[2]) {
                    let idx = parseInt(dets[2])
                    for (let l = 0; l < idx; l++) {
                        l == 0 ? null : params.position.x += images[dets[1]].width
                        blocks.push(new Block(params))
                    }
                    progX = params.position.x + images[dets[1]].width
                } else {
                    // Adds block to game and shifts current position by one space
                    progX += images[dets[1]].width
                    blocks.push(new Block(params))
                }
                
                
            }
            // Resets current x position
            progX = 0
            // moves y position up by one space
            progY += 24
        }
        resolve()
    })
}

// gets level information from server
export function getLevel() {
    return new Promise(async resolve => {
        const url = '/data?level=1'
        const data = await ajax('GET', url)
        resolve(JSON.parse(data))
    })
}

// Ajax function used to get/send data to the server
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