import { Npc } from '/static/scripts/objects/npc.js'
import { blocks, playAudio, newImage } from '/static/scripts/tools.js'
import { randomNumber } from '/static/scripts/objects/objectTools.js' 
import { player, showGameHasWon } from '/static/scripts/main.js'

const defaultImages = [
    await newImage("/static/images/sprites/Skeleton Sprite Sheet_flipped.png"),
    await newImage("/static/images/sprites/Skeleton Sprite Sheet.png")
]

const defaultAnimations = [
    {"key": ["left"], "time": 200},
    {"key": false, "time": 200},
    {"key": ['right'], "time": 200},
    {"key": false, "time": 200}
]
 
export class Skeleton extends Npc {
    constructor({ images, position, frames, frame }, { health, animations, index }, canvas) {
        super(
            { 
                images: images ? images : defaultImages,
                position,
                frames: frames ? frames : [8,6],
                frame
            }, 
            { 
                clas: 'enemy',
                animations: animations ? animations : defaultAnimations,
                delay: 10,
                index
            },
            canvas
        )

        this.sounds = {
            run: [
                new Audio('/static/sounds/player/run/run0.wav'),
                new Audio('/static/sounds/player/run/run1.wav'),
                new Audio('/static/sounds/player/run/run2.wav'),
                new Audio('/static/sounds/player/run/run3.wav'),
                new Audio('/static/sounds/player/run/run4.wav'),
                new Audio('/static/sounds/player/run/run5.wav')
            ],
            attack: [
                new Audio('/static/sounds/player/attacks/attack0.wav'),
                new Audio('/static/sounds/player/attacks/attack1.wav')
            ],
            hit: new Audio('/static/sounds/player/attacks/hit.wav')
        }

        
        this.health = health ? health : 250
        this.maxHealth = 250
        this.knockBack = 15
        this.resiliance = 5
        this.speed = 1.5
        this.defaultSpeed = this.speed
        this.jumpHeight = 14
        this.slow = .25
        this.detectionRaius = 960
        this.interactive = true
        this.physics = true
        this.trackingStop = 50
        this.attackRange = 10
        this.attackAnimtionReference = 0
        this.playerInAttackRange = false

        this.attackDelay = 3
        this.attackTime = false
        
        this.contact = {mt: 45, t: 45, r: this.width - 50, b: this.height - 48, l: 50}

    }

    async update(c, canvas, terminalVelocity) {
        if (!this.alive) {
            
            return
        }

        if (this.health <= 0) {
            this.damaging = 0
            this.velocity.x = 0
            this.draw(c)
            this.drawHealthBar(c)
            this.calculateGravity(canvas, terminalVelocity)
            this.detectCollision(this, this.keys, blocks)
            this.deathAnim()
            
            return
        }

        this.findTarget(player)
        
        this.tracking ? this.damaging <= 0 && this.attack(player) : this.action()

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
        this.drawHealthBar(c)
        
                
        this.physics && this.detectCollision(this, this.keys, blocks)

        if (this.stopped == 3) {
            this.jump = true
        }
        
        this.control(this.keys)
    }

    attack(target) {
        const dif = 10
        let inRange = false
        if (target.position.y + target.contact.b != this.position.y + this.contact.b) return
        if (this.flipped) {
            if (target.position.x + target.contact.l < (this.position.x + this.width) - dif) {
                inRange = true
            } else {
                inRange = false
            }
        } else {
            if (target.position.x + target.contact.r > this.position.x + dif) {
                inRange = true
            } else {
                inRange = false
            }
        }
        if (!this.attackTime) {
            this.attackTime = new Date(Date.now())
        } else if (inRange) {
            this.playerInAttackRange = true
            const now = new Date(Date.now())
            if (now - this.attackTime >= this.attackDelay * 100) {
                this.attacking = true
                this.keys.left.pressed = false
                this.keys.right.pressed = false
            }
        } else {
            this.playerInAttackRange = false
        }
    }

    deathAnim() {
        if (this.progress > 0) {
            this.progress -= 3
        } else {
            if (this.deathFrame) {
                if (this.deathFrame <= 1) {
                    this.frame = [4,3]
                    this.alive = false
                    showGameHasWon()
                    return
                }
            }
            
            if (this.isWithin([4,0], [4,3])) {
                this.deathFrame -= 1
                this.nextFrame()
            } else {
                this.deathFrame = 4
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
                if (this.isWithin([5,6], [5,7])) {
                    if ((this.flipped && player.position.x + player.contact.l < this.position.x + (this.width / 2))
                        || (!this.flipped && player.position.x + player.contact.r > this.position.x + (this.width / 2))
                    ) {
                        this.playerInAttackRange = false
                    }
                    if(this.playerInAttackRange) {
                        player.takeDamage(15, this.flipped)

                        const sound = this.sounds.hit
                        sound.currentTime = 0
                        sound.volume = .1
                        playAudio(sound)
                    }

                    

                    this.attackTime = new Date(Date.now())
                    this.attacking = false
                    this.nextFrame()
                } else if (this.isWithin([5,0], [5,6])) {
                    this.nextFrame()
                } else {
                    this.frame = [5,0]
                    const soundIndex = randomNumber(0,1)
                    const swingSound = this.sounds.attack[soundIndex]
                    swingSound.currentTime = 0
                    swingSound.volume = .25
                    playAudio(swingSound)
                }
            } else if (this.damaging > 0) {
                if (this.isWithin([1,0], [1,3])) {
                    this.nextFrame()
                } else {
                    this.frame = [1,0]
                }
                this.damaging--
            } else if (this.keys.right.pressed || this.keys.left.pressed) {
                this.speed = this.defaultSpeed
                if (this.isWithin([0,0],[0,3])) {
                    if (this.frame[1] == 0 || this.frame[1] == 4) {
                        const sountIndex = randomNumber(0,5)
                        const sound = this.sounds.run[sountIndex]
                        sound.currentTime = 0
                        sound.volume = .1
                        playAudio(sound)
                    }
                    this.nextFrame()
                } else {
                    this.frame = [0,0]
                }
            } else {
                this.speed = this.defaultSpeed
                if (this.isWithin([3,0],[3,3])) {
                    this.nextFrame()
                } else {
                    this.frame = [3,0]
                }
            }
            this.progress = this.delay
        }
    }

    reset() {
        this.projectiles = []
        this.deathFrame = false
        this.health = 250
        this.revert()
        this.refresh()
    }
}