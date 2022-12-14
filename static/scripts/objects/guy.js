/*
    Guy enemy type
*/

import { Npc } from '/static/scripts/objects/npc.js'
import { blocks, playAudio, newImage } from '/static/scripts/tools.js'
import { randomNumber } from '/static/scripts/objects/objectTools.js' 
import { player } from '/static/scripts/main.js'


const defaultImages = [
    await newImage("/static/images/sprites/Guy Sprite Sheet_flipped.png"),
    await newImage("/static/images/sprites/Guy Sprite Sheet.png")
]

// Actions for the npc if not interacting with player
const defaultAnimations = [
    {"key": ["left"], "time": 115},
    {"key": false, "time": 200},
    {"key": ['right'], "time": 115},
    {"key": ["left", "down"], "time": 200},
    {"key": ["right", "down"], "time": 200},
    {"key": false, "time": 200}
]
 
// extends Npc object
export class Guy extends Npc {
    constructor({ images, position, frames, frame }, { health, animations, index }, canvas) {
        super(
            { 
                images: images ? images : defaultImages,
                position,
                frames: frames ? frames : [11,25],
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

        // Sounds for character actions
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
                new Audio('/static/sounds/npcs/punches/punch1.wav'),
                new Audio('/static/sounds/npcs/punches/punch2.wav'),
                new Audio('/static/sounds/npcs/punches/punch3.wav'),
                new Audio('/static/sounds/npcs/punches/punch4.wav')
            ]
        }

        
        this.health = health ? health : 75
        this.maxHealth = 75
        this.speed = 2.5
        this.defaultSpeed = this.speed
        this.jumpHeight = 14
        // Speed to move when character is slowed (crouch speed)
        this.slow = .25
        // Radius within which npc will move toward player
        this.detectionRaius = 250
        this.interactive = true
        this.physics = true
        // Distance from player the npc will stop
        this.trackingStop = 10
        // Distance from player the npc will attach from
        this.attackRange = 10
        
        this.attackAnimtionReference = 0
        this.playerInAttackRange = false

        this.attackDelay = 3
        this.attackTime = false
        
        // position from the edge of the sprite image where the character pixels reside and therefore should iteract from
        this.contact = {mt: 0, t: 0, r: this.width - 25, b: this.height - 8, l: 30}

    }

    async update(c, canvas, terminalVelocity) {
        // if dead, dont do anything
        if (!this.alive) return

        // if just killed, play death animation
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

        // detect if player is within detection range
        this.findTarget(player)
        
        // if character is within range, follow character, else continue with base animation
        this.tracking ? this.damaging <= 0 && this.attack(player) : this.action()

        // ledge detection
        this.detectWorld()

        // set sprite sheet frame
        this.setFrame()

        // Stops character movement despite provided commands
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
        
        // Moves character with simulated key presses
        this.control(this.keys)
    }

    // Attempt to attack player
    attack(target) {
        const dif = 30
        let inRange = false
        if (target.position.y + target.contact.b != this.position.y + this.contact.b) return
        if (this.flipped) {
            if (target.position.x + target.contact.l < (this.position.x + this.width) - dif) {
                inRange = true
            }
        } else {
            if (target.position.x + target.contact.r > this.position.x + dif) {
                inRange = true
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
                    this.frame = [18,10]
                    this.alive = false
                    return
                }
            }
            
            if (this.isWithin([18,0], [18,9])) {
                this.deathFrame -= 1
                this.nextFrame()
            } else {
                this.deathFrame = 10
                this.frame = [18,0]
            }
            this.progress = this.delay
        }
    }

    setFrame() {
        if(this.progress > 0) {
            this.progress -= 5
        } else {
            if (this.attacking) {
                const animationRow = 12 + this.attackAnimtionReference
                const animationLength = animationRow % 2 == 0 ? 5 : 4
                if (this.isWithin([animationRow,animationLength - 1], [animationRow,animationLength])) {
                    if ((this.flipped && player.position.x + player.contact.l < this.position.x + (this.width / 2))
                        || (!this.flipped && player.position.x + player.contact.r > this.position.x + (this.width / 2))
                    ) {
                        this.playerInAttackRange = false
                    }


                    if(this.playerInAttackRange) {
                        const sound = this.sounds.attack[this.attackAnimtionReference]
                        sound.currentTime = 0
                        sound.volume = .1
                        playAudio(sound)
                        player.takeDamage(15, this.flipped)
                    
                    }
                    this.attackAnimtionReference = randomNumber(0,3);
                    this.attackTime = new Date(Date.now())
                    this.attacking = false
                    this.nextFrame()
                } else if (this.isWithin([animationRow,0], [animationRow,animationLength - 1])) {
                    this.nextFrame()
                } else {
                    this.frame = [animationRow,0]
                }
            } else if (this.damaging > 0) {
                if (this.isWithin([17,0], [17,3])) {
                    this.nextFrame()
                } else {
                    this.frame = [17,0]
                }
                this.damaging--
            } else if ((this.keys.right.pressed || this.keys.left.pressed) && this.keys.down.pressed) {
                this.speed = this.slow
                this.progress += 4
                if (this.isWithin([8,0],[8,8])) {
                    this.nextFrame()
                } else {
                    this.frame = [8,0]
                }
            } else if (this.keys.right.pressed || this.keys.left.pressed) {
                this.speed = this.defaultSpeed
                if (this.isWithin([4,0],[4,8])) {
                    if (this.frame[1] == 0 || this.frame[1] == 4) {
                        const sountIndex = randomNumber(0,5)
                        const sound = this.sounds.run[sountIndex]
                        sound.currentTime = 0
                        sound.volume = .1
                        playAudio(sound)
                    }
                    this.nextFrame()
                } else {
                    this.frame = [4,0]
                }
            } else {
                this.speed = this.defaultSpeed
                if (this.isWithin([0,0],[0,3])) {
                    this.nextFrame()
                } else {
                    this.frame = [0,0]
                }
            }
            this.progress = this.delay
        }
    }

    reset() {
        this.projectiles = []
        this.deathFrame = false
        this.health = 75
        this.revert()
        this.refresh()
    }
}