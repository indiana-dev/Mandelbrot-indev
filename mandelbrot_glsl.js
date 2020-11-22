const gpu = new GPU()//{ mode: 'cpu' })

window.onload = waitForShadersToInitialize

let redraw = false
let draw_method = 0
let max_iterations = 500
let shaders_loaded = false
let smooth_draw = 0

let calculation_fs = null
let calculation_vs = null
loadShaders()

class Camera {
    constructor() {
        this.update(0, 0, 6)
    }

    update(x, y, size) {
        this.x = x
        this.y = y
        this.size = size
        this.x_min = this.x - this.size / 2
        this.y_min = this.y - this.size / 2

        redraw = true
    }
}

let cam = new Camera()
let mouse = new Mouse()
let gl, screen_size, uniforms, buffer

function waitForShadersToInitialize() {
    if(calculation_fs == null || calculation_vs == null) {
        requestAnimationFrame(waitForShadersToInitialize)
    } else {
        main()
    }
}

function main() {
    screen_size = 500 // innerHeight

    initKernel()

    const canvas = document.querySelector("#glCanvas")
    canvas.width = canvas.height = screen_size
    gl = canvas.getContext("webgl2")

    if (gl === null) {
        console.log("Unable to initialize WebGL. Your browser or machine may not support it.")
        return
    }

    const shader_program = initWebGLContext(gl)

    initUniforms(gl, shader_program)  

    //buffer = new Uint8Array(4 * screen_size * screen_size)

    loop()
}

function initKernel() {
    // test_kernel = gpu.createKernel(function(data, screen_size, iteration_pixel_count, total, max_iteration) {
    //     let index = (this.thread.y * screen_size + this.thread.x) * 4
    //     let iteration = data[index+3] //+ data[index+1] * 256 + data[index+2] * 256*256
    //     let hue = 0

    //     for(let i = 0; i < iteration - 1; i++) {
    //         // if(i >= max_iteration) {
    //         //     debugger
    //         // }
    //         hue += iteration_pixel_count[i]
    //     }

    //     hue /= total

    //     //return hue

    //     this.color(hue*2.7%1,hue*1.7%1,hue*2.87%1,1)
    //     //this.color(data[index]/255, data[index+1]/255, data[index+2]/255, 1)
    // }, {output: [screen_size, screen_size], graphical: true})
    //   //.setGraphical(true)
}

function initUniforms(gl, shader_program) {
    uniforms = []

    uniforms.draw_method = gl.getUniformLocation(shader_program, "draw_method")
    uniforms.max_iterations = gl.getUniformLocation(shader_program, "max_iterations")
    uniforms.smooth_draw = gl.getUniformLocation(shader_program, "smooth_draw")
    uniforms.time = gl.getUniformLocation(shader_program, "t");

    uniforms.x_min = gl.getUniformLocation(shader_program, "x_min")
    uniforms.y_min = gl.getUniformLocation(shader_program, "y_min")
    uniforms.cam_size = gl.getUniformLocation(shader_program, "cam_size")

    uniforms.xmin_d = gl.getUniformLocation(shader_program, "xmin_d")
    uniforms.ymin_d = gl.getUniformLocation(shader_program, "ymin_d")
    uniforms.camsize_d = gl.getUniformLocation(shader_program, "camsize_d")
}

let t = 0.;
function setUniforms() {
    gl.uniform1i(uniforms.draw_method, draw_method)
    gl.uniform1i(uniforms.max_iterations, max_iterations)
    gl.uniform1i(uniforms.smooth_draw, smooth_draw)

    gl.uniform1f(uniforms.x_min, cam.x_min)
    gl.uniform1f(uniforms.y_min, cam.y_min)
    gl.uniform1f(uniforms.cam_size, cam.size)
    gl.uniform1f(uniforms.time, t);

    let xmin_d = float2double(cam.x_min)
    gl.uniform2f(uniforms.xmin_d, xmin_d.x, xmin_d.y)

    let ymin_d = float2double(cam.y_min)
    gl.uniform2f(uniforms.ymin_d, ymin_d.x, ymin_d.y)

    let camsize_d = float2double(cam.size)
    gl.uniform2f(uniforms.camsize_d, camsize_d.x, camsize_d.y)
}

function float2double(d) {
    let a = Math.fround(d)
    let b = d - a

    return {x: a, y: b}
}

function loop() {
    if(mouse.pressed) {
        mouse.onHold()
    }

    if(cam.size < 0.000025 && draw_method == 0) {
        switch_to_64bits()
    }

    draw()
     
    window.requestAnimationFrame(loop)
}

function draw() {
    setUniforms()
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    t+=0.0001;
    
    // gl.readPixels(0,       // x-coord of lower left corner
    //                 0,       // y-coord of lower left corner
    //                 screen_size,       // width of the block
    //                 screen_size,       // height of the block
    //                 gl.RGBA, // Format of pixel data.
    //                 gl.UNSIGNED_BYTE,// Data type of the pixel data, must match makeTexture
    //                 buffer); // Load pixel data into buff
    
    // gl.bindTexture(gl.TEXTURE_2D, out_texture)                 // Pixel format and data for the texture
    // gl.texImage2D(gl.TEXTURE_2D, // Target, matches bind above.
    //     0,             // Level of detail.
    //     gl.RGBA,       // Internal format.
    //     screen_size,         // Width - related to s on textures.
    //     screen_size,        // Height - related to t on textures.
    //     0,             // Always 0 in OpenGL ES.
    //     gl.RGBA,       // Format for each pixel.
    //     gl.UNSIGNED_BYTE,          // Data type for each chanel.
    //     buffer);         // Image data in the described format, or null.

    // let iteration_pixel_count = new Array(max_iterations).fill(0)
    // let total = Math.floor(buffer.length / 4)

    // for(let i = 0; i < buffer.length; i+=4) {
    //     let n = buffer[i] + buffer[i+1] * n1 + buffer[i+2] * n2
    //     buffer[i+3] = n;
    //     iteration_pixel_count[n]++
    // }
    
    // gl.uniform1i(uniforms.current_pass, 1)
    // gl.uniform1i(uniforms.pixels, out_texture)

    // gl.bindFramebuffer(gl.FRAMEBUFFER, null)

    // gl.drawArrays(gl.TRIANGLES, 0, 6)
    // gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)
    
    // test_kernel(buffer, screen_size, iteration_pixel_count, total, max_iterations)

    // let draw_canvas = test_kernel.canvas
    // document.getElementsByTagName('body')[0].appendChild(draw_canvas);
}

function switch_to_64bits() {
    draw_method = 1
    setMaximumIterations(1000)
}

function setMaximumIterations(max) {
    console.log('switch!')
    max_iterations = max
    //initKernel()
}