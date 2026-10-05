const canvas = document.getElementById('cloudCanvas');
const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');

if (!gl) {
    alert('WebGL not supported!');
    throw new Error('WebGL not supported');
}

// Vertex shader - simple quad
const vertexShaderSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            
            void main() {
                gl_Position = vec4(a_position, 0.0, 1.0);
                v_uv = (a_position + 1.0) * 0.5;
            }
        `;

// Fragment shader - cloud generation with noise and perspective
const fragmentShaderSource = `
            precision highp float;
            
            varying vec2 v_uv;
            uniform float u_time;
            uniform vec2 u_resolution;
            uniform float u_speed;
            uniform float u_density;
            uniform float u_scale;
            uniform float u_complexity;
            uniform float u_contrast;
            uniform float u_perspective;
            uniform float u_horizonLine;
            uniform float u_rotationAngle;
            uniform vec2 u_direction;
            
            // Color palette uniforms
            uniform vec3 u_color1;
            uniform vec3 u_color2;
            uniform vec3 u_color3;
            uniform vec3 u_color4;
            uniform vec3 u_color5;
            uniform vec3 u_bgColor1;
            uniform vec3 u_bgColor2;
            
            // Simplex noise functions
            vec3 mod289(vec3 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec2 mod289(vec2 x) {
                return x - floor(x * (1.0 / 289.0)) * 289.0;
            }
            
            vec3 permute(vec3 x) {
                return mod289(((x*34.0)+1.0)*x);
            }
            
            float snoise(vec2 v) {
                const vec4 C = vec4(0.211324865405187,  // (3.0-sqrt(3.0))/6.0
                                    0.366025403784439,  // 0.5*(sqrt(3.0)-1.0)
                                   -0.577350269189626,  // -1.0 + 2.0 * C.x
                                    0.024390243902439); // 1.0 / 41.0
                
                vec2 i  = floor(v + dot(v, C.yy));
                vec2 x0 = v - i + dot(i, C.xx);
                
                vec2 i1;
                i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
                
                vec4 x12 = x0.xyxy + C.xxzz;
                x12.xy -= i1;
                
                i = mod289(i);
                vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0))
                        + i.x + vec3(0.0, i1.x, 1.0));
                
                vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
                m = m*m;
                m = m*m;
                
                vec3 x = 2.0 * fract(p * C.www) - 1.0;
                vec3 h = abs(x) - 0.5;
                vec3 ox = floor(x + 0.5);
                vec3 a0 = x - ox;
                
                m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
                
                vec3 g;
                g.x  = a0.x  * x0.x  + h.x  * x0.y;
                g.yz = a0.yz * x12.xz + h.yz * x12.yw;
                return 130.0 * dot(m, g);
            }
            
            // Rotation matrix
            mat2 rotate2D(float angle) {
                float s = sin(angle);
                float c = cos(angle);
                return mat2(c, -s, s, c);
            }
            
            // Fractal Brownian Motion with rotation
            float fbm(vec2 p, float time, int octaves) {
                float value = 0.0;
                float amplitude = 0.5;
                float frequency = 1.0;
                float maxValue = 0.0;
                
                // Apply rotation
                mat2 rot = rotate2D(u_rotationAngle);
                
                for(int i = 0; i < 6; i++) {
                    if(i >= octaves) break;
                    
                    vec2 movement = vec2(time * u_direction.x * 0.02, time * u_direction.y * 0.02);
                    vec2 rotatedP = rot * p;
                    value += snoise(rotatedP * frequency + movement) * amplitude;
                    maxValue += amplitude;
                    amplitude *= 0.5;
                    frequency *= 2.0;
                }
                
                return value / maxValue;
            }
            
            // Color palette interpolation
            vec3 getCloudColor(float noise, float height) {
                // Mix colors based on noise
                float t = (noise + 1.0) * 0.5;
                vec3 color;
                
                if(t < 0.25) {
                    color = mix(u_color1, u_color2, t * 4.0);
                } else if(t < 0.5) {
                    color = mix(u_color2, u_color3, (t - 0.25) * 4.0);
                } else if(t < 0.75) {
                    color = mix(u_color3, u_color4, (t - 0.5) * 4.0);
                } else {
                    color = mix(u_color4, u_color5, (t - 0.75) * 4.0);
                }
                
                // Add vertical gradient
                float verticalGradient = 1.0 - height * 0.4;
                color *= verticalGradient;
                
                // Add white highlights for bright areas
                float highlight = max(0.0, noise - 0.3);
                color = mix(color, vec3(1.0), highlight * 0.5);
                
                return color;
            }
            
            void main() {
                vec2 uv = v_uv;
                
                // Apply perspective transformation
                float perspectiveFactor = 1.0;
                if(u_perspective > 0.0) {
                    // Calculate distance from horizon line
                    float distFromHorizon = abs(uv.y - u_horizonLine);
                    
                    // Apply perspective scaling - clouds get smaller toward horizon
                    // Top clouds (y=1) are closest, bottom clouds (y=0) are farthest
                    if(uv.y > u_horizonLine) {
                        // Above horizon - closer clouds
                        perspectiveFactor = 1.0 + (uv.y - u_horizonLine) * u_perspective * 2.0;
                    } else {
                        // Below horizon - farther clouds
                        perspectiveFactor = 1.0 - (u_horizonLine - uv.y) * u_perspective;
                    }
                    perspectiveFactor = max(0.1, perspectiveFactor);
                }
                
                // Apply perspective to coordinate scaling
                vec2 coord = uv * u_scale / perspectiveFactor;
                
                // Add perspective-based X distortion for more realistic effect
                if(u_perspective > 0.0) {
                    float xDistortion = (uv.x - 0.5) * (1.0 - uv.y) * u_perspective;
                    coord.x += xDistortion;
                }
                
                // Create multiple cloud layers
                float time = u_time * u_speed * 0.001;
                
                // Primary cloud layer with perspective-adjusted speed
                float speedMod = perspectiveFactor;
                float noise1 = fbm(coord + vec2(time * speedMod, 0.0), time, int(u_complexity));
                
                // Secondary layer moving differently
                float noise2 = fbm(coord * 1.5 - vec2(time * speedMod * 0.6, 0.0), time * 1.2, int(u_complexity));
                
                // Combine layers
                float cloudNoise = (noise1 * 0.7 + noise2 * 0.3);
                
                // Apply contrast
                cloudNoise = pow((cloudNoise + 1.0) * 0.5, u_contrast) * 2.0 - 1.0;
                
                // Adjust density based on perspective (distant clouds appear thinner)
                float adjustedDensity = u_density + (1.0 - perspectiveFactor) * 0.2;
                
                // Create cloud threshold
                float cloudAlpha = smoothstep(adjustedDensity - 0.2, adjustedDensity + 0.2, cloudNoise);
                
                // Reduce opacity for distant clouds
                cloudAlpha *= 0.4 + perspectiveFactor * 0.6;
                
                // Get cloud color
                vec3 cloudColor = getCloudColor(cloudNoise, uv.y);
                
                // Background gradient
                vec3 background = mix(u_bgColor2, u_bgColor1, uv.y);
                
                // Mix clouds with background
                vec3 finalColor = mix(background, cloudColor, cloudAlpha * 0.7);
                
                // Add atmospheric haze for distant clouds
                if(u_perspective > 0.0) {
                    float hazeFactor = (1.0 - perspectiveFactor) * 0.3;
                    finalColor = mix(finalColor, background, hazeFactor);
                }
                
                // Add subtle glow
                float glow = length(uv - 0.5);
                finalColor += vec3(0.05, 0.05, 0.1) * (1.0 - glow);
                
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

// Shader compilation helper
function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        console.error('Shader compile error:', gl.getShaderInfoLog(shader));
        gl.deleteShader(shader);
        return null;
    }

    return shader;
}

