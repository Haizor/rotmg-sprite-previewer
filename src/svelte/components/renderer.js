const glCanvas = document.createElement("canvas");
const gl = glCanvas.getContext("webgl");

const vertexShader = gl.createShader(gl.VERTEX_SHADER);
gl.shaderSource(vertexShader, document.getElementById("vertex-shader").textContent);
gl.compileShader(vertexShader);

const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
gl.shaderSource(fragmentShader, document.getElementById("fragment-shader").textContent);
gl.compileShader(fragmentShader);   

const program = gl.createProgram();
gl.attachShader(program, vertexShader);
gl.attachShader(program, fragmentShader);
gl.linkProgram(program);

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
    -1, -1,
    -1, 1,
    1, 1,
    -1, -1,
    1, -1,
    1, 1
]), gl.STATIC_DRAW);
const positionLocation = gl.getAttribLocation(program, "aVertexPosition");

const uvBuffer = gl.createBuffer();
const uvPosition = gl.getAttribLocation(program, "aUVPosition");

const spriteTexture = gl.createTexture();
const maskTexture = gl.createTexture();
const clothingTexture = gl.createTexture();
const accessoryTexture = gl.createTexture();

const outlineSize = 2;

export class Sprite {
    constructor(options) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.w = options.w || 64;
        this.h = options.h || 64;
        this.img = options.img;
        this.size = options.size || 8;
        this.index = options.index || 0;
        
        this.elapsed = 0;
        
        this.initCanvases();
    }
    
    initCanvases() {
        this.canvas = this.generateCanvas(this.index);
    }
    
    setIndex(index) {
        this.index = index;
        this.initCanvases();
    }
    
    setSize(size) {
        this.size = size;
        this.initCanvases();
    }
    
    draw(ctx, elapsed) {
        this.elapsed += elapsed;
        ctx.drawImage(this.canvas, this.x, this.y, this.w, this.h)
    }
    
    generateCanvas(index) {
        const canvas = document.createElement("canvas");
        canvas.width = this.size * 8;
        canvas.height = this.size * 8;
        const ctx = canvas.getContext("2d");
        
        const indexedX = (index % (this.img.width / this.size)) * this.size;
        const indexedY = Math.floor(index / (this.img.width / this.size)) * this.size;
        
        const o = outlineSize;
        const s = 6 * this.size;
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.img, indexedX, indexedY, this.size, this.size, 4 - o, 4 - o, s, s);
        ctx.drawImage(this.img, indexedX, indexedY, this.size, this.size, 4 - o, 4 + o, s, s);
        ctx.drawImage(this.img, indexedX, indexedY, this.size, this.size, 4 + o, 4 + o, s, s);
        ctx.drawImage(this.img, indexedX, indexedY, this.size, this.size, 4 + o, 4 - o, s, s);
        ctx.globalCompositeOperation = "source-atop";
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = "source-over";
        ctx.shadowColor = "#000000"
        ctx.shadowBlur = 8
        ctx.drawImage(this.img, indexedX, indexedY, this.size, this.size, 4, 4, s, s);
        ctx.drawImage(this.img, indexedX, indexedY, this.size, this.size, 4, 4, s, s);
        
        return canvas;
    }
}

export class EnemySprite extends Sprite {
    constructor(options) {
        super(options);
    }
    
    initCanvases() {
        this.walk = [];
        const row = this.index * 7;
        this.canvas = this.generateCanvas(row);
        this.walk[0] = this.generateCanvas(row + 1);
        this.walk[1] = this.generateCanvas(row + 2);
        
        this.attack = [];
        this.attack[0] = this.generateCanvas(row + 4);
        this.attack[1] = this.generateCanvas(row + 5, 2);
    }
    
    draw(ctx, elapsed) {
        this.elapsed += elapsed;
        ctx.drawImage(this.canvas, this.x, this.y, this.w, this.h);
        const frame = this.elapsed % 1000 > 500 ? 0 : 1;
        ctx.drawImage(this.walk[this.elapsed % 1000 > 500 ? 0 : 1], this.x + 64, this.y, this.w, this.h);
        ctx.drawImage(this.attack[frame], this.x + 128, this.y, this.w * (frame == 0 ? 1 : 2), this.h);
    }
    
