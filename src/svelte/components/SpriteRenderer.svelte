<script>
    import { createGIF } from 'gifshot'
    import * as stores from '../store' 
    import { EnemySprite, PlayerSprite, Sprite } from './renderer'

    export let index = 0;
    export let size = 8;
    export let type = 0;
    export let clothingDye = undefined;
    export let accessoryDye = undefined;
    export let bgColor = "#CCCCCCFF"

    let sprite = null;
    let mask = null;


    let canvas = document.createElement("canvas");

    function loadImage(src) {
        return new Promise((res, rej) => {
            const img = new Image();
            img.src = src;
            img.addEventListener("load", () => res(img))
        })
    }

    stores.sprite.subscribe(async (src) => {
        const img = await loadImage(src);
        createSprite(img);
    })

    stores.mask.subscribe(async (src) => {
        mask = await loadImage(src);
        if (sprite && sprite.setMask) {
            sprite.setMask(mask);
        }
    })

    async function createSprite(img) {
        switch(type) {
            case 0:
                canvas.width = 56;
                canvas.height = 56;
                sprite = new Sprite({img, index, size});
                break;
            case 1:
                canvas.width = 248;
                canvas.height = 56;
                sprite = new EnemySprite({img, index, size});
                break;
            case 2:
                canvas.width = 248;
                canvas.height = 186;
                sprite = new PlayerSprite({img, index, size, mask, clothingDye, accessoryDye});
                break;
        }
    }

    $: if (sprite) {
        if (type !== null && type !== undefined) {
            createSprite(sprite.img);
        }
        if (clothingDye && sprite.setClothingDye) {
            sprite.setClothingDye(clothingDye);
        }
        if (accessoryDye && sprite.setAccessoryDye) {
            sprite.setAccessoryDye(accessoryDye);
        }  
        if (index !== null && type !== undefined) {
            sprite.setIndex(index);
        }
        if (size) {
            sprite.setSize(size);
        }
    }
    
    export function exportToGIF() {
        const gifCanvas = document.createElement("canvas");
        gifCanvas.width = canvas.width;
        gifCanvas.height = canvas.height;
        const ctx = gifCanvas.getContext("2d");

        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, gifCanvas.width, gifCanvas.height);

        const oldElapsed = sprite.elapsed;
        sprite.elapsed = 0;
        sprite.draw(ctx, 0);

        //TODO: this is a scuffed solution. should probably just create new sprites or something...

        const frameA = new Image();
        frameA.src = gifCanvas.toDataURL();

        ctx.fillRect(0, 0, gifCanvas.width, gifCanvas.height);
        sprite.elapsed = 501;
        sprite.draw(ctx, 0);

        //Redraw to get the other frame.
        const frameB = new Image();
        frameB.src = gifCanvas.toDataURL();

        sprite.elapsed = oldElapsed;

        createGIF({
            interval: 0.5,
            gifWidth: gifCanvas.width,
            gifHeight: gifCanvas.height,
            sampleInterval: 1,
            images: [
                frameA, frameB
            ]
        }, (obj) => {
            if (!obj.error) {
                const src = obj.image;
                const img = new Image();
                img.src = src;
                const link = document.createElement("a");
                link.setAttribute("href", src);
                link.setAttribute("download", "gif");
                link.click();
            }
        })
    }

    let prevTimestamp;
    function loop(timestamp) {
        if (!prevTimestamp) prevTimestamp = timestamp;
        draw(timestamp - prevTimestamp);

        prevTimestamp = timestamp;
        requestAnimationFrame(loop);
    }
    
    function draw(elapsed = 0) {
        if (!sprite) return;

        const ctx = canvas.getContext("2d");
        ctx.fillStyle = bgColor;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        sprite.draw(ctx, elapsed);
    }

    requestAnimationFrame(loop)
</script>

<div class="rendererContainer">
    <canvas width="248" height="184" bind:this={canvas}></canvas>
</div>