// Creates a new image object for the canvas to draw
export function newImage(src) {
    return new Promise(resolve => {
        const img = new Image()
        img.src = src
        img.addEventListener('load', () => {
            resolve(img)
        })
    })
}

// Resizes the canvas when window is resized
export function sizeWindow(canvas) {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    // Sets variables to current window size.
    return {
        y: window.innerHeight,
        x: window.innerWidth
    }
}

export function isWithin(frame, from, to) {
    frame = frameValue(frame)
    from = frameValue(from)
    to = frameValue(to) 
    
    if(frame >= from && frame < to) {
        return true
    } else {
        return false
    }
}

function frameValue(frame) {
    let val = frame[0]


    if (frame[1] > 9) {
        val = parseFloat(val + '.9' + ((frame[1] % 10) + 1))
    } else {
        val = parseFloat(frame.join('.'))
    }
    
    return val
}