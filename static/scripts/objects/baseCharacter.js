import { gravity } from '/static/scripts/main.js'
// import { blocks } from '/static/scripts/tools.js'

export class Character {
    constructor({ images, position, frames, frame }, canvas) {
        // this.sprite = new Sprite(images[0], images[1], frames, frame)

        this.images = images

        this.color = false

        this.frames = frames
        this.width = this.images[0].width / frames[0]
        this.height = this.images[0].height / frames[1]
        this.jump = true
        this.falling = false
        this.running = false
        this.damaging = 0

        this.frame = frame ? frame : [0,0]

        this.projectiles = []

        this.flipped = false
        this.speed = 0
        this.position = {
            x: position.x,
            // Set relative to canvas height
            
            y: canvas.height - position.y
            // y: 350
        }
        this.origin = {
            x: this.position.x,
            y: this.position.y
        }

        this.velocity = {
            x: 0,
            y: 0
        }

        this.on = {
            type: '',
            left: 0,
            right: 0,
            block: ''
        }

        this.keys = {}
    }

    draw(c) {
        if (this.color) {
            c.fillStyle = 'red'
            c.fillRect(this.position.x,this.position.y,this.width,this.height)
        }
        
        c.drawImage(this.flipped ? this.images[1] : this.images[0], this.frame[1] * this.width, this.frame[0] * this.height, this.width, this.height, this.position.x, this.position.y, this.width, this.height)
    }

    flip() {
        this.flipped = !this.flipped
    }

    calculateGravity(canvas, terminalVelocity) {
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        if (this.position.y + this.contact.b + this.velocity.y < canvas.height) {
            if (this.velocity.y >= terminalVelocity) {
                this.velocity.y = terminalVelocity
            } else {
                this.velocity.y += gravity
            }
        }
    }

    detectCollision(sprite, controls, blocks) {
        blocks.forEach(block => {
            if (block.blocking.b) {
                if (sprite.position.x + sprite.contact.r > block.position.x + 5
                    && sprite.position.x + sprite.contact.l < block.position.x + block.width - 5
                ) {
                    if (block.position.y + block.height > sprite.position.y + sprite.contact.mt && sprite.sliding != 0 && sprite.position.y + sprite.contact.b > block.position.y + block.height) {
                        if (sprite.sliding > 0 && sprite.sliding < 10) {
                            sprite.sliding = 10
                        }
                        if (sprite.sliding < 0 && sprite.sliding > -10) {
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

    isWithin(from, to) {
        const frame = frameValue(this.frame)
        from = frameValue(from)
        to = frameValue(to) 
        
        if(frame >= from && frame < to) {
            return true
        } else {
            return false
        }
    }

    nextFrame() {
        if (this.frame[1] < this.frames[1]) {
            this.frame = [this.frame[0], this.frame[1] + 1]
        } else if (this.frame[0] < this.frames[0]) {
            this.frame = [this.frame[0] + 1, 0]
        } else {
            this.frame = [0,0]
        }
    }
    
    prevFrame() {
        if (this.frame[1] > 0) {
            this.frame = [this.frame[0], this.frame[1] - 1]
        } else if (this.frame[0] > 0) {
            this.frame = [this.frame[0] - 1, this.frames[1]]
        } else {
            this.frame =[this.frames[0], this.frames[1]]
        }
    }

    control(controls) {
        // Player movement and platform scrolling using player velocity
        // Moving to the right
        // If D is pressed and the player is < 60% away from right screen edge
        if (!this.attacking) {
            if ((controls.right.pressed || (this.velocity.x > 0 && this.sliding > 0)) && this.velocity.x >= 0) {
                !this.flipped && this.flip()
                this.running = true
                this.velocity.x = this.sliding ? this.speed * (this.sliding / 10 ) : this.speed

            // Moving to the left
            // If A key pressed and this is > 10% away from left screen edge
            } else if ((controls.left.pressed || (this.velocity.x < 0 && this.sliding < 0))) {
                this.flipped && this.flip()
                this.running = true
                this.velocity.x = this.sliding ? (this.speed * ((this.sliding * -1) / 10)) * -1 : this.speed * -1
            } else {
                // Stop player movement
                this.velocity.x = 0
                this.running = false
            }
        } else {
            this.velocity.x = 0
            this.running = false
        }
    }

    updateHealth(amnt) {
        if (this.health + amnt >= 100) {
            this.health = 100
        } else if (this.health + amnt <= 0) {
            this.health = 0
        } else {
            this.health += amnt
        }
    }

    revert() {
        this.flipped = true
        this.running = false
        this.jump = true
        this.falling = false
        this.attacking = false

        // Position
        this.position = {
            x: this.origin.x,
            y: this.origin.y
        }
        // Current sprite frame
        this.frame = [0,0]
        // Movement speed
        this.velocity = {
            x: 0,
            y: 0
        }

        this.projectiles.forEach(dart => {
            dart.remove(this)
        })
    }
}

function frameValue(frame) {
    let val = frame[0]
    if (frame[1] > 9) {
        val = parseFloat(val + '.9' + ((frame[1] % 10) + 1))
    } else {
        val = parseFloat(frame.join('.'))
    }
    return val
}