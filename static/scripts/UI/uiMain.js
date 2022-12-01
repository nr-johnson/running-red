import { canvas, player } from '/static/scripts/main.js'

const uiCanvas = document.getElementById('uiCanvas')

const ui = uiCanvas.getContext('2d')

export function renderUI() {
    uiCanvas.width = canvas.width
    uiCanvas.height = canvas.height

    

    ui.fillStyle = '#8e2424'
    ui.fillRect(40, 25, 200, 10)

    ui.fillStyle = '#186718'
    ui.fillRect(40, 25, player.health * 2, 10)
}