// Create shaders and program
const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    console.error('Program link error:', gl.getProgramInfoLog(program));
}

// Set up geometry (full screen quad)
const vertices = new Float32Array([
    -1, -1,
    1, -1,
    -1, 1,
    1, 1,
]);

const buffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

const positionLocation = gl.getAttribLocation(program, 'a_position');
gl.enableVertexAttribArray(positionLocation);
gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

// Get uniform locations
const uniforms = {
    time: gl.getUniformLocation(program, 'u_time'),
    resolution: gl.getUniformLocation(program, 'u_resolution'),
    speed: gl.getUniformLocation(program, 'u_speed'),
    density: gl.getUniformLocation(program, 'u_density'),
    scale: gl.getUniformLocation(program, 'u_scale'),
    complexity: gl.getUniformLocation(program, 'u_complexity'),
    contrast: gl.getUniformLocation(program, 'u_contrast'),
    perspective: gl.getUniformLocation(program, 'u_perspective'),
    horizonLine: gl.getUniformLocation(program, 'u_horizonLine'),
    rotationAngle: gl.getUniformLocation(program, 'u_rotationAngle'),
    direction: gl.getUniformLocation(program, 'u_direction'),
    color1: gl.getUniformLocation(program, 'u_color1'),
    color2: gl.getUniformLocation(program, 'u_color2'),
    color3: gl.getUniformLocation(program, 'u_color3'),
    color4: gl.getUniformLocation(program, 'u_color4'),
    color5: gl.getUniformLocation(program, 'u_color5'),
    bgColor1: gl.getUniformLocation(program, 'u_bgColor1'),
    bgColor2: gl.getUniformLocation(program, 'u_bgColor2')
};

