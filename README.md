# Running Red

## Game Link: 
[red.nrjohnson.net](https://red.nrjohnson.net)

---

## Video Demo: 
[YouTube](https://youtu.be/jL9W17az95o)

---

## Description:
Running Red is a web based platform game where you control a character through jumping puzzles and enemies. I kind of got carried away with it and the project got rather large. I created this as my final project for Harvard's CS50 Introduction to Computer Science course.

Right now it is only one level with a final boss fight. But I built it so that expanding the game would be relatively simple.

It is a flask app that loads two pages, the game and the builder (see below).

The game and builder depend heavily on front end javascript but also make Ajax requests to the server to save and retrieve data.

---

## Gameplay:
Press `A` or `Left Arrow` to run left

Press `D` or `Right Arrow` to run right

Press `W`, `Up Arrow` or `Spacebar` to jump

While running, press `S` or `Down Arrow` to slide

Press `E` or `Numpad 0` to attack

If arrows are equiped press and hold `F` or `Numpad 1` to draw bow and release to shoot.

Run over a health pack to regenerate health or a batch of arrows to add them to your inventory.

---

## Code Logic/Structure:

The `main.js` script file is the primary file through which the game is managed. It initiallizes the game and runs the main animation loop.

### Character Object Structure:
When the game is loaded the user is displayed with a play game button. When clicked the script makes a request to server for the first level which is sent to client. This data is parsed as JSON and used to construct the map background, obstiacles, player position and NPCs.

Each "character" (player and NPC) share the same base object with addition objects branching as needed.

The player is its own object

NPCs all share a second base NPC object with each NPC type getting their own object.

### World Objects:
Each "block" is a class object and fills and 24px x 24px space with an image. Each block When created blocks are given a set of parameters to determin collision rules and which image is to be place. An exmaple of these prarameters is: 4.te (4 = block all sides, te = image reference).

Blocks are place sequencially from bottom left to top right and the place in that order determins the blocks location (see World Builder section below).

### Physics
Characters with physics have a constant positive y velocity added every frame.

Collision is called by the character objects and loops through each block, detects if the player is colliding and if so stops the character. The system is base on position and size and so there is no slope support in the game.

---

## World Builder
NOTE: I have disabled the builder's ability to save changes for this demo.

I built a dev tool to more easily edit the main gameplay level. It can be found by navigating to `/build`

This tool allows me to easily paint blocks and place characters and inventory items.

It is controlled with key board shortcuts.

Typing a number will select the next block to be placed collision and typing the correct letters will determin which image is to be placed. (holding `space` and pressing `s` will add the indicator to an end block that a sprite is not to fall off the edge).

Clicking and draging will draw the block.

Pressing `q` will reset the block parameters and allow erasing.

Holding `a` and typing `i`, `s` or `g` will add an NPC to the top left corner which can then be dragged to the desired location.

Holding `i` and typing `h` or `a` will add and invetory item to the top left corner which can then be dragged to the desired location.

Pressing `p` will display the raw data to be saved to the server.

When displaying the raw data, pressing `s` will save the data.

Pressing `r` when viewing the raw data will allow for further editing.

---
## Sprite Flipper
An issue I was running into was flipping the character sprites when they moved in reverse. Programmatically flipping the sprite was too performance heavy so I wanted to create an additional sprite sheet for each but flipped. This was harder than expected because I couldn't just flip the whole image. I needed to flip each individual frame within the sprite sheet, otherwise my whole frame reference system would break. So I created a python program that flips sprite sheets for me. [You can view that program here](https://github.com/nr-johnson/flip-sprite).

---
## Known Bugs:
Sometimes, when shooting at imps, the arrow will miss. I *think* this is because the distance the arrow travels per frame is larger than the width of this imp, making it miss if shooting from a certain distance.

Game doesn't scale well when loaded onto smaller screens.

Background scrolling at the end of the game stops at different points depending on screen size (not in the way I want). I just ensured that overscrolls so it doesn't break the game.
