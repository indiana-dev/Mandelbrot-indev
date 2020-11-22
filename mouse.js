class Mouse {
    constructor() {
        this.pressed = false
        this.quick_zoom = false
        this.press_time = 0
        this.right_click = false
    }

    onClick(x, y, right_click) {
        this.pressed = true
        this.x = x
        this.y = y
        this.right_click = right_click
        this.press_time = new Date().getTime()
        this.quick_zoom = false
    }

    onDrag(x, y) {
        this.x = x
        this.y = y
    }

    onHold() {
        let move_x = (this.x / screen_size - 0.5)
        let move_y = (this.y / screen_size - 0.5)

        let zoom_intensity = this.quick_zoom ? 0.05 : 0.01

        let new_x = cam.x + cam.size * move_x / 10
        let new_y = cam.y + cam.size * move_y / 10
        let new_size = cam.size * (1 + zoom_intensity * (this.right_click ? 1 : -1))

        cam.update(new_x, new_y, new_size)
    }

    screenToCameraCoordinates(x, y) {
        let new_x = (x / screen_size) * cam.size + cam.x_min
        let new_y = ((screen_size - y) / screen_size) * cam.size + cam.y_min

        return {x: new_x, y: new_y}
    }

    onRelease() {
        this.pressed = false
    }
}

window.oncontextmenu = function(event) {
    event.preventDefault()
}

window.onmousedown = function(event) {
    let last_mouse_press = mouse.press_time

    mouse.onClick(event.clientX, event.clientY, event.which == 3)

    if(new Date().getTime() - last_mouse_press < 500) {
        mouse.quick_zoom = true
    } 
}

window.onmousemove = function(event) {
    if(mouse.pressed) {
        mouse.onDrag(event.clientX, event.clientY)
    }
}

window.onmouseup = function(event) {
    mouse.onRelease(event.clientX, event.clientY)
}