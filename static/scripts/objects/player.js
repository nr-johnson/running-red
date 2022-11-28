import { Character } from '/static/scripts/objects/baseCharacter.js'
import { scrollWorld } from '/static/scripts/objects/objectTools.js'
import { blockLeft, blockRight, reset } from '/static/scripts/main.js'
import { blocks, npcs, newImage } from '/static/scripts/tools.js'
import { Projectile } from '/static/scripts/objects/projectile.js'

export class Player extends Character {
    constructor(baseTraits, playerTraits, canvas) {
        super(baseTraits, canvas)

        this.contact = {
            mt: 64,
            t: 64,
            r: this.width - 45,
            b: this.height - 36,
            l: 45
        }

        this.arrow = [
            '/static/images/projectiles/Arrow.png',
            '/static/images/projectiles/Arrow_flipped.png'
        ]

        this.health = playerTraits.health ? playerTraits.health : 100
        this.flipped = true
        this.running = false
        this.jump = true
        this.speed = 5
        this.attacking = false
        this.hit = []
        this.attackAnim = 0
        this.attackHold = false
        this.weaponState = 0
        this.sliding = 0
        this.fallDamage = 31
        this.damaging = 0
    }

    async update(c, terminalVelocity, keys, canvas) {
        if (this.health <= 0) {
            reset()
        }

        if (typeof this.arrow[0] == 'string') {
            this.arrow[0] = await newImage(this.arrow[0])
        }
        if (typeof this.arrow[1] == 'string') {
            this.arrow[1] = await newImage(this.arrow[1])
        }

        this.keys = keys

        if (this.keys.attack.pressed) {
            if (!this.attackHold) this.attacking = true
            this.attackHold = true
        } else {
            this.attackHold = false
        }

        this.setFrame()

        if (this.weaponState == 3) {
            this.weaponState = 0
            console.log('firing')
            const arrow = new Projectile({
                speed: 20,
                images: this.arrow,
                position: {x: this.position.x + this.contact.l, y: this.position.y + this.contact.mt + 13}, 
                source: 'player',
                flipped: this.flipped,
                damage: 15,
                fired: true
            })
            this.projectiles.push(arrow)
        }

        this.attacking && this.hitTarget(5)

        // Resets jump
        if (this.velocity.y == 0 && !keys.jump.pressed) {
            this.jump = true
        }
        
        // Decriments slide counter
        this.sliding > 0 ? this.sliding-- : this.sliding < 0 && this.sliding++

        // Prevents character from sinking into the ground when taking damage
        if (this.damaging > 0) {
            this.velocity = {
                y: -.05,
                x: 0
            }
        }

        this.calculateGravity(canvas, terminalVelocity)
        this.draw(c, this.flipped, this.position)
        this.detectCollision(this, this.keys, blocks)

        this.projectiles.forEach(arr => {
            arr.update(c, canvas, this)
        })

        if (this.position.y + this.contact.b >= canvas.height - 1) {
            reset()
        }

        if (this.damaging > 0) return
        if (keys.left.pressed && this.position.x < blockLeft && this.damaging <= 0) {
            scrollWorld(this, this.keys)
        }else if (keys.right.pressed && this.position.x > blockRight && this.damaging <= 0) {
            scrollWorld(this, this.keys)
        } else {
            if (this.sliding != 0 && (this.position.x > blockRight || this.position.x < blockLeft)) {
                this.velocity.x = 0
                scrollWorld(this, this.keys)
            } else {
                // Imobilaze player if damage animation is playing
                this.control(this.keys)
            }
        }
    }

    reset() {
        this.revert()
        this.health = 100
        this.speed = 5
        this.weaponState = 0
        this.sliding = 0
        this.fallDamage = 31
    }

    hitTarget(damage) {
        npcs.forEach(npc => {
            if (!this.hit.includes(npc)) {
                if (this.flipped) {
                    if (npc.position.x + npc.contact.l < this.position.x + this.contact.r + 20
                        && npc.position.x + npc.contact.r > this.position.x + (this.width / 2)    
                    ) {
                        this.hit += npc
                        npc.takeDamage(damage, true)
                    }
                } else {
                    if (npc.position.x + npc.contact.r > this.position.x + this.contact.l - 20
                        && npc.position.x + npc.contact.l < this.position.x + (this.width / 2)
                    ) {
                        this.hit += npc
                        npc.takeDamage(damage, false)
                    }
                }
            }
        })
    }

    setFrame() {
         // Handles animations
         if (this.damaging > 0) {
            if (this.damaging > 5) {
                this.frame = this.damaging % 2 == 0 ? [10,1] : [10,2]
            } else if (this.damaging == 5) {
                this.frame = [10,2]
            } else {
                this.nextFrame()
            }
            this.damaging--
        } else if (this.velocity.y < 0) {
            // console.log('jumping')
            this.sliding = 0
            if (this.isWithin([2,10], [3,11])) {
                this.nextFrame()
            } else {
                this.frame = [2,10]
            }
        } else if (this.velocity.y > .9) {
            // console.log('falling')
            this.sliding = 0
            if (this.isWithin([3,7], [3,10])) {
                this.nextFrame()
            } else {
                this.frame = [3,11]
            }
        } else if (this.isWithin([3,9], [4,3])) {
            // fell off ledge
            this.sliding = 0
            this.nextFrame()
        } else if (this.attacking) {
            this.sliding = 0
            // Attack animation
            this.velocity.x = 0
            let from = []
            let to = []

            if (this.attackAnim == 0) {
                from = [4,9]
                to = [5,2]
            } else if (this.attackAnim == 1) {
                from = [5,3]
                to = [5,9]
            } else {
                from = [5,10]
                to = [6,7]
            }

            if (this.isWithin(from, to)) {
                this.nextFrame()
            } else if(this.frame >= to) {
                this.attackAnim > 1 ? this.attackAnim = 0 : this.attackAnim += 1
                this.attacking = false
                this.hit = []
                this.frame = [0,0]
            } else {
                this.frame = from
            }
        } else if (this.weaponState == 1 || this.weaponState == 2) {
            this.sliding = 0
            // Weapon draw animation
            this.velocity.x = 0
            if(this.isWithin([2,1], [2,5])) {
                this.nextFrame()
            } else if(this.frame[1] >= 4 && this.frame[0] == 2) {
                this.weaponState = 2
                this.frame = [2,5]
            } else {
                this.frame = [2,1]
            }
        } else if (this.weaponState > 2) {
            if (this.isWithin([2,6], [2,11])) {
                this.nextFrame()
            } else if (this.frame[0] == 2 && this.frame[1] > 10) {
                this.weaponState = 0
                this.frame = [0,0]
            } else {
                this.frame = [2,6]
            }
        } else if (this.sliding != 0) {
            this.contact.t = 75
            if(this.isWithin([4,4], [4,7])) {
                this.nextFrame()
            } else if ((this.sliding < 5 && this.sliding > 0) || (this.sliding > -5 && this.sliding < 0)) {
                this.prevFrame()
            } else {
                this.frame = [4,4]
            }
        } else if (this.running) {
            this.contact.t = this.contact.mt
            if (this.isWithin([0,1], [2,0])) {
                this.nextFrame()
            } else {
                this.frame = [0,1]
            }
            // console.log('running')
        } else {
            this.keys.jump.pressed ? null : this.jump = true
            this.frame = [0,0]
        }
    }
}