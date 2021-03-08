<script>
    export let dye;

    function calculateTextileStyle() {
        const backgroundImage = dye.texture.src;
        const size = 64;


        let sizeMod = (size / dye.texture.size);
                let texSize = (dye.texture.size * 16) * sizeMod

                let texLeft = (dye.texture.index * dye.texture.size) * sizeMod % texSize;
                let texTop = (Math.floor(dye.texture.index / 16) * dye.texture.size) * sizeMod;

        return `
            background-image: url(${backgroundImage});
            background-position: -${texLeft}px -${texTop}px;
            background-size: ${texSize}px ${texSize}px;
        `
    }
</script>

<div class="dye" style="{dye.type == "dye" ? `background-color: #${dye.color}` : calculateTextileStyle()}" on:click>

</div>

<style>
    .dye {
        width: 64px;
        height: 64px;
        image-rendering: pixelated;
        image-rendering: crisp-edges;
        margin: 2px;
    }
</style>