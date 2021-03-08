<script>
    import { browserLoader } from '../store'
    import DyeDisplay from './DyeDisplay.svelte';

    const dyes = browserLoader.dyeLoader.allDyes;

    let toggled = false;

    export let dye;
    export let text = "Dye Selector"

    function onDyeClicked(dyeClicked) {
        dye = dyeClicked;
        toggled = false;
    }
</script>

<div class="buttonContainer">
    <button on:click={() => toggled = true}>{text}</button>
    {#if dye !== undefined}
        <div class="emojiButton" on:click={() => dye = undefined}>🗑️</div>
    {/if}
</div>


{#if toggled}
    <div class="fullContainer" on:click={() => toggled = false}>
        <div class="dyeContainer">
            {#each dyes as loopDye}
                <DyeDisplay dye={loopDye} on:click={() => onDyeClicked(loopDye)}></DyeDisplay>
            {/each}
        </div>
    </div>
{/if}

<style>
    .buttonContainer {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;
    }

    .fullContainer {
        position: absolute;
        left: 0px;
        top: 0px;
        width: 100%;
        height: 100%;
        background-color: rgba(0, 0, 0, 0.25);
        z-index: 100;
    }

    .dyeContainer {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
        align-content: flex-start;
        justify-content: center;

        overflow-y: scroll;
        height: 100%;
    }
</style>