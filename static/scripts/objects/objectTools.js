import { finishLine } from '/static/scripts/main.js'
import { blocks, npcs, background } from '/static/scripts/tools.js'

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

// The scroll index for the environment
export let scrollOffset = 0
export function scrollWorld(player, controls) {
    // Scrolls platforms opposite of player movement when player is at stopping points (simulates progression)
    // If D pressed and not at winning location
    player.velocity.x = 0
    const val = player.sliding > 0 ? player.sliding : player.sliding * -1
    const adj = player.sliding != 0 ? player.speed * (val / 10) : player.speed

    if (((controls.right.pressed && player.weaponState == 0) || player.sliding > 0) && (scrollOffset + adj) < finishLine + 10) {
        scrollOffset += adj
        player.running = true
        // Moves each platfrom
        background.position.x -= adj
        blocks.forEach(block => {
            block.position.x -= adj
        })
        npcs.forEach(npc => {
            npc.position.x -= adj
        })
    // If A pressed and player is not at start
    } else if (((controls.left.pressed && player.weaponState == 0) || player.sliding < 0) && (scrollOffset - adj) > 0) {
        scrollOffset -= adj
        player.running = true
        // Moves each platform
        background.position.x += adj
        blocks.forEach(block => {
            block.position.x += adj
        })
        npcs.forEach(npc => {
            npc.position.x += adj
        })
    } else {
        player.running = false
    }
}

export function resetScroll() {
    scrollOffset = 0
}