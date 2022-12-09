import { canvas, player, paused } from '/static/scripts/main.js'

const uiCanvas = document.getElementById('uiCanvas')
const uiImage = new Image()
uiImage.src = '/static/images/ui/Healthbar.png'

const largeMessageBoard = new Image()
largeMessageBoard.src = '/static/images/ui/UI Box_Large.png'
const smallMessageBoard = new Image()
smallMessageBoard.src = '/static/images/ui/UI Box_Small.png'

const ui = uiCanvas.getContext('2d')

export function renderUI() {
    ui.clearRect(0,0,canvas.width, canvas.height)

    uiCanvas.width = canvas.width
    uiCanvas.height = canvas.height    

    ui.fillStyle = '#8e2424'
    ui.fillRect(40, 25, 200, 10)

    ui.fillStyle = '#186718'
    ui.fillRect(40, 25, player.health * 2, 10)

    ui.fillStyle = '#ffda90'
    ui.fillRect(40, 45, 50, 25)

    ui.fillStyle = 'black'
    ui.font = "18px sans-serif";
    const count = player.arrowCount
    ui.fillText(count, count > 9 ? 65 : 70, 63);

    ui.drawImage(uiImage, 20, 21)
}

export function renderPause(canvas) {
    ui.drawImage(largeMessageBoard, 0, 0, canvas.width, canvas.height)
}

export function renderGameOver(canvas) {
    ui.drawImage(smallMessageBoard, -10, 0, canvas.width, canvas.height)
}