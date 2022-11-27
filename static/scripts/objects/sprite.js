import { newImage } from '/static/scripts/tools.js'

export class Sprite {
    constructor(img, flipped, frames, frame) {
        this.image = img
        // this.image.src = img
        this.flipped = flipped
        // this.flipped.src = flipped

        // this.flipped.src = flipped

        this.frames = frames

        this.color = true

        this.frames = frames
        this.width = this.image.width / frames[0]
        this.height = this.image.height / frames[1]

        this.frame = frame ? frame : [0,0]
    }

    draw(c, flipped, position) {
        // if (typeof this.image == 'string') {
        //     this.image = await newImage(this.image)
        //     this.width = this.image.width / this.frames[0]
        //     this.height = this.image.height / this.frames[1]
        // }
        // if (typeof this.flipped == 'string') {
        //     this.flipped = await newImage(this.flipped)
        // }
        // If flipped is true, draw reversed image, else draw normal image
        // Frames are used to reverence image blocks within the sprite for animations
        if (this.color) {
            c.fillStyle = '#ffffff50'
            c.fillRect(position.x, position.y, this.width, this.height)
        }
        c.drawImage(flipped && this.flipped ? this.flipped : this.image, this.frame[1] * this.width, this.frame[0] * this.height, this.width, this.height, position.x, position.y, this.width, this.height)
        
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
            return [this.frame[0], this.frame[1] + 1]
        } else if (this.frame[0] < this.frames[0]) {
            return [this.frame[0] + 1, 0]
        } else {
            return [0,0]
        }
    }
    
    prevFrame() {
        if (this.frame[1] > 0) 
            return [this.frame[0], this.frame[1] - 1]
        if (this.frame[0] > 0) 
            return [this.frame[0] - 1, this.frames[1]]
        return [this.frames[0], this.frames[1]]
    }
}

export function isWithin(frame, from, to) {
    
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