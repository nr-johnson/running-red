import { canvas, player } from '/static/scripts/main.js'

const uiCanvas = document.getElementById('uiCanvas')

const ui = uiCanvas.getContext('2d')

export function renderUI() {
    uiCanvas.width = canvas.width
    uiCanvas.height = canvas.height

    

    ui.fillStyle = player.health > 0 ? '#777' : 'red'
    ui.fillRect(40, 20, 200, 20)

    ui.fillStyle = 'green'
    ui.fillRect(40, 20, player.health * 2, 20)

    ui.fillStyle = 'white'
    ui.fillRect(40, 20, 200, 1)
    ui.fillRect(40, 40, 200, 1)
    ui.fillRect(40, 20, 1, 20)
    ui.fillRect(240, 20, 1, 20)
}