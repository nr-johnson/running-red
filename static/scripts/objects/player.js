import { isWithin } from '/static/scripts/tools.js'

export class Player {
    constructor(image, flippedImg, win) {
        this.image = image
        this.revImg = flippedImg

        this.width = this.image.width / 12
        this.height = this.image.height / 11
        this.contact = {
            t: 36,
            r: this.width - 50,
            b: this.height - 36,
            l: 50
        }

        this.flipped = true
        this.running = false
        this.falling = false
        this.weaponState = 0
        this.sliding = 0
        this.fallDamage = 29
        this.damaging = 0

        // Position
        this.position = {
            x: 125,
            // Set relative to window height
            y: win.y - this.height - 20
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

    // Draws character to screen
    draw(c) {
        // If flipped is true, draw reversed image, else draw normal image
        // Frames are used to reverence image blocks within the sprite for animations
        c.drawImage(this.flipped ? this.revImg : this.image, this.frame[1] * this.width, this.frame[0] * this.height, this.width, this.height, this.position.x, this.position.y, this.width, this.height)
    }

    // Draw character and calculate new position
    update(c, gravity, terminalVelocity) {
        // Handles animations
        if (this.damaging > 0) {
            if (this.damaging > 5) {
                this.frame = this.damaging % 2 == 0 ? [10,1] : [10,2]
            } else if (this.damaging == 5) {
                this.frame = [10,2]
            } else {
                this.frame = nextFrame(this.frame)
            }
            this.damaging--
        } else if (this.velocity.y < 0) {
            // console.log('jumping')
            this.sliding = 0
            if (isWithin(this.frame, [2,10], [3,11])) {
                this.frame = nextFrame(this.frame)
            } else {
                this.frame = [2,10]
            }
        } else if (this.velocity.y > 0) {
            // console.log('falling')
            this.sliding = 0
            if (isWithin(this.frame, [3,7], [3,10])) {
                this.frame = nextFrame(this.frame)
            } else {
                this.frame = [3,11]
            }
        } else if (isWithin(this.frame, [3,9], [4,3])) {
            // fell off ledge
            this.sliding = 0
            this.frame = nextFrame(this.frame)
        } else if (this.weaponState == 1 || this.weaponState == 2) {
            // Weapon draw animation
            if(isWithin(this.frame, [2,1], [2,5])) {
                this.frame = nextFrame(this.frame)
            } else if(this.frame[1] > 4 && this.frame[0] == 2) {
                this.weaponState = 2
                this.frame = [2,5]
            } else {
                this.frame = [2,1]
            }
        } else if (this.weaponState > 2) {
            if (isWithin(this.frame, [2,6], [2,11])) {
                this.frame = nextFrame(this.frame)
            } else if (this.frame[0] == 2 && this.frame[1] > 10) {
                this.weaponState = 0
                this.frame = [0,0]
            } else {
                this.frame = [2,6]
            }
        } else if (this.sliding > 0) {
            this.contact.t = 75
            if(isWithin(this.frame, [4,4], [4,7])) {
                this.frame = nextFrame(this.frame)
            } else if (this.sliding < 5) {
                this.frame = prevFrame(this.frame)
            } else {
                this.frame = [4,4]
            }
        } else if (this.running) {
            this.contact.t = 36
            if (isWithin(this.frame, [0,1], [2,0])) {
                this.frame = nextFrame(this.frame)
            } else {
                this.frame = [0,1]
            }
            // console.log('running')
        } else {
            this.frame = [0,0]
        }
        
        this.sliding > 0 && this.sliding--


        this.draw(c)

        if (this.damaging > 0) {
            this.velocity = {
                y: -.05,
                x: 0
            }
        }

        this.position.y += this.velocity.y
        this.position.x += this.velocity.x
        if (this.position.y + this.contact.b + this.velocity.y < window.innerHeight) {
            if (this.velocity.y >= terminalVelocity) {
                this.velocity.y = terminalVelocity
            } else {
                this.velocity.y += gravity
            }
            
        } else {
            if (this.velocity.y > this.fallDamage) {
                this.damaging = 20
            }
            this.position.y = window.innerHeight - this.contact.b
            this.velocity.y = 0
        }
    }
}

const nextFrame = (frame) => {
    if (frame[1] < 11) {
        return [frame[0], frame[1] + 1]
    } else if (frame[0] < 10) {
        return [frame[0] + 1, 0]
    } else {
        return [0,0]
    }
}

const prevFrame = (frame) => {
    if (frame[1] > 0) {
        return [frame[0], frame[1] - 1]
    } else if (frame[0] > 0) {
        return [frame[0] - 1, 11]
    } else {
        return [10,11]
    }
}