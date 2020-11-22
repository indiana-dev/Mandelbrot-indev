precision highp float;

// our texture
uniform float x_min, y_min, cam_size;
uniform vec2 xmin_d, ymin_d, camsize_d;
uniform int draw_method;
uniform int max_iterations;
uniform int smooth_draw;
uniform float t;

// the texCoords passed in from the vertex shader.
varying vec2 v_texCoord;

vec2 float2double(float v) {
    vec2 d;

    d.x = v;
    d.y = 0.;

    return d;
}

float double2float(vec2 d) {
    return d.x;
}

vec2 ds_add (vec2 dsa, vec2 dsb)
{
    vec2 dsc;
    float t1, t2, e;
    
    t1 = dsa.x + dsb.x;
    e = t1 - dsa.x;
    t2 = ((dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y + dsb.y;
    
    dsc.x = t1 + t2;
    dsc.y = t2 - (dsc.x - t1);
    return dsc;
}

vec2 ds_sub (vec2 dsa, vec2 dsb) {
    vec2 dsc;
    float e, t1, t2;

    t1 = dsa.x - dsb.x;
    e = t1 - dsa.x;
    t2 = ((0. - dsb.x - e) + (dsa.x - (t1 - e))) + dsa.y - dsb.y;

    dsc.x = t1 + t2;
    dsc.y = t2 - (dsc.x - t1);
    return dsc;
}

vec2 ds_mul (vec2 dsa, vec2 dsb)
{
    vec2 dsc;
    float c11, c21, c2, e, t1, t2;
    float a1, a2, b1, b2, cona, conb, split = 8193.;
    
    cona = dsa.x * split;
    conb = dsb.x * split;
    a1 = cona - (cona - dsa.x);
    b1 = conb - (conb - dsb.x);
    a2 = dsa.x - a1;
    b2 = dsb.x - b1;
    
    c11 = dsa.x * dsb.x;
    c21 = a2 * b2 + (a2 * b1 + (a1 * b2 + (a1 * b1 - c11)));
    
    c2 = dsa.x * dsb.y + dsa.y * dsb.x;
    
    t1 = c11 + c2;
    e = t1 - c11;
    t2 = dsa.y * dsb.y + ((c2 - e) + (c11 - (t1 - e))) + c21;
    
    dsc.x = t1 + t2;
    dsc.y = t2 - (dsc.x - t1);
    
    return dsc;
}

vec3 palette(float d) {
    float color_count = 4.;
    float color_range = 10.;
    float full_color_range = color_range * color_count;
    vec3 col1 = vec3(209./255., 252./255., 255./255.);
    vec3 col2 = vec3(255./255., 186./255., 48./255.);
    vec3 col3 = vec3(0., 0., 0.);
    vec3 col4 = vec3(43./255., 79./255., 255./255.);
    
    float a = mod(d, full_color_range) / full_color_range;
    float mix_value = mod(d, color_range) / color_range;

    if(a < 1./4.) {
        return mix(col1, col2, mix_value);
    } else if(a < 2./4.) {
        return mix(col2, col3, mix_value);
    } else if(a < 3./4.){
        return mix(col3, col4, mix_value);
    } else {
        return mix(col4, col1, mix_value);
    }
}

void main_32bits() {
    float x0 = v_texCoord.x * cam_size + x_min;
    float y0 = v_texCoord.y * cam_size + y_min;

    float x = 0., y = 0., x_prev = 0., y_prev = 0.;
    int iteration_count = 0;
    float in_set = 1.;

    for(int i = 0; i < 1000000; i++) {
        if(x*x+y*y > 100.) {
            in_set = 0.;
            break;
        }

        // x = 2(x+iy)+x0+y0i
        // 2x + 2iy + x0 + y0i
        // 2X + x0 + 2y+y0
        //x = x_prev * x_prev - y_prev * y_prev + x0;
        //y = 2. * x_prev * y_prev +cos(x_prev*t)+y_prev*t + y0;
        x = x_prev * x_prev - y_prev * y_prev + x0;
        y = 2. * x_prev * y_prev + y0;

        x_prev = x;
        y_prev = y;

        iteration_count++;

        if(iteration_count > max_iterations) {
            break;
        }
    }

    if(in_set == 0.) {
        in_set = float(iteration_count) / 100.;
    } else {
        in_set = 0.;
    }

    vec3 smooth_col;

    if(iteration_count < max_iterations) {
        float log_zn = log(x*x + y*y) / 2.;
        float nu = log(log_zn / log(2.)) / log(2.);
        float iter = float(iteration_count) + 1. - nu;
        vec3 col1 = palette(floor(iter));
        vec3 col2 = palette(floor(iter) + 1.);
        smooth_col = mix(col1, col2, mod(iter, 1.));
    } else {
        smooth_col = vec3(0.,0.,0.);
    }

    smooth_col = palette(float(iteration_count));
    gl_FragColor = vec4(smooth_col, 1.);

    // float iter_d = float(iteration_count);
    // float n1 = 256., n2 = 256. * 256.;

    // int d2 = int(floor(iter_d / n2));
    // iteration_count -= d2;
    // iter_d = float(iteration_count);
    // int d1 = int(floor(iter_d / n1));
    // int d0 = iteration_count - d1;
    
    //gl_FragColor = vec4(iter, 0., 0., 0.9);
}

void main_64bits() {
    vec2 texCoordX_d = float2double(v_texCoord.x);
    vec2 texCoordY_d = float2double(v_texCoord.y);
    vec2 x0_d = ds_add(ds_mul(texCoordX_d, camsize_d), xmin_d);
    vec2 y0_d = ds_add(ds_mul(texCoordY_d, camsize_d), ymin_d);
    vec2 x_d = float2double(0.);
    vec2 y_d = float2double(0.);
    vec2 xprev_d = float2double(0.);
    vec2 yprev_d = float2double(0.);
    vec2 two_d = float2double(2.);

    int iteration_count = 0;
    float in_set = 1.;

    for(int i = 0; i < 1000000; i++) {
        vec2 x2_d = ds_mul(xprev_d, xprev_d);
        vec2 y2_d = ds_mul(yprev_d, yprev_d);

        float d = double2float(ds_add(x2_d, y2_d));
        
        if(d > 4.) {
            in_set = 0.;
            break;
        }

        x_d = ds_add(ds_sub(x2_d, y2_d), x0_d);
        y_d = ds_add(ds_mul(two_d, ds_mul(xprev_d, yprev_d)), y0_d);

        xprev_d = x_d;
        yprev_d = y_d;

        iteration_count++;

        if(iteration_count > max_iterations) {
            break;
        }
    }

    if(in_set == 0.) {
        in_set = float(iteration_count) / 1000.;
    } else {
        in_set = 0.;
    }
    
    vec3 smooth_col;

    if(iteration_count < max_iterations) {
        float module = double2float(ds_add(ds_mul(x_d, x_d), ds_mul(y_d, y_d)));
        float log_zn = log(module) / 2.;
        float nu = log(log_zn / log(2.)) / log(2.);
        float iter = float(iteration_count) + 1. - nu;
        vec3 col1 = palette(floor(iter));
        vec3 col2 = palette(floor(iter) + 1.);
        smooth_col = mix(col1, col2, mod(iter, 1.));
    } else {
        smooth_col = vec3(0.,0.,0.);
    }

    gl_FragColor = vec4(smooth_col, 1.);
}

void main() {
    if(draw_method == 0) {
        main_32bits();
    } else {
        main_64bits();
    }
}