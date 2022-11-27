import { Npc } from '/static/scripts/objects/npc.js'
import { blocks } from '/static/scripts/tools.js'
import { player } from '/static/scripts/main.js'
 
export class Imp extends Npc {
    constructor(baseTraits, { animations, delay, health }, canvas) {
        super(baseTraits, { animations, delay }, canvas)
        
        this.health = health ? health : 100
        this.speed = 1.25
        this.defaultSpeed = this.speed
        this.jumpHeight = 14
        this.slow = .25
        this.detectionRaius = 225
        this.interactive = true
        this.physics = true
        
        this.contact = {mt: 10, t: 10, r: 22, b: 23, l: 10}

    }

    update(c, canvas, terminalVelocity) {
        this.findTarget(player)
        !this.tracking && this.action()
        
        this.setFrame()

        if ((this.stopped == 4 || this.stopped == 2) && this.jump == true) {
            this.jump = false
            this.stopped = 1
            this.velocity.y -= this.jumpHeight
        }

        this.physics && this.calculateGravity(canvas, terminalVelocity)

        this.draw(c)
                
        this.physics && this.detectCollision(this, this.keys, blocks)

        if (this.stopped == 3) {
            this.jump = true
        }
        this.detectWorld()
        this.control(this.keys)
    }

    setFrame() {
        if(this.progress > 0) {
            this.progress -= 5
        } else {
            if ((this.keys.right.pressed || this.keys.left.pressed) && this.keys.down.pressed) {
                this.speed = this.slow
                if (this.isWithin([2,0],[2,5])) {
                    this.nextFrame()
                } else {
                    this.frame = [2,0]
                }
            } else if (this.keys.right.pressed || this.keys.left.pressed) {
                this.speed = this.defaultSpeed
                if (this.isWithin([1,0],[1,7])) {
                    this.nextFrame()
                } else {
                    this.frame = [1,0]
                }
            } else {
                this.speed = this.defaultSpeed
                if (this.isWithin([0,0],[0,6])) {
                    this.nextFrame()
                } else {
                    this.frame = [0,0]
                }
            }
            this.progress = this.delay
        }
    }

    reset() {
        this.revert()
        this.refresh()
    }
}