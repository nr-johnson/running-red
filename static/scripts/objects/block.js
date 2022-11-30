import { canvas } from '/static/scripts/main.js'

// Blocks with collision
export class Block {
    constructor({ type, blockEdge, position, blocking, image, height, width}) {
        
        this.type = type
        
        // Block location
        this.position = {
            x: position.x,
            y: canvas.height - position.y
        }
        
        // If object blocks from Y and X axis
        this.blocking = blocking
        this.blockEdge = blockEdge

        // Platform image to be drawn
        this.image = image

        this.width = width
        this.height = height

        // Original values entered for position. Used to calculate position on window resize
        this.origin = {
            x: position.x,
            y: canvas.height - this.position.y
        }
    }

    // Calculates position and if the image is valid, draws the platform
    draw(c, canvas) {
        if (this.image) {
            // Only draws the image if it's in view
            if (this.position.x + this.width > 0 && this.position.x < canvas.width) {
                c.drawImage(this.image, this.position.x, this.position.y)
            }
        }
    }

    reset() {
        this.position.x = this.origin.x
    }
}