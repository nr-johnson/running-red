export class Text {
    constructor({ msg, pos, font, color }, canvas) {
        this.msg = msg

        this.position = {
            x: pos[0],
            y: canvas.height - pos[1]
        }

        this.origin = {
            x: pos[0],
            y: canvas.height - pos[1]
        }

        this.font = font ? font : '14px serif'
        this.color = color ? color : 'white'
    }

    draw(c) {
        c.font = this.font
        c.fillStyle = this.color
        c.fillText(this.msg, this.position.x, this.position.y)
    }

    reset() {
        this.position.x = this.origin.x
        this.position.y = this.origin.y
    }

}