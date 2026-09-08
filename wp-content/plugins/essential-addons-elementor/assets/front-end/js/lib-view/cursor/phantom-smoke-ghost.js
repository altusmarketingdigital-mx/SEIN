/**
 * PhantomSmokeGhost - A reusable ghost cursor trail effect library
 * Can be applied to any HTML element using CSS selectors
 * Uses a singleton canvas approach to prevent multiple canvas conflicts
 */

/**
 * Utility function to convert hexadecimal color strings to RGB arrays
 * @param {string|Array} color - Hex color string (e.g., '#FF5733') or RGB array
 * @returns {Array} RGB array with normalized values [0-1, 0-1, 0-1]
 */
function PhantomSmokeGhostHexToRgb(color) {
    // If already an array, return as-is (backward compatibility)
    if (Array.isArray(color)) {
        return color;
    }
    // If not a string or is null/undefined, return default color
    if (typeof color !== 'string' || color === null || color === undefined || !color) {
        console.warn('PhantomSmokeGhost: Invalid color format, using default. Received:', color);
        return [0.98, 0.96, 0.96];
    }

    // Remove # if present
    const hex = color.replace('#', '');

    // Handle different hex formats
    let fullHex;
    if (hex.length === 3) {
        // 3-digit hex (e.g., #F5A -> #FF55AA)
        fullHex = hex.split('').map(char => char + char).join('');
    } else if (hex.length === 6) {
        // 6-digit hex (e.g., #FF55AA)
        fullHex = hex;
    } else if (hex.length === 8) {
        // 8-digit hex with alpha (e.g., #FF55AAFF) - ignore alpha channel
        fullHex = hex.substring(0, 6);
        console.log(`PhantomSmokeGhost: Using 8-digit hex "${color}", ignoring alpha channel`);
    } else {
        console.warn(`PhantomSmokeGhost: Invalid hex color length "${color}", using default`);
        return [0.98, 0.96, 0.96];
    }

    // Validate hex format (6 digits)
    if (!/^[0-9A-Fa-f]{6}$/.test(fullHex)) {
        console.warn(`PhantomSmokeGhost: Invalid hex color "${color}", using default`);
        return [0.98, 0.96, 0.96];
    }

    // Convert to RGB and normalize to 0-1 range
    const r = parseInt(fullHex.substring(0, 2), 16) / 255;
    const g = parseInt(fullHex.substring(2, 4), 16) / 255;
    const b = parseInt(fullHex.substring(4, 6), 16) / 255;

    return [r, g, b];
}

class PhantomSmokeGhost {
    constructor(selector, options = {}) {
        this.targetElement = typeof selector === 'string' ? document.querySelector(selector) : selector;

        if (!this.targetElement) {
            console.error('PhantomSmokeGhost: Target element not found');
            return;
        }
    
        let trailID = options.id ||  Math.random().toString(36).substring(2, 11);
        // Generate unique ID for this instance
        this.instanceId = trailID;

        // Create individual canvas for this instance
        this.canvasEl = this.createCanvas();

        // Track if mouse is over target element
        this.isMouseOverTarget = false;

        this.mouseThreshold = .1;
        this.devicePixelRatio = Math.min(window.devicePixelRatio, 2);

        // Initialize mouse position with safe defaults
        const safeWidth = window.innerWidth || 800;
        const safeHeight = window.innerHeight || 600;

        this.mouse = {
            x: .25 * safeWidth,
            y: .8 * safeHeight,
            tX: .25 * safeWidth,
            tY: .8 * safeHeight,
            moving: false,
            controlsPadding: 0
        };

        // Default parameters with user options override
        this.params = {
            size: .1,
            tail: {
                dotsNumber: 25,
                spring: 1.4,
                friction: .3,
                gravity: 0,
            },
            smile: 1,
            mainColor: [.98, .96, .96],
            borderColor: [.2, .5, .7],

            ...options
        };

        // Convert hex colors to RGB arrays if needed
        this.params.mainColor = PhantomSmokeGhostHexToRgb(this.params.mainColor);
        this.params.borderColor = PhantomSmokeGhostHexToRgb(this.params.borderColor);

        this.textureEl = document.createElement('canvas');
        this.textureCtx = this.textureEl.getContext("2d");
        this.pointerTrail = new Array(this.params.tail.dotsNumber);

        // Safe dotSize calculation with validation
        this.dotSize = (i) => {
            const safeHeight = window.innerHeight || 600;
            const safeSize = isFinite(this.params.size) && this.params.size > 0 ? this.params.size : 0.1;
            const safeDotsNumber = this.params.tail.dotsNumber > 0 ? this.params.tail.dotsNumber : 25;
            const calculation = safeSize * safeHeight * (1. - .2 * Math.pow(3. * i / safeDotsNumber - 1., 2.));
            return isFinite(calculation) && calculation > 0 ? calculation : 10; // fallback to 10px
        };

        for (let i = 0; i < this.params.tail.dotsNumber; i++) {
            const opacity = .04 + .3 * Math.pow(1 - i / this.params.tail.dotsNumber, 4);
            const bordered = .6 * Math.pow(1 - i / this.params.tail.dotsNumber, 1);

            this.pointerTrail[i] = {
                x: this.mouse.x,
                y: this.mouse.y,
                vx: 0,
                vy: 0,
                opacity: isFinite(opacity) ? opacity : 0.1,
                bordered: isFinite(bordered) ? bordered : 0.6,
                r: this.dotSize(i)
            };
        }

        this.uniforms = null;
        this.gl = this.initShader();
        this.movingTimer = null;
        this.isRunning = false;
        this.animationId = null;
        this.fadeTimeout = null;

        this.init();
    }

