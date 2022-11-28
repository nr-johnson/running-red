// Blocks with collision
export class Wall {
    constructor({  position, blocking, height, width}) {

        this.invisible = true

        // Block location
        this.position = {
            x: position.x,
            y: position.y
        }
        
        // If object blocks from Y and X axis
        this.blocking = blocking
        this.color = false

        this.width = width
        this.height = height

        // Original values entered for position. Used to calculate position on window resize
        this.origin = {
            x: position.x,
            y: position.y
        }
    }

    // Calculates position and if the image is valid, draws the platform
    draw(c, canvas) {
        this.position.y = canvas.height - this.origin.y
        if (this.color) {
            c.fillStyle = 'blue'
            c.fillRect(this.position.x, this.position.y, this.width, this.height)
        }
    }

    reset() {
        this.position.x = this.origin.x
    }
}