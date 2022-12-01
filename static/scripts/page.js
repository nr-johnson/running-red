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