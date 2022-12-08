/*
    This script manages the banner message above the game window.
    It was created with the potential for more functionality but the banner was all that was needed
*/

export function showMessage(msg) {
    const banner = document.getElementById('gameBanner')
    const p = document.createElement('p')
    banner.innerHTML = ''

    p.textContent = msg
    banner.append(p)

    banner.classList.add('show')
}

export function clearMessage() {
    const banner = document.getElementById('gameBanner')
    banner.classList.remove('show')
}