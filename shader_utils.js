function initWebGLContext(gl) {
    const shader_program = initShaderProgram(gl, calculation_vs, calculation_fs)

    // Create a buffer to put three 2d clip space points in
    var position_buffer = gl.createBuffer()
    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, position_buffer)
    // Set a rectangle the same size as the image.
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 1, 1]), gl.STATIC_DRAW)

    //initTexture()
    //initFrameBuffer()

    gl.useProgram(shader_program)

    var position_location = gl.getAttribLocation(shader_program, "a_position")
    gl.enableVertexAttribArray(position_location)
    gl.vertexAttribPointer(
        position_location, 2, gl.FLOAT, false, 0, 0);
    
    return shader_program
}

function initTexture() {
    texture = gl.createTexture();
    
    // Bind the texture so the following methods effect this texture.
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Pixel format and data for the texture
    gl.texImage2D(gl.TEXTURE_2D, // Target, matches bind above.
                    0,             // Level of detail.
                    gl.RGBA,       // Internal format.
                    screen_size,         // Width - related to s on textures.
                    screen_size,        // Height - related to t on textures.
                    0,             // Always 0 in OpenGL ES.
                    gl.RGBA,       // Format for each pixel.
                    gl.UNSIGNED_BYTE,          // Data type for each chanel.
                    null);         // Image data in the described format, or null.

    // Unbind the texture.
    gl.bindTexture(gl.TEXTURE_2D, null);

    out_texture = gl.createTexture();
    
    // Bind the texture so the following methods effect this texture.
    gl.bindTexture(gl.TEXTURE_2D, out_texture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

    // Pixel format and data for the texture
    gl.texImage2D(gl.TEXTURE_2D, // Target, matches bind above.
                    0,             // Level of detail.
                    gl.RGBA,       // Internal format.
                    screen_size,         // Width - related to s on textures.
                    screen_size,        // Height - related to t on textures.
                    0,             // Always 0 in OpenGL ES.
                    gl.RGBA,       // Format for each pixel.
                    gl.UNSIGNED_BYTE,          // Data type for each chanel.
                    null);         // Image data in the described format, or null.

    // Unbind the texture.
    gl.bindTexture(gl.TEXTURE_2D, null);
}

function initFrameBuffer() {
    frameBuffer = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer)

    gl.framebufferTexture2D(gl.FRAMEBUFFER,       // The target is always a FRAMEBUFFER.
        gl.COLOR_ATTACHMENT0, // We are providing the color buffer.
        gl.TEXTURE_2D,        // This is a 2D image texture.
    texture, 0)              // The texture.
}

function initShaderProgram(gl, vs_source, fs_source) {
    const vertex_shader = createShader(gl, gl.VERTEX_SHADER, vs_source)
    const fragment_shader = createShader(gl, gl.FRAGMENT_SHADER, fs_source)

    const shader_program = gl.createProgram()

    gl.attachShader(shader_program, vertex_shader)
    gl.attachShader(shader_program, fragment_shader)
    gl.linkProgram(shader_program)

    if (!gl.getProgramParameter(shader_program, gl.LINK_STATUS)) {
        console.log('Unable to initialize the shader program: ' + gl.getProgramInfoLog(shader_program))
        return null
    }
    
    return shader_program
}

function createShader(gl, type, source) {
    const shader = gl.createShader(type)

    gl.shaderSource(shader, source)
    gl.compileShader(shader)

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.log('An error occurred compiling the shaders: ' + gl.getShaderInfoLog(shader))
        gl.deleteShader(shader)

        return null
    }
    
    return shader
}

function check_frameBuffer (gl)
{
  var message;
  var status;

  status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);

  switch (status)
  {
    case gl.FRAMEBUFFER_COMPLETE:
      return;
    case gl.FRAMEBUFFER_UNSUPPORTED:
      message = "Framebuffer is unsupported";
      break;
    case gl.FRAMEBUFFER_INCOMPLETE_ATTACHMENT:
      message = "Framebuffer incomplete attachment";
      break;
    case gl.FRAMEBUFFER_INCOMPLETE_DIMENSIONS:
      message = "Framebuffer incomplete (missmatched) dimensions";
      break;
    case gl.FRAMEBUFFER_INCOMPLETE_MISSING_ATTACHMENT:
      message = "Framebuffer incomplete missing attachment";
      break;
    default:
      message = "Unexpected framebuffer status: " + status;
  }

  console.log(message);
};

function loadShaders() {
    $.ajax({url: 'calculation_frag.glsl', success: function(data) {
        calculation_fs = data
    }})

    $.ajax({url: 'calculation_vert.glsl', success: function(data) {
        calculation_vs = data
    }})
}