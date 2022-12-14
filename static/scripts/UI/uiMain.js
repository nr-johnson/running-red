/*
    This script is in charge of rendering the UI elements of the game.

    its functions are called by the main script file
*/

// Import needed
import { canvas, player } from '/static/scripts/main.js'

// Main ui canvas dom element
const uiCanvas = document.getElementById('uiCanvas')

// Image used for the healthbar and arrow inventory
const uiImage = new Image()
uiImage.src = '/static/images/ui/Healthbar.png'

// Images for message boards that are presented to the user
const largeMessageBoard = new Image()
largeMessageBoard.src = '/static/images/ui/UI Box_Large.png'
const smallMessageBoard = new Image()
smallMessageBoard.src = '/static/images/ui/UI Box_Small.png'

// ui canvas context
const ui = uiCanvas.getContext('2d')

// Renders the UI. Called each frame
export function renderUI() {
    // Clears the previous frame
    ui.clearRect(0,0,canvas.width, canvas.height)

    // Sets width
    uiCanvas.width = canvas.width
    uiCanvas.height = canvas.height    

    // Back of the healthbar (red to clearly indicate lack of health)
    ui.fillStyle = '#8e2424'
    ui.fillRect(40, 25, 200, 10)

    // Front of healthbar. bar will be filled with green showing the percentage of remaining health
    ui.fillStyle = '#186718'
    ui.fillRect(40, 25, player.health * 2, 10)

    // Arrow invetory backdrop
    ui.fillStyle = '#ffda90'
    ui.fillRect(40, 45, 50, 25)

    // Arrow inventory count
    ui.fillStyle = 'black'
    ui.font = "18px sans-serif";
    const count = player.arrowCount
    ui.fillText(count, count > 9 ? 65 : 70, 63);

    // Main ui healthbar and arrow inventory image
    ui.drawImage(uiImage, 20, 21)
}

// Renders the pause menu message board
export function renderPause(canvas) {
    ui.drawImage(largeMessageBoard, 0, 0, canvas.width, canvas.height)
}

// Renders the endgame message board
export function renderGameOver(canvas) {
    ui.drawImage(smallMessageBoard, -10, 0, canvas.width, canvas.height)
}