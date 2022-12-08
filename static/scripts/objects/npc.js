import { Character } from '/static/scripts/objects/baseCharacter.js'

export class Npc extends Character {
    constructor(baseTraits, { clas, animations, delay, index }, canvas) {
        super(baseTraits, canvas)

        this.clas = clas ? clas : null

        this.animationsStartDelay = index ? index * 200 : null

        this.alive = true
        this.distracted = false
        
        this.defaultSpeed = this.speed
        this.frameDir = false
        this.animations = animations ? animations : null

        // Indicates from which direction the npc was stopped from
        // 1 is none, 2 is from the right, 3 is from the bottom, 4 is from the left
        this.stopped = 1
        
        this.sec = 0
        this.actionI = 0
        this.delay = delay
        this.progress = delay
        this.tracking = false
        this.attackRange = 10
        
        this.keys = {
            right: {
                pressed: false
            },
            left: {
                pressed: false
            },
            down: {
                pressed: false
            },
            attack: {
                pressed: false
            },
            jump: {
                pressed: false
            }
        }
        
    }

    drawHealthBar(c) {
        if (this.health < this.maxHealth) {
            const amnt = this.maxHealth / 50
            c.fillStyle = 'red'
            c.fillRect(this.position.x + (this.width / 2) - 25, (this.position.y + this.contact.t) - 10, 50, 3)
            c.fillStyle = 'green'
            c.fillRect(this.position.x + (this.width / 2) - 25, (this.position.y + this.contact.t) - 10, this.health / amnt, 3)
        }
    }

    refresh() {
        this.alive = true
        this.stopped = 1
        this.sec = 0
        this.actionI = 0
        this.progress = this.delay
    }

    action() {
        this.keys = {
            right: {
                pressed: false
            },
            left: {
                pressed: false
            },
            down: {
                pressed: false
            },
            attack: {
                pressed: false
            },
            jump: {
                pressed: false
            }
        }
        if(this.animationsStartDelay > 0) {
            this.animationsStartDelay--
            return
        }
        if (this.animations[this.actionI].time < this.sec) {
            if (this.actionI + 1 > this.animations.length - 1) {
                this.actionI = 0
            } else {
                this.actionI += 1
            }
            this.sec = 0
        } else {
            this.sec++
        }

        const action = this.animations[this.actionI]
        
        if (action.key) {
            for (let i in action.key) {
                this.keys[action.key[i]].pressed = true
            }
        }
    }

    findTarget(get) {
        const target = get.position.x + (get.width / 2)
        const mid = this.position.x + (this.width / 2)
        const stop = this.trackingStop ? this.trackingStop : 20

        if(this.attacking) return

        // get.position.y + get.contact.t > this.position.y + this.height
        // get.position.y + get.contact.b < this.position.y
        if(get.position.y + get.contact.b < (this.position.y + this.contact.t) - 60
            || get.position.y + get.contact.t > this.position.y + this.contact.b
        ) {
            this.tracking = false
            return
        }

        if(target < mid && target > mid - this.detectionRaius) {
            this.tracking = true
            this.keys.right.pressed = false
            this.keys.down.pressed = false

            if (target > mid - stop + 5 && this.jump
                && this.position.x + this.contact.l < get.position.x + get.contact.r
            ) {
                this.keys.right.pressed = true
            } else if ((target > mid - stop
                || (this.on.stype == 'start' && this.on.block.includes('sprite')))
                && this.position.y + this.contact.b == get.position.y + get.contact.b
            ) {
                this.keys.right.pressed = false
                this.keys.left.pressed = false
                this.flipped = false
            } else {
                this.keys.left.pressed = true
            }
        } else if (target > mid && target < mid + this.detectionRaius) {
            this.tracking = true
            this.keys.left.pressed = false
            this.keys.down.pressed = false

            if (target < mid + stop - 5 && this.jump
                && this.position.x + this.contact.r > get.position.x + get.contact.l
            ) {
                this.keys.left.pressed = true
            } else if ((target < mid + stop 
                || (this.on.stype == 'end' && this.on.block.includes('sprite')))
                && this.position.y + this.contact.b == get.position.y + get.contact.b
            ) {
                this.keys.right.pressed = false
                this.keys.left.pressed = false
                this.flipped = true
            } else {
                this.keys.right.pressed = true
            }
        } else {
            this.tracking = false
        }
    }

    detectWorld() {
        if (!this.on.block) return
        if (this.on.block.includes('sprite')) {
            if (this.keys.left.pressed && this.on.type == 'start') {
                if (this.position.x + this.contact.l + this.velocity.x <= this.on.left) {
                    this.keys.left.pressed = false
                    this.velocity.x = 0
                    this.damaging > 0 ? this.velocity.x = 0 : null
                }
            } else if (this.keys.right.pressed && this.on.type == 'end') {
                if (this.position.x + this.contact.r + this.velocity.x >= this.on.right) {
                    this.keys.right.pressed = false
                    this.damaging > 0 ? this.velocity.x = 0 : null
                }
            }
        }
        
    }
}