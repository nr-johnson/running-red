import { canvas, player } from '/static/scripts/main.js'

const uiCanvas = document.getElementById('uiCanvas')
const arrowIcon = new Image()
arrowIcon.src = '/static/images/objects/world/Arrow Icon.png'

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
    
    // for (let i = 0; i < player.arrowCount; i++) {
    //     ui.drawImage(arrowIcon, 30 + (10 * i), 40)
    // }
}