    createCanvas() {
        const canvas = document.createElement('canvas');
        canvas.id = `phantom-smoke-ghost-${this.instanceId}`;
        canvas.style.position = 'fixed';
        canvas.style.top = '0';
        canvas.style.left = '0';
        canvas.style.width = '100vw';
        canvas.style.height = '100vh';
        canvas.style.pointerEvents = 'none';
        canvas.style.zIndex = '999999999';
        canvas.style.opacity = '0';
        canvas.style.transition = 'opacity 400ms ease-in-out';
        canvas.style.display = 'none';
        document.body.appendChild(canvas);
        return canvas;
    }

    init() {
        // Bind event listeners
        this.boundResizeCanvas = this.resizeCanvas.bind(this);
        this.boundMouseMove = (e) => {
            if (this.isMouseOverTarget) {
                this.updateMousePosition(e.clientX, e.clientY);
            }
        };
        this.boundTouchMove = this.handleTouchMove.bind(this);
        this.boundClick = (e) => {
            if (this.isMouseOverTarget) {
                this.updateMousePosition(e.clientX, e.clientY);
            }
        };
        this.boundMouseEnter = this.handleMouseEnter.bind(this);
        this.boundMouseLeave = this.handleMouseLeave.bind(this);

        window.addEventListener("resize", this.boundResizeCanvas);

        // Add element-specific mouse tracking
        this.targetElement.addEventListener("mouseenter", this.boundMouseEnter);
        this.targetElement.addEventListener("mouseleave", this.boundMouseLeave);

        this.resizeCanvas();

        // Don't start automatically - let user control with start/stop methods
        // this.start();
    }

    handleTouchMove(e) {
        if (e.targetTouches && e.targetTouches[0] && this.isMouseOverTarget) {
            const t = e.targetTouches[0];
            this.updateMousePosition(t.clientX, t.clientY);
        }
    }

    handleMouseEnter() {
        this.isMouseOverTarget = true;
        this.start();
    }

    handleMouseLeave() {
        this.isMouseOverTarget = false;
        this.stop();
    }

    // Start the ghost trail effect
    start() {
        if (this.isRunning) return;

        this.isRunning = true;

        // Clear any pending fade timeout
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }

        // Show this instance's canvas
        this.canvasEl.style.display = 'block';
        this.canvasEl.offsetHeight; // Force reflow
        this.canvasEl.style.opacity = '1';

        // Add event listeners
        window.addEventListener("mousemove", this.boundMouseMove);
        window.addEventListener("touchmove", this.boundTouchMove);
        window.addEventListener("click", this.boundClick);

        // Start render loop
        this.render();

