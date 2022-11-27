import { detectCollision, characterControl, scrollWorld } from '/static/scripts/objects/objectTools.js'
import { keys, blockLeft, blockRight, reset } from '/static/scripts/main.js'
import { Sprite } from '/static/scripts/objects/sprite.js'

export class Player {
    constructor(image, flippedImg, cond, canvas) {
        this.sprite = new Sprite(image, flippedImg, [12,11], [0,0])

        this.width = image.width / 12
        this.height = image.height / 11
        this.contact = {
            mt: 64,
            t: 64,
            r: this.width - 45,
            b: this.height - 36,
            l: 45
        }

        this.on = {
            type: '',
            left: 0,
            right: 0
        }
        this.health = cond.health ? cond.health : 100
        this.flipped = true
        this.running = false
        this.jump = true
        this.falling = false
        this.speed = 5
        this.attacking = false
        this.weaponState = 0
        this.sliding = 0
        this.fallDamage = 31
        this.damaging = 0

        // Position
        this.position = {
            x: cond.start[0],
            // Set relative to canvas height
            y: canvas.height - this.height - cond.start[1]
        }
        this.origin = {
            x: this.position.x,
            y: this.position.y
        }
        // Current sprite frame
        this.frame = [0,0]
        // Movement speed
        this.velocity = {
            x: 0,
            y: 0
        }
    }

    flip() {
        this.flipped = !this.flipped
    }

    updateHealth(amnt) {
        if (this.health + amnt >= 100) {
            this.health = 100
        } else if (this.health + amnt <= 0) {
            this.health = 0
            reset()
        } else {
            this.health += amnt
        }
    }

    reset() {
        this.health = 100
        this.flipped = true
        this.running = false
        this.jump = true
        this.falling = false
        this.speed = 5
        this.attacking = false
        this.weaponState = 0
        this.sliding = 0
        this.fallDamage = 31
        this.damaging = 0

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
    }

    // Draw character and calculate new position
    update(c, gravity, terminalVelocity, canvas) {
        // Handles animations
        if (this.damaging > 0) {
            if (this.damaging > 5) {
                this.frame = this.damaging % 2 == 0 ? [10,1] : [10,2]
            } else if (this.damaging == 5) {
                this.frame = [10,2]
            } else {
                this.frame = this.sprite.nextFrame()
            }
            this.damaging--
        } else if (this.velocity.y < 0) {
            // console.log('jumping')
            this.sliding = 0
            if (this.sprite.isWithin([2,10], [3,11])) {
                this.frame = this.sprite.nextFrame()
            } else {
                this.frame = [2,10]
            }
        } else if (this.velocity.y > .9) {
            // console.log('falling')
            this.sliding = 0
            if (this.sprite.isWithin([3,7], [3,10])) {
                this.frame = this.sprite.nextFrame()
            } else {
                this.frame = [3,11]
            }
        } else if (this.sprite.isWithin([3,9], [4,3])) {
            // fell off ledge
            this.sliding = 0
            this.frame = this.sprite.nextFrame()
        } else if (this.weaponState == 1 || this.weaponState == 2) {
            // Weapon draw animation
            this.velocity.x = 0
            if(this.sprite.isWithin([2,1], [2,5])) {
                this.frame = this.sprite.nextFrame()
            } else if(this.frame[1] >= 4 && this.frame[0] == 2) {
                this.weaponState = 2
                this.frame = [2,5]
            } else {
                this.frame = [2,1]
            }
        } else if (this.weaponState > 2) {
            if (this.sprite.isWithin([2,6], [2,11])) {
                this.frame = this.sprite.nextFrame()
            } else if (this.frame[0] == 2 && this.frame[1] > 10) {
                this.weaponState = 0
                this.frame = [0,0]
            } else {
                this.frame = [2,6]
            }
        } else if (this.sliding != 0) {
            this.contact.t = 75
            if(this.sprite.isWithin([4,4], [4,7])) {
                this.frame = this.sprite.nextFrame()
            } else if ((this.sliding < 5 && this.sliding > 0) || (this.sliding > -5 && this.sliding < 0)) {
                this.frame = this.sprite.prevFrame()
            } else {
                this.frame = [4,4]
            }
        } else if (this.running) {
            this.contact.t = this.contact.mt
            if (this.sprite.isWithin([0,1], [2,0])) {
                this.frame = this.sprite.nextFrame()
            } else {
                this.frame = [0,1]
            }
            // console.log('running')
        } else {
            keys.jump.pressed ? null : this.jump = true
            this.frame = [0,0]
        }
        this.sprite.frame = this.frame

        // Reenables jumping
        if (this.velocity.y == 0 && !keys.jump.pressed) {
            this.jump = true
        }
        
        this.sliding > 0 ? this.sliding-- : this.sliding < 0 && this.sliding++

        if (this.damaging > 0) {
            this.velocity = {
                y: -.05,
                x: 0
            }
        }

        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        if (this.position.y + this.contact.b + this.velocity.y < canvas.height) {
            if (this.velocity.y >= terminalVelocity) {
                this.velocity.y = terminalVelocity
            } else {
                this.velocity.y += gravity
            }
        }

        this.sprite.draw(c, this.frame, this.flipped, this.position)
        
        detectCollision(this, keys)

        if (this.position.y + this.contact.b >= canvas.height - 1) {
            reset()
        }

        if (keys.left.pressed && this.position.x < blockLeft && this.damaging <= 0) {
            scrollWorld(this, keys)
        }else if (keys.right.pressed && this.position.x > blockRight && this.damaging <= 0) {
            scrollWorld(this, keys)
        } else {
            if (this.sliding != 0 && (this.position.x > blockRight || this.position.x < blockLeft)) {
                this.velocity.x = 0
                scrollWorld(this, keys)
            } else {
                characterControl(this, keys)
            }
            
        }
        
    }
}