import { Npc } from '/static/scripts/objects/npc.js'

export class Ghost extends Npc {
    constructor(baseTraits, ghost, canvas) {
        super(baseTraits, ghost, canvas)

        this.speed = ghost.speed
    }

    update(c) {
        this.draw(c)
        this.action()
        this.control(this.keys)
        this.animate()
    }

    animate() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y
        if(this.progress > 0) {
            this.progress -= 5
        } else {
            if (this.isWithin(this.animations[this.actionI].from, this.animations[this.actionI].to)) {
                this.nextFrame()
            } else {
                this.frame = this.animations[this.actionI].from
            }
            this.progress = this.delay
        }


    }

    reset() {
        this.refresh()
        this.revert()
    }
}