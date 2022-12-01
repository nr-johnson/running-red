import { npcs, blocks } from '/static/scripts/tools.js'
import { player } from '/static/scripts/main.js'

export class Projectile {
    constructor({ speed, images, position, dist, source, flipped, damage, fired, solid, sound }) {

        this.sounds = sound ? {
            release: new Audio(sound[0]),
            impact: new Audio(sound[1])
        } : null

        this.dist = dist ? dist : 10

        this.releasePlayed = false
        
        this.images = images
        this.speed = speed
        this.source = source

        this.solid = solid

        this.fired = fired
        this.stopped = false
        this.stoppedFor = 0

        this.color = false

        this.damage = damage

        this.width = this.images[0].width
        this.height = this.images[0].height

        this.flipped = flipped

        this.position = {
            x: position.x,
            y: position.y
        }
    }

    update(c, canvas, shooter) {
        this.draw(c)

        if (this.stopped) {
            this.stoppedFor >= 500 && this.remove(shooter)
            this.stoppedFor++
        }

        if (!this.fired) return

        if (!this.releasePlayed) {
            this.sounds.release.volume = .25
            this.sounds.release.play()
            this.releasePlayed = true
        }

        if(this.position.x < -150 || this.position.x + this.width > canvas.width + 150) {
            this.remove(shooter)
        }

        blocks.forEach(block => {
            if (block.invisible) return
            if (this.position.y >= block.position.y
                && this.position.y + this.height <= block.position.y + block.height
            ) {
                if (this.flipped) {
                    if ((this.position.x + this.width >= block.position.x
                        || this.position.x + this.width + this.speed >= block.position.x)
                        && this.position.x + block.width < block.position.x + block.width
                    ) {
                        if (this.solid) {
                            this.position.x = block.position.x - this.width + 3
                            this.stopped = true
                        } else {
                            this.remove(shooter)
                        }
                        
                    }
                } else {
                    if ((this.position.x <= block.position.x + block.width
                        || this.position.x - this.speed <= block.position.x + block.width)
                        && this.position.x + this.width > block.position.x
                    ) {
                        if (this.solid) {
                            this.position.x = block.position.x + block.width - 3
                            this.stopped = true
                        } else {
                            this.remove(shooter)
                        }
                        
                    }
                }
            }
        })

        if (this.source == 'player') {
            if (this.stopped) return
            npcs.forEach(npc => {
                if (npc.clas != 'enemy' || !npc.alive) return
                this.isHit(npc, shooter)                
            });
        } else if (this.source == 'npc') {
            this.isHit(player, shooter)
        }

        if (this.stopped) return

        if (this.dist <= 0) {
            this.position.y += 2
        } else {
            this.dist -= 1
        }



        if (this.flipped) {
            this.position.x += this.speed
        } else {
            this.position.x -= this.speed
        }
    }

    isHit(target, shooter) {
        if(this.position.y >= target.position.y + target.contact.t
            && this.position.y + this.height <= target.position.y + target.contact.b
        ) {
            if (this.flipped) {
                if (this.position.x + this.width >= target.position.x + target.contact.l
                    && this.position.x + this.width < target.position.x + target.width    
                ) {
                    target.takeDamage(this.damage, true)
                    this.sounds.impact.valume = .25
                    this.sounds.impact.play()
                    this.remove(shooter)
                }
            } else {
                if (this.position.x <= target.position.x + target.contact.r
                    && this.position.x > target.position.x + target.contact.l
                ) {
                    target.takeDamage(this.damage, false)
                    this.sounds.impact.valume = .25
                    this.sounds.impact.play()
                    this.remove(shooter)
                }
            }
        }
    }

    draw(c) {
        if (this.color) {
            c.fillStyle = 'red'
            c.fillRect(this.position.x,this.position.y,this.width,this.height)
        }
        c.drawImage(this.flipped ? this.images[1] : this.images[0], this.position.x, this.position.y, this.width, this.height)
    }

    remove(shooter) {
        shooter.projectiles.splice(shooter.projectiles.indexOf(this), 1)
    }
}