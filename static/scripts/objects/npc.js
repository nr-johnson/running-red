import { detectCollision, characterControl } from '/static/scripts/objects/objectTools.js'
import { Sprite } from '/static/scripts/objects/sprite.js'

export class Npc {
    constructor({animated, delay, physics, speed, contact, interactive, start, health, sprite, frames}, canvas) {
        
        this.sprite = animated ? new Sprite(sprite[0], sprite[1], frames, [0,0]) : img

        this.height = sprite[0].height / frames[0]
        this.width = sprite[0].width / frames[1]
        this.speed = speed
        this.defaultSpeed = speed
        this.running = false
        this.physics = physics
        this.alive = true

        this.position = {
            x: start[0],
            y: canvas.height - this.height - start[1]
        }
        this.origin = {
            x: this.position.x,
            y: this.position.y
        }
        this.health = health ? health : 100
        this.flipped = true
        this.frame = [0,0]
        this.frameDir = false
        this.contact = {
            mt: contact.mt,
            t: contact.t,
            r: this.width - contact.r,
            b: this.height - contact.b,
            l: contact.l
        }

        this.velocity = {
            x: 0,
            y: 0
        }
        
        this.interactive = interactive

        this.animated = animated ? animated : null
        this.keys = {
            right: {
                pressed: false
            },
            left: {
                pressed: false
            },
            down : {
                pressed: false
            },
            jump: {
                pressed: false
            }
        }
        this.sec = 0
        this.actionI = 0
        this.delay = delay
        this.progress = delay
    }

    flip() {
        if (this.sprite.flipped) {
            this.flipped = !this.flipped
        }
    }

    reset() {
        this.running = false
        this.position = {
            x: this.origin.x,
            y: this.origin.y
        }
        this.health = 100
        this.flipped = true
        this.frame = [0,0]
        this.frameDir = false
        this.velocity = {
            x: 0,
            y: 0
        }
        this.keys = {
            right: {
                pressed: false
            },
            left: {
                pressed: false
            },
            down : {
                pressed: false
            },
            jump: {
                pressed: false
            }
        }
        this.sec = 0
        this.actionI = 0
        this.progress = this.delay
    }

    update(c, canvas, gravity, terminalVelocity) {
        this.animated && this.action()        

        this.sprite.frame = this.frame
        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        if (this.physics) {
            

            if (this.position.y + this.contact.b + this.velocity.y < canvas.height) {
                if (this.velocity.y >= terminalVelocity) {
                    this.velocity.y = terminalVelocity
                } else {
                    this.velocity.y += gravity
                }
            } else {
                this.alive = false
            }
        }        

        if (this.position.x + this.width > 0 && this.position.x < canvas.width) {
            this.sprite.draw(c, this.frame, this.flipped, this.position)
        }
        

        if (this.physics) {
            detectCollision(this, this.keys)
        }
        

        characterControl(this, this.keys)
    }

    action() {
        this.keys = {
            right: {
                pressed: false
            },
            left: {
                pressed: false
            },
            down : {
                pressed: false
            },
            jump: {
                pressed: false
            }
        }

        if (this.animated[this.actionI].time < this.sec) {
            if (this.actionI + 1 > this.animated.length - 1) {
                this.actionI = 0
            } else {
                this.actionI += 1
            }
            this.sec = 0
        } else {
            this.sec++
        }

        const action = this.animated[this.actionI]
        this.speed = action.speed ? action.speed : this.defaultSpeed
        if(this.progress > 0) {
            this.progress -= 5
        } else {
            if (this.sprite.isWithin(action.from, action.to)) {
                this.frame = this.sprite.nextFrame()
            } else {
                this.frame = action.from
            }
            this.progress = this.delay
        }
        
        
        

        

        action.key ? this.keys[action.key].pressed = true : null
    }
}