<script>
	import { sprite, mask, loading, isElectron } from './store' 
	import { SPRITE_TYPES } from './enums'

	import SpriteRenderer from './components/SpriteRenderer.svelte'
	import DyeSelector from './components/DyeSelector.svelte';

	let index = 0;
	let size = 8;
	let spriteType = 0;
	let clothingDye;
	let accessoryDye;
	let bgColor = "#CCCCCC";
	let exportToGIF;

	if (isElectron) {
		window.api.onSetSprite((e, src) => {
			$sprite = src;
		})
		window.api.onSetMask((e, src) => {
			$mask = src;
		})
	}

	function loadSprite() {
		if (isElectron) {
			window.api.selectSprite();
		} else {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".png";
			input.click();

			input.addEventListener("change", async (e) => {
				$sprite = URL.createObjectURL(await input.files[0]);
			})
		}
	}

	function loadMask() {
		if (isElectron) {
			window.api.selectMask();
		} else {
			const input = document.createElement("input");
			input.type = "file";
			input.accept = ".png";
			input.click();

			input.addEventListener("change", async (e) => {
				$mask = URL.createObjectURL(await input.files[0]);
			})
		}
	}
	
</script>

{#await loading}
	<div class="loadingContainer">
		Loading...
	</div>
{:then}
	<main>
		<div class="sideBar">
			<div class="container">
				<h2>Sprite</h2>
				<div class="imageContainer">
					{#if $sprite}
						<img src={$sprite} alt="Unable to load sprite!">
					{:else}
						No sprite loaded!
					{/if}
				</div>
				<button on:click={loadSprite}>Load Sprite</button>
			</div>

			<div class="container">
				<h2>Mask</h2>
				<div class="imageContainer">
					{#if $mask}
						<img src={$mask} alt="Unable to load mask!">
					{:else}
						No mask loaded!
					{/if}
				</div>
				<button on:click={loadMask}>Load Mask</button>
			</div>

			<div class="container">
				<h2>Settings</h2>
				<div class="optionsContainer">
					<div>
						Sheet Type: <select bind:value={spriteType}>
							<option value={SPRITE_TYPES.ITEM}>Item</option>
							<option value={SPRITE_TYPES.ENEMY}>Enemy</option>
							<option value={SPRITE_TYPES.PLAYER}>Player</option>
						</select>
					</div>
					<div>
						Index: <input type="number" step="1" min="0" bind:value={index} />
					</div>
					<div>
						Size: <input type="number" step="8" min="8" bind:value={size} />
					</div>
					<div>
						BG Color: <input type="color" defaultValue={bgColor} bind:value={bgColor} />
					</div>
					{#if spriteType === SPRITE_TYPES.PLAYER && $mask !== null}
						<div>
							<DyeSelector text="Select Clothing Dye" bind:dye={clothingDye}></DyeSelector>
						</div>
						<div>
							<DyeSelector text="Select Accessory Dye" bind:dye={accessoryDye}></DyeSelector>
						</div>
					{/if}
					{#if spriteType !== SPRITE_TYPES.ITEM}
						<button on:click={exportToGIF}>Export to GIF</button>
					{/if}
				</div>
				
			</div>
		</div>
		<div class="renderer" style="background-color: {bgColor};">
			<SpriteRenderer 
				{index} 
				{size} 
				{clothingDye} 
				{accessoryDye} 
				type={spriteType} 
				{bgColor}
				bind:exportToGIF
			/>
		</div>
	</main>
{/await}


<style>
	.loadingContainer {
		display: flex;
		justify-content: center;
		align-items: center;
		width: 100%;
		height: 100%;
		background-color: rgb(24, 24, 24);
		color: white;
		font-size: 96px;
	}

	main {
		display: flex;
		flex-direction: row;
		background-color: white;
		width: 100%;
		height: 100%;
	}

	h2 {
		margin: 4px;
		font-weight: normal;
		justify-self: flex-start;
	}

	.renderer {
		display: flex;
		align-items: center;
		justify-content: center;
		flex-grow: 1;
	}

	.sideBar {
		display: flex;
		flex-direction: column;
		width: 300px;
		height: 100%;
		background-color: rgb(53, 53, 53);
		overflow-y: auto;
	}

	.container {
		display: flex;
		flex-direction: column;
		flex-grow: 1;
		text-align: center;
		color: rgb(235, 235, 235);
		border: 2px solid gray;
		border-radius: 4px;
		padding: 4px;
		margin: 4px;
		justify-content: center;
		align-items: center;
	}

	.imageContainer {
		display: flex;
		justify-content: center;
		align-items: center;
		margin: 4px;
		width: 100%;
		flex-grow: 1;
		font-size: 24px;
	}

	.optionsContainer {
		display: flex;
		flex-direction: column;
		justify-content: center;
		align-items: center;
		flex-grow: 1;
	}

	img {
		object-fit: contain;
		flex-grow: 1;
		max-height: 200px;
		image-rendering: pixelated;
		image-rendering: crisp-edges;
	}

	@media (min-width: 640px) {
		main {
			max-width: none;
		}
	}
</style>