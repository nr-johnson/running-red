/* 
    This sscript contains the background object.

    It handles the calculations for each background layer, which gives the paralax effect when player is running
*/

// Game horizontial length
import { finishLine } from '/static/scripts/main.js'

// background object
export class Background {
    constructor() {
        // Block location
        this.position = {
            x: 0,
            y: 0
        }
        // Array of images, set in the tools script file in the buildWorld function
        this.images = []
        // list of dom elements for each image layer. Created and added in the tools script file un the build world function
        this.elements = {}
    }

    // Calculates position and if the image is valid, draws the platform
    draw(c, canvas, scroll) {
        // For each layer
        this.images.forEach(img => {
            // Get layer's context
            const canv = this.elements.children[img.index].getContext('2d')
            // Clear layer's previous frame
            canv.clearRect(0,0,canvas.width, canvas.height)
            // Repeat image for the length of the game (allows continouse scrolling)
            for (let j = 0; j < (finishLine + (canvas.width * 3)); j += img.img.width) {
                // Calculation for the position of the current image within the current layer
                // Calculated to make the top layer move close to player run speed and progressively slow for each layer after using the layer's index number
                // Each image is offset from the overall position of the background.
                const pos = (this.position.x + (j * .99)) + (scroll / 1.41) + (((this.images.length - 1) - img.index) * (scroll / 15))
                // draw current image
                if (pos + img.img.width > 0 && pos < canvas.width) {
                    canv.drawImage(img.img, pos, this.position.y)
                }
            }
        })
    }

    reset() {
        // Resets the overall background position
        this.position = {
            x: 0,
            y: 0
        }
    }
}