        this.movingTimer = setTimeout(() => this.mouse.moving = false, 300);
    }

    // Stop the ghost trail effect
    stop() {
        if (!this.isRunning) return;

        this.isRunning = false;

        // Remove event listeners
        window.removeEventListener("mousemove", this.boundMouseMove);
        window.removeEventListener("touchmove", this.boundTouchMove);
        window.removeEventListener("click", this.boundClick);

        // Hide this instance's canvas
        this.canvasEl.style.opacity = '0';
        this.fadeTimeout = setTimeout(() => {
            if (!this.isRunning) {
                this.canvasEl.style.display = 'none';
            }
        }, 450);

        // Cancel animation frame
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }

        // Clear timer
        if (this.movingTimer) {
            clearTimeout(this.movingTimer);
            this.movingTimer = null;
        }
    }

    updateMousePosition(eX, eY) {
        // Validate input coordinates
        const safeX = isFinite(eX) ? eX : this.mouse.tX;
        const safeY = isFinite(eY) ? eY : this.mouse.tY;

        this.mouse.moving = true;
        if (this.mouse.controlsPadding < 0) {
            this.mouse.moving = false;
        }
        clearTimeout(this.movingTimer);
        this.movingTimer = setTimeout(() => {
            this.mouse.moving = false;
        }, 300);

        this.mouse.tX = safeX;

        const safeHeight = window.innerHeight || 600;
        const safeSize = isFinite(this.params.size) ? this.params.size : 0.1;
        const size = safeSize * safeHeight;
        const adjustedY = safeY - .6 * size;
        this.mouse.tY = adjustedY > size ? adjustedY : size;
        this.mouse.tY -= this.mouse.controlsPadding;
    }

    vertShader() {
        return `
        precision mediump float;

        varying vec2 vUv;
        attribute vec2 a_position;

        void main() {
            vUv = .5 * (a_position + 1.);
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
        `;
    }

    fragShader() {
        return `
        precision mediump float;

        varying vec2 vUv;
        uniform float u_time;
        uniform float u_ratio;
        uniform float u_size;
        uniform vec2 u_pointer;
        uniform float u_smile;
        uniform vec2 u_target_pointer;
        uniform vec3 u_main_color;
        uniform vec3 u_border_color;

        uniform sampler2D u_texture;

        #define TWO_PI 6.28318530718
        #define PI 3.14159265358979323846

        vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
        vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }
        float snoise(vec2 v) {
            const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
            vec2 i = floor(v + dot(v, C.yy));
            vec2 x0 = v - i + dot(i, C.xx);
            vec2 i1;
            i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
            vec4 x12 = x0.xyxy + C.xxzz;
            x12.xy -= i1;
            i = mod289(i);
            vec3 p = permute(permute(i.y + vec3(0.0, i1.y, 1.0)) + i.x + vec3(0.0, i1.x, 1.0));
            vec3 m = max(0.5 - vec3(dot(x0, x0), dot(x12.xy, x12.xy), dot(x12.zw, x12.zw)), 0.0);
            m = m*m;
            m = m*m;
            vec3 x = 2.0 * fract(p * C.www) - 1.0;
            vec3 h = abs(x) - 0.5;
            vec3 ox = floor(x + 0.5);
            vec3 a0 = x - ox;
            m *= 1.79284291400159 - 0.85373472095314 * (a0*a0 + h*h);
            vec3 g;
            g.x = a0.x * x0.x + h.x * x0.y;
            g.yz = a0.yz * x12.xz + h.yz * x12.yw;
            return 130.0 * dot(m, g);
        }
        vec2 rotate(vec2 v, float angle) {
            float r_sin = sin(angle);
            float r_cos = cos(angle);
            return vec2(v.x * r_cos - v.y * r_sin, v.x * r_sin + v.y * r_cos);
        }

        float eyes(vec2 uv) {
            uv.y -= .5;
            uv.x *= 1.;
            uv.y *= .8;
            uv.x = abs(uv.x);
            uv.y += u_smile * .3 * pow(uv.x, 1.3);
            uv.x -= (.6 + .2 * u_smile);

            float d = clamp(length(uv), 0., 1.);
            return 1. - pow(d, .08);
        }

        float mouth(vec2 uv) {
            uv.y += 1.5;

            uv.x *= (.5 + .5 * abs(1. - u_smile));
            uv.y *= (3. - 2. * abs(1. - u_smile));
            uv.y -= u_smile * 4. * pow(uv.x, 2.);

            float d = clamp(length(uv), 0., 1.);
            return 1. - pow(d, .07);
        }

        float face(vec2 uv, float rotation) {
            uv = rotate(uv, rotation);
            uv /= (.27 * u_size);

            float eyes_shape = 10. * eyes(uv);
            float mouth_shape = 20. * mouth(uv);

            float col = 0.;
            col = mix(col, 1., eyes_shape);
            col = mix(col, 1., mouth_shape);

            return col;
        }

        void main() {

            vec2 point = u_pointer;
            point.x *= u_ratio;

            vec2 uv = vUv;
            uv.x *= u_ratio;
            uv -= point;

            float texture = texture2D(u_texture, vec2(vUv.x, 1. - vUv.y)).r;
            float shape = texture;

            float noise = snoise(uv * vec2(.7 / u_size, .6 / u_size) + vec2(0., .0015 * u_time));
            noise += 1.2;
            noise *= 2.1;
            noise += smoothstep(-.8, -.2, (uv.y) / u_size);

            float face = face(uv, 5. * (u_target_pointer.x - u_pointer.x));
            shape -= face;

            shape *= noise;

            vec3 border = (1. - u_border_color);
            border.g += .2 * sin(.005 * u_time);
            border *= .5;

            vec3 color = u_main_color;
            color -= border * smoothstep(.0, .01, shape);

            shape = shape;
            color *= shape;

            gl_FragColor = vec4(color, shape);
        }`;
    }

    initShader() {
        const vsSource = this.vertShader();
        const fsSource = this.fragShader();

        const gl = this.canvasEl.getContext("webgl") || this.canvasEl.getContext("experimental-webgl");

        if (!gl) {
            console.error("WebGL is not supported by your browser.");
            return null;
        }

        const createShader = (gl, sourceCode, type) => {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, sourceCode);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        };

        const vertexShader = createShader(gl, vsSource, gl.VERTEX_SHADER);
        const fragmentShader = createShader(gl, fsSource, gl.FRAGMENT_SHADER);

        const createShaderProgram = (gl, vertexShader, fragmentShader) => {
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
                return null;
            }

            return program;
        };

        const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);

        const getUniforms = (gl, program) => {
            let uniforms = [];
            let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let uniformName = gl.getActiveUniform(program, i).name;
                uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
            }
            return uniforms;
        };

        this.uniforms = getUniforms(gl, shaderProgram);

        const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.useProgram(shaderProgram);

        const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        const canvasTexture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, canvasTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.textureEl);
        gl.uniform1i(this.uniforms.u_texture, 0);

        gl.uniform1f(this.uniforms.u_size, this.params.size);

        // Initial color setup (colors will be updated per frame in render loop)
        gl.uniform3f(this.uniforms.u_main_color, this.params.mainColor[0], this.params.mainColor[1], this.params.mainColor[2]);
        gl.uniform3f(this.uniforms.u_border_color, this.params.borderColor[0], this.params.borderColor[1], this.params.borderColor[2]);

        return gl;
    }

    updateTexture() {
        this.textureCtx.fillStyle = 'black';
        this.textureCtx.fillRect(0, 0, this.textureEl.width, this.textureEl.height);

        this.pointerTrail.forEach((p, pIdx) => {
            if (pIdx === 0) {
                p.x = this.mouse.x;
                p.y = this.mouse.y;
            } else {
                p.vx += (this.pointerTrail[pIdx - 1].x - p.x) * this.params.tail.spring;
                p.vx *= this.params.tail.friction;

                p.vy += (this.pointerTrail[pIdx - 1].y - p.y) * this.params.tail.spring;
                p.vy *= this.params.tail.friction;
                p.vy += this.params.tail.gravity;

                p.x += p.vx;
                p.y += p.vy;
            }

            // Validate values before creating gradient to prevent non-finite errors
            const x = isFinite(p.x) ? p.x : 0;
            const y = isFinite(p.y) ? p.y : 0;
            const r = isFinite(p.r) && p.r > 0 ? p.r : 1;
            const innerRadius = isFinite(p.bordered) && p.bordered >= 0 ? r * p.bordered : 0;

            // Ensure inner radius is not greater than outer radius
            const safeInnerRadius = Math.min(innerRadius, r * 0.9);

            const grd = this.textureCtx.createRadialGradient(x, y, safeInnerRadius, x, y, r);
            grd.addColorStop(0, 'rgba(255, 255, 255, ' + (isFinite(p.opacity) ? p.opacity : 0.1) + ')');
            grd.addColorStop(1, 'rgba(255, 255, 255, 0)');

            this.textureCtx.beginPath();
            this.textureCtx.fillStyle = grd;
            this.textureCtx.arc(x, y, r, 0, Math.PI * 2);
            this.textureCtx.fill();
        });
    }

    render() {
        // Safety check for WebGL context and running state
        if (!this.gl || !this.uniforms || !this.isRunning) {
            return;
        }

        const currentTime = performance.now();
        this.gl.uniform1f(this.uniforms.u_time, currentTime);

        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

        if (this.mouse.moving) {
            this.params.smile -= .05;
            this.params.smile = Math.max(this.params.smile, -.1);
            this.params.tail.gravity -= 10 * this.params.size;
            this.params.tail.gravity = Math.max(this.params.tail.gravity, 0);
        } else {
            this.params.smile += .01;
            this.params.smile = Math.min(this.params.smile, 1);
            if (this.params.tail.gravity > 25 * this.params.size) {
                this.params.tail.gravity = (25 + 5 * (1 + Math.sin(.002 * currentTime))) * this.params.size;
            } else {
                this.params.tail.gravity += this.params.size;
            }
        }

        this.mouse.x += (this.mouse.tX - this.mouse.x) * this.mouseThreshold;
        this.mouse.y += (this.mouse.tY - this.mouse.y) * this.mouseThreshold;

        // Safe coordinate normalization
        const safeWidth = window.innerWidth || 800;
        const safeHeight = window.innerHeight || 600;

        this.gl.uniform1f(this.uniforms.u_smile, this.params.smile);
        this.gl.uniform2f(this.uniforms.u_pointer, this.mouse.x / safeWidth, 1. - this.mouse.y / safeHeight);
        this.gl.uniform2f(this.uniforms.u_target_pointer, this.mouse.tX / safeWidth, 1. - this.mouse.tY / safeHeight);

        // Update colors for this instance
        this.gl.uniform3f(this.uniforms.u_main_color, this.params.mainColor[0], this.params.mainColor[1], this.params.mainColor[2]);
        this.gl.uniform3f(this.uniforms.u_border_color, this.params.borderColor[0], this.params.borderColor[1], this.params.borderColor[2]);

        this.updateTexture();

        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, this.textureEl);

        // Continue rendering only if still running
        if (this.isRunning) {
            this.animationId = requestAnimationFrame(() => this.render());
        }
    }

    resizeCanvas() {
        const safeWidth = window.innerWidth || 800;
        const safeHeight = window.innerHeight || 600;
        const safePixelRatio = isFinite(this.devicePixelRatio) && this.devicePixelRatio > 0 ? this.devicePixelRatio : 1;

        this.canvasEl.width = safeWidth * safePixelRatio;
        this.canvasEl.height = safeHeight * safePixelRatio;
        this.textureEl.width = safeWidth;
        this.textureEl.height = safeHeight;

        if (this.gl && this.uniforms) {
            this.gl.viewport(0, 0, this.canvasEl.width, this.canvasEl.height);
            const ratio = this.canvasEl.height > 0 ? this.canvasEl.width / this.canvasEl.height : 1;
            this.gl.uniform1f(this.uniforms.u_ratio, ratio);
        }

        // Update trail dot sizes
        for (let i = 0; i < this.params.tail.dotsNumber; i++) {
            if (this.pointerTrail[i]) {
                this.pointerTrail[i].r = this.dotSize(i);
            }
        }
    }

    // Method to destroy the ghost trail instance and clean up
    destroy() {
        // Stop the trail effect
        this.stop();

        // Clear any pending fade timeout
        if (this.fadeTimeout) {
            clearTimeout(this.fadeTimeout);
            this.fadeTimeout = null;
        }

        // Remove all event listeners
        window.removeEventListener("resize", this.boundResizeCanvas);
        this.targetElement.removeEventListener("mouseenter", this.boundMouseEnter);
        this.targetElement.removeEventListener("mouseleave", this.boundMouseLeave);

        // Remove the canvas from DOM
        if (this.canvasEl && this.canvasEl.parentNode) {
            this.canvasEl.parentNode.removeChild(this.canvasEl);
        }
    }
}