    generateCanvas(index, widthMult = 1) {
        const canvas = document.createElement("canvas");
        canvas.width = this.size * 8 * widthMult;
        canvas.height = this.size * 8;
        const ctx = canvas.getContext("2d");
        
        const indexedX = (index % (this.img.width / this.size)) * this.size;
        const indexedY = Math.floor(index / (this.img.width / this.size)) * this.size;
        
        const o = outlineSize;
        const s = 6 * this.size;
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.img, indexedX, indexedY, this.size * widthMult, this.size, 4 - o, 4 - o, s * widthMult, s);
        ctx.drawImage(this.img, indexedX, indexedY, this.size * widthMult, this.size, 4 - o, 4 + o, s * widthMult, s);
        ctx.drawImage(this.img, indexedX, indexedY, this.size * widthMult, this.size, 4 + o, 4 + o, s * widthMult, s);
        ctx.drawImage(this.img, indexedX, indexedY, this.size * widthMult, this.size, 4 + o, 4 - o, s * widthMult, s);
        ctx.globalCompositeOperation = "source-atop";
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = "source-over";
        ctx.shadowColor = "#000000"
        ctx.shadowBlur = 8
        ctx.drawImage(this.img, indexedX, indexedY, this.size * widthMult, this.size, 4, 4, s * widthMult, s);
        ctx.drawImage(this.img, indexedX, indexedY, this.size * widthMult, this.size, 4, 4, s * widthMult, s);
        
        return canvas;
    }
}

export class PlayerSprite extends Sprite {
    constructor(options) {
        super(options);
        this.mask = options.mask;
        this.clothingDye = options.clothingDye;
        this.accessoryDye = options.accessoryDye;
        
        this.initCanvases();
    }
    
    async initCanvases() {
        if (this.clothingDye !== undefined && this.clothingDye.type === "textile" && this.clothingDye.texture.raw === undefined) {
            this.clothingDye.texture.raw = await this.loadTextile(this.clothingDye);
        }
        if (this.accessoryDye !== undefined && this.accessoryDye.type === "textile" && this.accessoryDye.texture.raw === undefined) {
            this.accessoryDye.texture.raw = await this.loadTextile(this.accessoryDye);
        }


        await this.generateMasks();
        
        this.walk = [];
        this.attack = [];
        
        this.side = {
            stand: this.generateCanvas(0),
            walk: [
                this.generateCanvas(1),
                this.generateCanvas(2)
            ],
            attack: [
                this.generateCanvas(4),
                this.generateCanvas(5, 2)
            ]
        }
        
        this.front = {
            stand: this.generateCanvas(7),
            walk: [
                this.generateCanvas(8),
                this.generateCanvas(9)
            ],
            attack: [
                this.generateCanvas(11),
                this.generateCanvas(12)
            ]
        }
        
        this.back = {
            stand: this.generateCanvas(14),
            walk: [
                this.generateCanvas(15),
                this.generateCanvas(16)
            ],
            attack: [
                this.generateCanvas(18),
                this.generateCanvas(19)
            ]
        }
        
        this.hasDoubleSideWalk = !isCanvasEmpty(this.side.walk[1]);
    }
    
