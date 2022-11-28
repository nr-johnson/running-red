import { Character } from '/static/scripts/objects/baseCharacter.js'

export class Npc extends Character {
    constructor(baseTraits, { animations, delay }, canvas) {
        super(baseTraits, canvas)

        this.alive = true
        this.distracted = false
        
        this.defaultSpeed = this.speed
        this.frameDir = false
        this.animations = animations ? animations : null
        this.stopped = 1
        this.sec = 0
        this.actionI = 0
        this.delay = delay
        this.progress = delay
        this.tracking = false
        
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
                const key = action.key[i]
                this.keys[action.key[i]].pressed = true
            }
        }


        
    }

    findTarget(get) {
        const target = get.position.x + (get.width / 2)
        const mid = this.position.x + (this.width / 2)
        if(target < mid && target > mid - this.detectionRaius) {
            this.tracking = true
            this.keys.right.pressed = false
            this.keys.down.pressed = false
            if (target > mid - 20) {
                this.keys.left.pressed = false
            } else {
                this.keys.left.pressed = true
                
            }
            
        } else if (target > mid && target < mid + this.detectionRaius) {
            this.tracking = true
            this.keys.left.pressed = false
            this.keys.down.pressed = false
            if (target < mid + 20) {
                this.keys.right.pressed = false
            } else {
                this.keys.right.pressed = true
                
            }
            
        } else {
            this.tracking = false
        }
    }

    takeDamage(amnt, right) {
        this.damaging += amnt * 2
        if (right) {
            this.position.x += 30
        } else {
            this.position.x -= 30
        }
        
        this.updateHealth(amnt * -1)
    }

    detectWorld() {
        if (!this.on.block) return
        if (this.on.block.includes('sprite')) {
            if (this.keys.left.pressed && this.on.type == 'start') {
                if (this.position.x + this.contact.l + this.velocity.x <= this.on.left) {
                    this.keys.left.pressed = false
                }
            } else if (this.keys.right.pressed && this.on.type == 'end') {
                if (this.position.x + this.contact.r + this.velocity.x >= this.on.right) {
                    this.keys.right.pressed = false
                }
            }
        }
        
    }
}