// Blocks with collision
export class Block {
    constructor({ x, y, blocking, image}) {
        // Block location
        this.position = {
            x: x,
            // Set relative to window height
            y: window.innerHeight - y
        }
        
        // If object blocks from Y and X axis
        this.blocking = blocking

        // Platform image to be drawn
        this.image = image

        this.width = image.width
        this.height = image.height

        // Original values entered for position. Used to calculate position on window resize
        this.origin = {
            x,
            y
        }
    }

    // Calculates position and if the image is valid, draws the platform
    draw(c) {
        this.position.y = window.innerHeight - this.origin.y
        if (this.image) {
            c.drawImage(this.image, this.position.x, this.position.y)
        }
    }
}