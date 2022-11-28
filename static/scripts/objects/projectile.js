import { npcs, blocks } from '/static/scripts/tools.js'

export class Projectile {
    constructor({ speed, images, position, source, flipped, damage, fired }) {
        
        this.images = images
        this.speed = speed
        this.source = source

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
            this.stoppedFor >= 120 && this.remove(shooter)
            this.stoppedFor++
        }

        if (!this.fired) return
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
                        this.position.x = block.position.x - this.width + 3
                        this.stopped = true
                    }
                } else {
                    if ((this.position.x <= block.position.x + block.width
                        || this.position.x - this.speed <= block.position.x + block.width)
                        && this.position.x + this.width > block.position.x
                    ) {
                        this.position.x = block.position.x + block.width - 3
                        this.stopped = true
                    }
                }
            }
        })

        if (this.source == 'player') {
            if (this.stopped) return
            npcs.forEach(npc => {
                if(npc.alive
                    && this.position.y >= npc.position.y + npc.contact.t
                    && this.position.y + this.height <= npc.position.y + npc.contact.b
                ) {
                    if (this.flipped) {
                        if (this.position.x + this.width >= npc.position.x + npc.contact.l
                            && this.position.x + this.width < npc.position.x + npc.width    
                        ) {
                            npc.takeDamage(this.damage, true)
                            this.remove(shooter)
                        }
                    } else {
                        if (this.position.x <= npc.position.x + npc.contact.r
                            && this.position.x > npc.position.x + npc.contact.l
                        ) {
                            npc.takeDamage(this.damage, false)
                            this.remove(shooter)
                        }
                    }
                }
                
            });
        }

        if (this.stopped) return
        if (this.flipped) {
            this.position.x += this.speed
        } else {
            this.position.x -= this.speed
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