import { Npc } from '/static/scripts/objects/npc.js'
import { blocks, npcs } from '/static/scripts/tools.js'
import { player } from '/static/scripts/main.js'
 
export class Imp extends Npc {
    constructor(baseTraits, { animations, delay, health }, canvas) {
        super(baseTraits, { animations, delay }, canvas)
        
        this.health = health ? health : 25
        this.speed = 1.25
        this.defaultSpeed = this.speed
        this.jumpHeight = 14
        this.slow = .25
        this.detectionRaius = 225
        this.interactive = true
        this.physics = true

        this.attackDelay = 2
        this.attackTime = false
        
        this.contact = {mt: 10, t: 10, r: 30, b: 35, l: 15}

    }

    update(c, canvas, terminalVelocity) {
        if (!this.alive) return
        if (this.health <= 0) {
            this.deathAnim()
            this.draw(c)
            return
        }
        this.findTarget(player)
        
        this.tracking ? this.attack(player) : this.action()

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

    attack(target) {
        const mid = this.position.x + (this.width / 2)
        const targetMid = target.position.x + (target.width / 2)
        let inRange = false
        if (target.position.y + target.contact.b != this.position.y + this.contact.b) return
        if (this.flipped) {
            if (mid + 15 < targetMid) {
                inRange = true
            }
        } else {
            if (mid - 15 > targetMid) {
                inRange = true
            }
        }
        if (!this.attackTime) {
            this.attackTime = new Date(Date.now())           
        }
    }

    deathAnim() {
        if (this.progress > 0) {
            this.progress -= 3
        } else {
            if (this.deathFrame) {
                if (this.deathFrame <= 1) {
                    this.frame = [4,5]
                    this.alive = false
                    return
                }
            }
            
            if (this.isWithin([4,0], [4,4])) {
                this.deathFrame -= 1
                this.nextFrame()
            } else {
                this.deathFrame = 5
                this.frame = [4,0]
            }
            this.progress = this.delay
        }
    }

    setFrame() {
        if(this.progress > 0) {
            this.progress -= 5
        } else {
            if (this.damaging > 0) {
                if (this.isWithin([3,0], [3,3])) {
                    this.nextFrame()
                } else {
                    this.frame = [3,0]
                }
                this.damaging--
            } else if ((this.keys.right.pressed || this.keys.left.pressed) && this.keys.down.pressed) {
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
        this.health = 25
        this.revert()
        this.refresh()
    }
}