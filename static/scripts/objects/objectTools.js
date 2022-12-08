import { finishLine } from '/static/scripts/main.js'
import { blocks, npcs, ghosts, texts, supplies,  background } from '/static/scripts/tools.js'

// spriteect collision
// Ok... Phew... Lots of conditionals here
// For each platform, if character is at its height and within its start and ending end, stop the character from falling.
export function detectCollision(sprite, controls) {
    blocks.forEach(block => {
        if (block.blocking.b) {
            if (sprite.position.x + sprite.contact.r > block.position.x + 5
                && sprite.position.x + sprite.contact.l < block.position.x + block.width - 5
            ) {
                if (block.position.y + block.height > sprite.position.y + sprite.contact.mt && sprite.sliding != 0 && sprite.position.y + sprite.contact.b > block.position.y + block.height) {
                    if (sprite.sliding > 0 && sprite.sliding < 10) {
                        console.log('right')
                        sprite.sliding = 10
                    }
                    if (sprite.sliding < 0 && sprite.sliding > -10) {
                        console.log('left')
                        sprite.sliding = -10
                    }
                    sprite.jump = false
                }
                if (sprite.position.y + sprite.contact.mt + sprite.velocity.y < block.position.y + block.height
                    && sprite.position.y + sprite.contact.b > block.position.y    
                ) {
                    sprite.velocity.y = .9
                }
            }
        }
        

        // Vertical collision detection
        // If sprite is beneath an spriteect that is too low to jump        
        if (block.blocking.t) {
            if (sprite.position.y + sprite.contact.b < block.position.y + 1
                && sprite.position.y + sprite.contact.b + sprite.velocity.y >= block.position.y - 1
                && sprite.position.x + sprite.contact.r >= block.position.x
                && sprite.position.x + sprite.contact.l <= block.position.x + block.width
                ) {
                if (sprite.velocity.y >= sprite.fallDamage) {
                    sprite.damaging = 20
                    sprite.updateHealth(-10)
                    sprite.position.y = block.position.y - sprite.contact.b
                } else {
                    sprite.position.y = block.position.y - sprite.contact.b
                }
                sprite.on = {
                    type: block.type,
                    left: block.position.x,
                    right: block.position.x + block.width,
                    block: block.blockEdge
                }
                
                sprite.velocity.y = 0
                sprite.stopped ? sprite.stopped = 3 : null
            }
        }

        // Horizontal collision detection
        const btm = sprite.position.y + sprite.contact.b
        const top = sprite.position.y + sprite.contact.t + 5
        if (btm <= block.position.y) return
        // If contact from left of spriteect
        if (block.blocking.l) {
            if(sprite.velocity.x > 0 || controls.right.pressed) {
                if ((sprite.position.x + sprite.contact.r >= block.position.x
                    || sprite.position.x + sprite.contact.r + sprite.velocity.x > block.position.x)
                    && sprite.position.x + sprite.contact.l < block.position.x + 10
                    && top < block.position.y + block.height
                    && btm > block.position.y
                ) {
                    sprite.running = false
                    sprite.position.x = block.position.x - sprite.width + (sprite.width - sprite.contact.r) - 1
                    sprite.sliding = false
                    sprite.velocity.x = 0
                    sprite.stopped ? sprite.stopped = 4 : null
                }
            }
        }  
            // If contact from right of spriteect
        if (block.blocking.r) {
            if (sprite.velocity.x < 0 || controls.left.pressed) {
                if ((sprite.position.x + sprite.contact.l <= block.position.x + block.width
                    || sprite.position.x + sprite.contact.l - sprite.velocity.x < block.position.x + block.width)
                    && sprite.position.x + sprite.contact.r > block.position.x + block.width - 10
                    && top < block.position.y + block.height
                    && btm > block.position.y
                ) {
                    sprite.running = false
                    sprite.position.x = block.position.x + block.width - sprite.contact.l + 1
                    sprite.sliding = false
                    sprite.velocity.x = 0
                    sprite.stopped ? sprite.stopped = 2 : null
                }
            }
        }
    })
}

export function characterControl(player, controls) {
    // Imobilaze player if damage animation is playing
    if (player.damaging > 0) return

    // Player movement and platform scrolling using player velocity
    // Moving to the right
    // If D is pressed and the player is < 60% away from right screen edge
    if (!player.attacking) {
        if ((controls.right.pressed || (player.velocity.x > 0 && player.sliding > 0)) && player.velocity.x >= 0) {
            !player.flipped && player.flip()
            player.running = true
            player.velocity.x = player.sliding ? player.speed * (player.sliding / 10 ) : player.speed

        // Moving to the left
        // If A key pressed and player is > 10% away from left screen edge
        } else if ((controls.left.pressed || (player.velocity.x < 0 && player.sliding < 0))) {
            player.flipped && player.flip()
            player.running = true
            player.velocity.x = player.sliding ? (player.speed * ((player.sliding * -1) / 10)) * -1 : player.speed * -1
        } else {
            // Stop player movement
            player.velocity.x = 0
            player.running = false
        }
    } else {
        player.velocity.x = 0
        player.running = false
    }
}

