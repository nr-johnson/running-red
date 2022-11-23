import { finishLine } from '/static/scripts/main.js'

export class Background {
    constructor() {
        // Block location
        this.position = {
            x: 0,
            y: 0
        }
        this.images = []
        this.elements = {}
    }

    // Calculates position and if the image is valid, draws the platform
    draw(c, canvas, scroll) {
        this.images.forEach(img => {
            const canv = this.elements.children[img.index].getContext('2d')
            canv.clearRect(0,0,canvas.width, canvas.height)
            for (let j = 0; j < (finishLine + (canvas.width * 2)); j += img.img.width) {
                const pos = (this.position.x + (j * .99)) + (scroll / 1.41) + (((this.images.length - 1) - img.index) * (scroll / 15))
                if (pos + img.img.width > 0 && pos < canvas.width) {
                    canv.drawImage(img.img, pos, this.position.y)
                }
            }
            // (this.position.x + j) + ((scroll / 5) / (i + 1))
        })
    }
}