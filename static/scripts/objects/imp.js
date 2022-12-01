import { Npc } from '/static/scripts/objects/npc.js'
import { blocks, npcs, newImage } from '/static/scripts/tools.js'
import { player } from '/static/scripts/main.js'
import { Projectile } from '/static/scripts/objects/projectile.js'
 
export class Imp extends Npc {
    constructor(baseTraits, { clas, animations, delay, health }, canvas) {
        super(baseTraits, { clas, animations, delay }, canvas)
        
        this.health = health ? health : 25
        this.speed = 1.25
        this.defaultSpeed = this.speed
        this.jumpHeight = 14
        this.slow = .25
        this.detectionRaius = 350
        this.interactive = true
        this.physics = true
        this.trackingStop = 40

        this.fireball = [
            '/static/images/projectiles/Fireball.png',
            '/static/images/projectiles/Fireball_flipped.png'
        ]

        this.attackDelay = 12
        this.attackTime = false
        
        this.contact = {mt: 10, t: 10, r: 30, b: 36, l: 15}

    }

    async update(c, canvas, terminalVelocity) {
        if (!this.alive) return
        if (this.health <= 0) {
            this.damaging = 0
            this.velocity.x = 0
            this.draw(c)
            this.calculateGravity(canvas, terminalVelocity)
            this.detectCollision(this, this.keys, blocks)
            this.deathAnim()
            
            return
        }

        if (typeof this.fireball[0] == 'string') {
            this.fireball[0] = await newImage(this.fireball[0])
        }
        if (typeof this.fireball[1] == 'string') {
            this.fireball[1] = await newImage(this.fireball[1])
        }

        this.findTarget(player)
        
        this.tracking ? this.attack(player) : this.action()

        this.detectWorld()

        this.setFrame()

        if ((this.stopped == 4 || this.stopped == 2) && this.jump == true) {
            this.jump = false
            this.stopped = 1
            this.velocity.y -= this.jumpHeight
            this.keys.left.pressed = false
            this.keys.right.pressed = false
        }

        this.physics && this.calculateGravity(canvas, terminalVelocity)

        this.draw(c)
                
        this.physics && this.detectCollision(this, this.keys, blocks)

        this.projectiles.forEach(dart => {
            dart.update(c, canvas, this)
        })

        if (this.stopped == 3) {
            this.jump = true
        }
        
        this.control(this.keys)
    }

    attack(target) {
        const mid = this.position.x + (this.width / 2)
        const targetMid = target.position.x + (target.width / 2)
        let inRange = false
        if (target.position.y + target.contact.b != this.position.y + this.contact.b) return
        if (this.flipped) {
            if (mid + 10 < targetMid) {
                inRange = true
            }
        } else {
            if (mid - 10 > targetMid) {
                inRange = true
            }
        }
        if (!this.attackTime) {
            this.attackTime = new Date(Date.now())           
        } else if (inRange) {
            const now = new Date(Date.now())
            if (now - this.attackTime >= this.attackDelay * 100) {
                this.attacking = true
                this.keys.left.pressed = false
                this.keys.right.pressed = false
            }
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
            if (this.attacking) {
                if (this.isWithin([2,3], [2,4])) {
                    this.attackTime = new Date(Date.now())
                    const fire = new Projectile({
                        speed: 15,
                        images: this.fireball,
                        position: {x: this.position.x + this.contact.l, y: this.position.y + this.contact.mt + 13}, 
                        source: 'npc',
                        flipped: this.flipped,
                        damage: 15,
                        fired: true,
                        solid: false,
                        sound: ['/static/sounds/projectiles/fire/fireRelease.mp3', '/static/sounds/projectiles/fire/fireImpact.mp3']
                    })
                    this.projectiles.push(fire)
                    this.attacking = false
                    this.nextFrame()
                } else if (this.isWithin([2,0], [2,3])) {
                    this.nextFrame()
                } else {
                    this.frame = [2,0]
                }
            } else if (this.damaging > 0) {
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
        this.deathFrame = false
        this.health = 25
        this.revert()
        this.refresh()
    }
}