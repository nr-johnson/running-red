import { player } from '/static/scripts/main.js'

export class PickupItem {
    constructor({ position, type, count, image }, canvas) {
        
        this.type = type

        this.count = count

        this.collected = false

        this.sound = new Audio('/static/sounds/objects/pickup.wav')

        this.image = new Image()
        this.image.src = image

        this.bounceTime = 9
        this.bounceDir = 1

        this.position = {
            x: position[0],
            y: canvas.height - position[1]
        }
        this.origin = {
            x: this.position.x,
            y: this.position.y
        }
        this.width = this.image.width
        this.height = this.image.height
    }
    update(c) {
        if (this.collected) return
        this.pickup()

        this.bounce()
        this.draw(c)
    }

    reset() {
        this.collected = false
        this.position = {
            x: this.origin.x,
            y: this.origin.y
        }
    }

    pickup() {
        if (player.position.y + player.contact.t - 20 > this.position.y + this.height
            || player.position.y + player.contact.b + 20 < this.position.y
        ) {
            return
        }
        if (player.position.x + player.contact.r + 20 > this.position.x
            && player.position.x + player.contact.l - 20 < this.position.x + this.width
        ) {
            
            player.pickUp(this)
        }
    }

    bounce() {
        if (this.bounceTime > 0) {
            this.bounceTime--
        } else {
            this.bounceTime = 8
            this.bounceDir = this.bounceDir * -1
        }
        this.bounceTime % 3 == 0 ? this.position.y += this.bounceDir : null
    }

    draw(c) {
        
        c.drawImage(this.image, this.position.x, this.position.y)
    }
}