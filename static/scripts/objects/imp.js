import { detectCollision, characterControl } from '/static/scripts/objects/objectTools.js'
import { player } from '/static/scripts/main.js'
import { Sprite } from '/static/scripts/objects/sprite.js'

export class Imp {
    constructor({animated, start, health}, canvas) {
        
        this.images = [
            new Image().src = '/static/images/sprites/Imp Sprite Sheet_flipped.png',
            new Image().src = '/static/images/sprites/Imp Sprite Sheet.png'
        ]        

        this.frames = [8,6]

        this.sprite = new Sprite(this.images[0], this.images[1], this.frames, [0,0])

        this.width = 32
        this.height = 32

        this.stopped = 1

        this.jumpHeight = 12
        this.jump = true
        this.speed = .75
        this.slow = .25
        this.defaultSpeed = this.speed
        this.running = false
        this.distracted = false
        this.detectionRaius = 150

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
        this.contact = {mt: 10, t: 10, r: 22, b: 23, l: 10}

        this.velocity = {
            x: 0,
            y: 0
        }
        
        this.interactive = true

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
        this.delay = 15
        this.progress = this.delay
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
        if (this.position.y + this.contact.b + this.velocity.y < canvas.height) {
            if (this.velocity.y >= terminalVelocity) {
                this.velocity.y = terminalVelocity
            } else {
                this.velocity.y += gravity
            }
        } else {
            this.position.y = 50
        }

        if ((this.stopped == 4 || this.stopped == 2) && this.jump == true) {
            this.jump = false
            this.stopped = 1
            this.velocity.y -= this.jumpHeight
        }

        

        // if (this.interactive) {
        //     if (this.interactive.includes('follow')) {

        //     }
        // }

        this.sprite.draw(c, this.frame, this.flipped, this.position)
                
        detectCollision(this, this.keys)

        if (this.stopped == 3) {
            this.jump = true
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

        const target = player.position.x + (player.width / 2)
        const mid = this.position.x + (this.width / 2)
               
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
        if(target < mid && target > mid - this.detectionRaius) {
            if (target > mid - 15) {

            } else {
                this.keys.left.pressed = true
            }
            
        } else if (target > mid && target < mid + this.detectionRaius) {
            if (target < mid + 15) {

            } else {
                this.keys.right.pressed = true
            }
            
        } else if (action.key) {
            for (let i in action.key) {
                this.keys[action.key[i]].pressed = true
            }
        }

        if(this.progress > 0) {
            this.progress -= 5
        } else {
            if ((this.keys.right.pressed || this.keys.left.pressed) && this.keys.down.pressed) {
                this.speed = this.slow
                if (this.sprite.isWithin([2,0],[2,5])) {
                    this.frame = this.sprite.nextFrame()
                } else {
                    this.frame = [2,0]
                }
            } else if (this.keys.right.pressed || this.keys.left.pressed) {
                this.speed = this.defaultSpeed
                if (this.sprite.isWithin([1,0],[1,7])) {
                    this.frame = this.sprite.nextFrame()
                } else {
                    this.frame = [1,0]
                }
            } else {
                this.speed = this.defaultSpeed
                if (this.sprite.isWithin([0,0],[0,6])) {
                    this.frame = this.sprite.nextFrame()
                } else {
                    this.frame = [0,0]
                }
            }
            this.sprite.frame = this.frame
            this.progress = this.delay
        }

        
    }
}