    async generateMasks() {
        const mainWidth = this.size * 7;
        const mainHeight = this.size * 3;

        glCanvas.width = mainWidth * 10;
        glCanvas.height = mainHeight * 10;
        
        const unitSizing = 1 / this.img.height;
        
        const x1 = 0;
        const y1 = unitSizing * (this.index * mainHeight);
        const x2 = 1;
        const y2 = y1 + (unitSizing * mainHeight);
        
        gl.viewport(0, 0, glCanvas.width, glCanvas.height);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(positionLocation);
        
        gl.bindBuffer(gl.ARRAY_BUFFER, uvBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            x1, y2,
            x1, y1,
            x2, y1,
            x1, y2,
            x2, y2, 
            x2, y1
        ]), gl.STATIC_DRAW)
        gl.vertexAttribPointer(uvPosition, 2, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(uvPosition);
        
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, spriteTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.img);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, maskTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        if (this.mask) {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, this.mask);
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        }
        
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, clothingTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        if (this.clothingDye) {
            if (this.clothingDye.type == "dye") {
                const { r, g, b, a } = hexToRgb(this.clothingDye.color);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, a]));
            } else if (this.clothingDye.type == "textile") {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 16, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.clothingDye.texture.raw);
            }
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        }
        
        
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, accessoryTexture);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        if (this.accessoryDye) {
            if (this.accessoryDye.type == "dye") {
                const { r, g, b, a } = hexToRgb(this.accessoryDye.color);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, a]));
            } else if (this.accessoryDye.type == "textile") {
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 16, 16, 0, gl.RGBA, gl.UNSIGNED_BYTE, this.accessoryDye.texture.raw);
            }
        } else {
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([0, 0, 0, 0]));
        }
        

        
        gl.useProgram(program);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, spriteTexture);
        
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, maskTexture);
        
        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, clothingTexture);
        
        gl.activeTexture(gl.TEXTURE3);
        gl.bindTexture(gl.TEXTURE_2D, accessoryTexture);
        
        gl.uniform1i(gl.getUniformLocation(program, "uSpriteTexture"), 0)
        gl.uniform1i(gl.getUniformLocation(program, "uMaskTexture"), 1);
        gl.uniform1i(gl.getUniformLocation(program, "uClothingTexture"), 2);
        gl.uniform1i(gl.getUniformLocation(program, "uAccessoryTexture"), 3);
        gl.uniform1f(gl.getUniformLocation(program, "uTextureScalar"), glCanvas.width / 7 / this.size)
        
        gl.drawArrays(gl.TRIANGLES, 0, 6);
        
        this.spriteCanvas = document.createElement("canvas");
        this.spriteCanvas.width = glCanvas.width;
        this.spriteCanvas.height = glCanvas.height;
        
        const ctx = this.spriteCanvas.getContext("2d");
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(glCanvas, 0, 0);
    }
    
    draw(ctx, elapsed) {
        this.elapsed += elapsed;
        
        const frame = this.elapsed % 1000 > 500 ? 0 : 1;
        const sideWalkFrame = this.elapsed % 1000 > 500 ? this.side.walk[0] : (this.hasDoubleSideWalk ? this.side.walk[1] : this.side.stand)
        
        ctx.drawImage(this.side.stand, this.x, this.y, this.w, this.h);
        ctx.drawImage(sideWalkFrame, this.x + 64, this.y, this.w, this.h);
        ctx.drawImage(this.side.attack[frame], this.x + 128, this.y, this.w * (frame == 0 ? 1 : 2), this.h);
        
        ctx.drawImage(this.front.stand, this.x, this.y + 64, this.w, this.h);
        ctx.drawImage(this.front.walk[this.elapsed % 1000 > 500 ? 0 : 1], this.x + 64, this.y + 64, this.w, this.h);
        ctx.drawImage(this.front.attack[frame], this.x + 128, this.y + 64, this.w, this.h);
        
        ctx.drawImage(this.back.stand, this.x, this.y + 128, this.w, this.h);
        ctx.drawImage(this.back.walk[this.elapsed % 1000 > 500 ? 0 : 1], this.x + 64, this.y + 128, this.w, this.h);
        ctx.drawImage(this.back.attack[frame], this.x + 128, this.y + 128, this.w, this.h);
    }
    
    generateCanvas(index, widthMult = 1) {
        const canvas = document.createElement("canvas");
        canvas.width = this.size * 8 * widthMult;
        canvas.height = this.size * 8;
        const ctx = canvas.getContext("2d");

        const size = this.spriteCanvas.width / 7;
        
        const indexedX = (index % (this.spriteCanvas.width / size)) * size;
        const indexedY = Math.floor(index / (this.spriteCanvas.width / size)) * size;
        
        const o = outlineSize;
        const s = 6 * this.size;
        
        ctx.imageSmoothingEnabled = false;
        ctx.drawImage(this.spriteCanvas, indexedX, indexedY, size * widthMult, size, 4 - o, 4 - o, s * widthMult, s);
        ctx.drawImage(this.spriteCanvas, indexedX, indexedY, size * widthMult, size, 4 - o, 4 + o, s * widthMult, s);
        ctx.drawImage(this.spriteCanvas, indexedX, indexedY, size * widthMult, size, 4 + o, 4 + o, s * widthMult, s);
        ctx.drawImage(this.spriteCanvas, indexedX, indexedY, size * widthMult, size, 4 + o, 4 - o, s * widthMult, s);
        ctx.globalCompositeOperation = "source-atop";
        
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.globalCompositeOperation = "source-over";
        ctx.shadowColor = "#000000"
        ctx.shadowBlur = 8
        ctx.drawImage(this.spriteCanvas, indexedX, indexedY, size * widthMult, size, 4, 4, s * widthMult, s);
        ctx.drawImage(this.spriteCanvas, indexedX, indexedY, size * widthMult, size, 4, 4, s * widthMult, s);
        
        ctx.shadowBlur = 0;
        
        return canvas;
    }
    
    setClothingDye(dye) {
        this.clothingDye = dye;
        this.initCanvases();
    }
    
    setMask(mask) {
        this.mask = mask;
        this.clothingMask = null;
        this.accessoryMask = null;
        this.initCanvases();
    }

    loadTextile(textile) {
        const { src, size, index } = textile.texture;
        return new Promise((res, rej) => {
            const img = new Image();
            img.src = src;
            img.crossOrigin = "anonymous";
            img.onload = () => {
                const canvas = document.createElement("canvas");
                canvas.width = 16;
                canvas.height = 16;
                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = false;
                const indexedX = (index % (img.naturalWidth / size)) * size;
                const indexedY = Math.floor(index / (img.naturalHeight / size)) * size;
                ctx.drawImage(img, indexedX, indexedY, size, size, 0, 0, 16, 16);
                res(ctx.getImageData(0, 0, canvas.width, canvas.height).data);
            }
        })

    }
}

function hexToRgb(hex) {
    const result = hex.match(/[0123456789ABCDEFabcdef]{2}/g);
    const a = parseInt(result[3], 16);

    return result ? {
        r: parseInt(result[0], 16),
        g: parseInt(result[1], 16),
        b: parseInt(result[2], 16),
        a: !isNaN(a) ? a : 255
    } : null;
}

function isCanvasEmpty(canvas) {
    const ctx = canvas.getContext("2d");
    const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer)
    return !pixelBuffer.some(c => c !== 0);
}