// Helper function to convert hex to RGB
function hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? [
        parseInt(result[1], 16) / 255,
        parseInt(result[2], 16) / 255,
        parseInt(result[3], 16) / 255
    ] : null;
}

// Fixed settings based on the provided images
const settings = {
    speed: 0.2,
    density: 0.80,
    scale: 4.5,
    complexity: 2,
    contrast: 0.5,
    perspective: 0.1,
    horizonLine: 0.90,
    rotationAngle: 65 * Math.PI / 180, // Convert degrees to radians
    xDirection: -1.7,
    yDirection: -0.5,
    colors: {
        color1: hexToRgb('#d7e0f9'),
        color2: hexToRgb('#dee5f7'),
        color3: hexToRgb('#4775ff'),
        color4: hexToRgb('#6bb6ff'),
        color5: hexToRgb('#acbff9'),
        bgColor1: hexToRgb('#0041ab'),
        bgColor2: hexToRgb('#5c7ddc')
    }
};

// Resize handling
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    gl.viewport(0, 0, canvas.width, canvas.height);
}

resize();
window.addEventListener('resize', resize);

// Animation loop
function render(time) {
    gl.useProgram(program);

    // Set uniforms
    gl.uniform1f(uniforms.time, time);
    gl.uniform2f(uniforms.resolution, canvas.width, canvas.height);
    gl.uniform1f(uniforms.speed, settings.speed);
    gl.uniform1f(uniforms.density, settings.density);
    gl.uniform1f(uniforms.scale, settings.scale);
    gl.uniform1f(uniforms.complexity, settings.complexity);
    gl.uniform1f(uniforms.contrast, settings.contrast);
    gl.uniform1f(uniforms.perspective, settings.perspective);
    gl.uniform1f(uniforms.horizonLine, settings.horizonLine);
    gl.uniform1f(uniforms.rotationAngle, settings.rotationAngle);
    gl.uniform2f(uniforms.direction, settings.xDirection, settings.yDirection);

    // Set color uniforms
    gl.uniform3fv(uniforms.color1, settings.colors.color1);
    gl.uniform3fv(uniforms.color2, settings.colors.color2);
    gl.uniform3fv(uniforms.color3, settings.colors.color3);
    gl.uniform3fv(uniforms.color4, settings.colors.color4);
    gl.uniform3fv(uniforms.color5, settings.colors.color5);
    gl.uniform3fv(uniforms.bgColor1, settings.colors.bgColor1);
    gl.uniform3fv(uniforms.bgColor2, settings.colors.bgColor2);

    // Draw
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

    requestAnimationFrame(render);
}

render(0);