// Auto-initialize for backward compatibility (but don't start automatically)
if (typeof window !== 'undefined') {
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            // Check for original element
            const originalElement = document.querySelector('.eael-ghost-cursor-trail');
            if (originalElement) {
                window.ghostTrail = new PhantomSmokeGhost('body');
                // Start automatically only if original element exists
                window.ghostTrail.start();
            }
        });
    } else {
        // DOM is already ready
        const originalElement = document.querySelector('.eael-ghost-cursor-trail');
        if (originalElement) {
            window.ghostTrail = new PhantomSmokeGhost('body');
            // Start automatically only if original element exists
            window.ghostTrail.start();
        }
    }
}

// Usage examples:
// For body element: new PhantomSmokeGhost('body'); // Automatically starts/stops on mouseenter/mouseleave
// For specific element: new PhantomSmokeGhost('.my-container'); // Independent canvas for each element
// With custom options: new PhantomSmokeGhost('body', { size: 0.2, mainColor: '#FF5733' });
// With hex colors: new PhantomSmokeGhost('#section', { mainColor: '#FF5733', borderColor: '#00AAFF' });
// With RGB arrays (backward compatible): new PhantomSmokeGhost('body', { mainColor: [1, 0, 0] });
// Multiple elements:
//   const trail1 = new PhantomSmokeGhost('#section1', { mainColor: '#FF0000' });
//   const trail2 = new PhantomSmokeGhost('#section2', { mainColor: '#00FF00' });
