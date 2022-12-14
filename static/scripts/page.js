/*
    This script manages the banner message above the game window.
    It was created with the potential for more functionality but the banner was all that was needed
*/

// Function to toggle banner. Called when needed from other script files
export function showMessage(msg) {
    // Banner dom element
    const banner = document.getElementById('gameBanner')
    // Create html paragraph element
    const p = document.createElement('p')
    // Reset banner innerhtml
    banner.innerHTML = ''

    // Sets new inner html of banner
    p.textContent = msg
    banner.append(p)
    // Show banner
    banner.classList.add('show')
}

// Hides banner. Called as needed from other script files
export function clearMessage() {
    const banner = document.getElementById('gameBanner')
    banner.classList.remove('show')
}