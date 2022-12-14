/*
    ghosts are simple npcs that have no interaction with other characters or the enviroment.

    They are given a set of actions
        Each action will have a simulated key press for movement and direction
        There will also be a range of frames within the sprite sheet to loop through for each sprite sheet
        There will also be a time for each action (the time measurement is for each animation frame of the game.)

*/

import { Npc } from '/static/scripts/objects/npc.js'

// Ghost extends the Npc object
export class Ghost extends Npc {
    constructor(baseTraits, ghost, canvas) {
        super(baseTraits, ghost, canvas)

        this.speed = ghost.speed
    }

    // Updates the npc. Called in the tools script from the drawWorld function
    update(c) {
        this.draw(c)
        this.action() //Npc function
        this.control(this.keys) //baseCharacter function
        this.animate() // function to set sprite frame(below)
    }

    // Sets frame for current animation
    animate() {
        this.position.x += this.velocity.x
        this.position.y += this.velocity.y

        // progress is a animation framerate delay
        if(this.progress > 0) {
            this.progress -= 5
        } else {
            // if frame is within current animation range, go to next frame
            // else go to start of animation range
            if (this.isWithin(this.animations[this.actionI].from, this.animations[this.actionI].to)) {
                this.nextFrame()
            } else {
                this.frame = this.animations[this.actionI].from
            }
            this.progress = this.delay
        }
    }

    reset() {
        this.refresh()
        this.revert()
    }
}