export function randomNumber(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// The scroll index for the environment
export let scrollOffset = 0
let scrollStop = 0
export function scrollWorld(player, controls) {
    // Scrolls platforms opposite of player movement when player is at stopping points (simulates progression)
    // If D pressed and not at winning location
    const overScrollAmount = 32
    const val = player.sliding > 0 ? player.sliding : player.sliding * -1
    let adj = player.sliding != 0 ? player.speed * (val / 10) : player.speed
    scrollOffset - adj < 0 ? scrollOffset = 0 : null

    if (((controls.right.pressed && player.weaponState == 0) || player.sliding > 0) && (scrollOffset + adj) < finishLine + 10 && player.flipped) {
        scrollOffset += adj
        scrollStop = overScrollAmount
        scroll()
    // If A pressed and player is not at start
    } else if (((controls.left.pressed && player.weaponState == 0) || player.sliding < 0) && scrollOffset > 0) {
        console.log('scrolling')
        adj = adj * -1
        scrollOffset += adj
        if (scrollOffset - overScrollAmount * 8 < 0) {
            scrollStop = 0
        } else {
            scrollStop = overScrollAmount * -1
        }
        scroll()
    } else if (scrollStop != 0 && !controls.left.pressed) {
        player.running = false
        if (scrollStop > 0) {
            scrollStop--
            adj = 8
        } else {
            scrollStop++
            adj = -8
        }
        if (scrollOffset + adj < 0) {
            scrollOffset = 0
        } else if ( scrollOffset + adj > finishLine - 15) {
            adj = 0
        } else {
            scrollOffset += adj
        }
        
        player.position.x -= adj
        scroll()
    }



    function scroll() {
        player.velocity.x = 0
        
        player.running = true
        // Moves each platfrom
        player.projectiles.forEach(dart => {
            dart.position.x -= adj
        })

        texts.forEach(txt => {
            txt.position.x -= adj
        })

        background.position.x -= adj
        blocks.forEach(block => {
            block.position.x -= adj
        })
        ghosts.forEach(ghst => {
            ghst.position.x -= adj
        })
        npcs.forEach(npc => {
            npc.position.x -= adj
            npc.projectiles.forEach(dart => {
                dart.position.x -= adj
            })
        })
        supplies.forEach(item => {
            item.position.x -= adj
        })
    }

    
}

export function overScroll(player, keys) {
    if (scrollStop != 0) {
        scrollWorld(player, keys)
    }
}

export function resetOverScroll() {
    scrollStop = 0
}

export let slideOffset = 0
let pass = 2
let slideStop = 0
let change = 0
export function slideWorld(player, canvas, terminalVelocity) {
    const ceil = canvas.height / 4
    const pTop = player.position.y + player.contact.t
    const pBot = player.position.y + player.contact.b
    const floor = canvas.height - (canvas.height / 6)
    change = pass

    const slide = () => {
        if (slideOffset + change < 0) {
            change = slideOffset * -1
            slideOffset = 0
        } else {
            slideOffset += change
        }

        texts.forEach(txt => {
            txt.position.y += change
        })

        player.position.y += change
        if (pBot > floor && slideOffset > 0) player.velocity.y = 0

        player.projectiles.forEach(dart => {
            dart.position.y += change
        })

        npcs.forEach(npc => {
            npc.position.y += change
            npc.projectiles.forEach(dart => {
                dart.position.y += change
            })
        })

        ghosts.forEach(ghst => {
            ghst.position.y += change
        })

        blocks.forEach(block => {
            block.position.y += change
        })
        supplies.forEach(item => {
            item.position.y += change
        })
    }


    if (player.velocity.y <= 1.75) pass = 2

    if (pTop > ceil && slideOffset == 0) return

    
    // if (pTop < ceil) player.position.y = ceil - player.contact.t
    
    if ((pTop < ceil)
        || (player.position.y + player.height > floor && slideOffset > 0)
    ) {
        slideStop == 0 ? slideStop = player.jumpHeight : null

        pass < terminalVelocity ? pass += 6 : pass = terminalVelocity
        if (pTop > ceil) {
            change = change * -1
        }

        slide()
    } else if (slideStop > 0) {
        if (pTop < canvas.height / 2) {
            change = slideStop / 2
            slideStop--
            slide()
        } else {
            slideStop = 0
        }
    }
}

export function resetScroll() {
    scrollOffset = 0
    slideOffset = 0
}