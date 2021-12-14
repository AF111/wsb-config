<script lang="ts">
	import type { MappedFolder, ToggleOptions } from '../lib/Configurator';
	import { createWSBConfig } from '../lib/Configurator';

	export const config = createWSBConfig();
	export let id: string = '';
	export let configName = '';

	const defaultFolder = {
		HostFolder: '',
		SandboxFolder: '',
		ReadOnly: true,
	};

	config.addMappedFolder({ ...defaultFolder });

	let configValues = config.getAll();
	let showRawConfig = location.hostname === 'localhost' ? true : false;
	let overrideToggles = { memoryOverride: false, hasLogonCommand: false, hasMappedFolders: false };

	let configFormat: 'JSON' | 'XML' = 'JSON';

	$: rawConfig = JSON.stringify(configValues, null, 2);

	const handleFormChange = (ev: Event & { currentTarget: EventTarget & HTMLFormElement }) => {
		const t = ev.target as any;
		const name = t.name;
		const value = t.type == 'checkbox' ? t.checked : t.value;

		if (name in overrideToggles) {
			overrideToggles[name] = value;
			return;
		}

		if (name === 'LogonCommand') {
			config.setLogonCommand(value as string);
		} else if (name === 'MemoryInMB') {
			let num = +value;
			if (Number.isNaN(num)) {
				console.error('MemoryInMB should be a number');
				return;
			}

			num = Math.abs(num);

			if (num < 1000) {
				console.error('MemoryInMB should be equal to or greater than 1000');
				return;
			}

			config.setMemoryBytes(num);
		} else {
			config.toggleOption(name as ToggleOptions, value);
		}

		configValues = config.getAll();
	};

	const addFolderMapping = () => {
		config.addMappedFolder({ ...defaultFolder });
		configValues = config.getAll();
	};

	const removeFolderMapping = (idx: number) => {
		config.removeMappedFolder(idx);
		configValues = config.getAll();

		if (!configValues.MappedFolders.length) {
			overrideToggles.hasMappedFolders = false;
			config.addMappedFolder(defaultFolder);
			configValues = config.getAll();
		}
	};

	const handleFolderInput = (
		idx: number,
		k: Exclude<keyof MappedFolder, 'ReadOnly'>,
		ev: Event & { currentTarget: EventTarget & HTMLInputElement }
	) => {
		const folder = configValues.MappedFolders[idx];
		folder[k] = ev.currentTarget.value;
	};

	const handleSubmit = () => {};
</script>

<div class="config-editor">
	{#if id !== ''}
		<h2 class="text-2xl">Edit Configuration {id}</h2>
	{:else}
		<h2 class="text-2xl">New Configuration</h2>
	{/if}

	<div>
		<label>
			<input
				type="text"
				style="border-radius: 8px; padding: 10px 20px;"
				placeholder="Config name"
				bind:value={configName}
			/>
		</label>
	</div>

	<div class="form-group center-items">
		<span for="jsonConfig" class="text-lg">View raw config</span>
		<label class="switch">
			<input
				id="jsonConfig"
				name="jsonConfig"
				type="checkbox"
				on:change={(e) => {
					showRawConfig = !showRawConfig;
					e.currentTarget.checked = showRawConfig;
				}}
				checked={showRawConfig}
			/>
			<span />
		</label>
	</div>

	{#if showRawConfig}
		<div style="margin-top: 1rem;">
			<label for="configFormat">Format ({configFormat})</label>
			<select
				name="configFormat"
				id="configFormat"
				style="width: 80px; min-width: unset; border-radius: 8px; padding: 5px; margin-left: 5px;"
			>
				<option value="JSON" selected>JSON</option>
				<option value="XML">XML</option>
			</select>
		</div>
		<pre
			style="border-left: 3px solid var(--c-primary); padding-left: 10px; padding-top: 10px; padding-bottom: 10px; background: var(--c-secondary);">{rawConfig}</pre>
	{/if}

	<form id="config-editor-form" on:input={handleFormChange} on:submit={handleSubmit}>
		<div class="form-group center-items">
			<span for="cvGpu" class="text-lg">vGpu</span>
			<label class="switch">
				<input id="cvGpu" name="vGpu" type="checkbox" checked={configValues.vGpu} />
				<span />
			</label>
		</div>

		<div class="form-group center-items">
			<span for="cNetworking" class="text-lg">Networking</span>
			<label class="switch">
				<input id="cNetworking" name="Networking" type="checkbox" checked={configValues.Networking} />
				<span />
			</label>
		</div>

		<div class="form-group center-items">
			<span for="hasMappedFolders" class="text-lg">Mapped Folders</span>
			<label class="switch">
				<input
					id="chasMappedFolders"
					name="hasMappedFolders"
					type="checkbox"
					checked={overrideToggles.hasMappedFolders}
				/>
				<span />
			</label>
		</div>

		{#if overrideToggles.hasMappedFolders}
			<div id="forlderMappingsContainer" style="padding-left: 15px; border-left: 3px solid var(--c-primary);">
				{#each configValues.MappedFolders as folder, idx}
					<h4 style="margin-top: 1rem; font-weight: normal;">#{idx + 1}</h4>
					<div style="margin: 2rem 0;" class="form-group center-items">
						<span class="text-lg">Read only</span>
						<label class="switch">
							<input
								name="ReadOnly"
								type="checkbox"
								on:change={(e) => {
									folder.ReadOnly = !folder.ReadOnly;
								}}
								checked={folder.ReadOnly}
							/>
							<span />
						</label>
					</div>

					<div id="mappedFoldersMounts">
						<div style="margin: 2rem 0;">
							<span style="display: block; margin-bottom: 1.75rem;" class="text-lg">Host Folder</span>
							<div style="margin-top: 0;" class="form-group center-items form-input">
								<input
									type="text"
									name="HostFolder"
									placeholder="C:\Users\John\Desktop\Sandbox"
									on:input={(e) => handleFolderInput(idx, 'HostFolder', e)}
									value={folder.HostFolder}
								/>
							</div>
						</div>

						<div style="margin: 2rem 0;">
							<span style="display: block; margin-bottom: 1.75rem;" class="text-lg">Sandbox Folder</span>
							<div style="margin-top: 0;" class="form-group center-items form-input">
								<input
									type="text"
									name="SandboxFolder"
									placeholder="C:\Users\WDAGUtilityAccount\Desktop\Sandbox"
									on:input|preventDefault={(e) => handleFolderInput(idx, 'SandboxFolder', e)}
									value={folder.SandboxFolder}
								/>
							</div>
						</div>

						<div style="margin: 2rem 0;">
							<button
								on:click|preventDefault={(e) => removeFolderMapping(idx)}
								class="btn btn--danger delete-folder-btn"
							>
								Remove <span class="icon-minus" />
							</button>
						</div>
					</div>
				{/each}
			</div>

			<button
				class="form-group center-items c-primary"
				style="justify-content: unset; cursor: pointer; margin-top: 1.75rem; margin-bottom: 0.75rem; background: none; border: none;"
				on:click|preventDefault={addFolderMapping}
			>
				<p style="margin: 0; margin-right: 1.5rem;" class="text-lg">Add folder mapping</p>
				<span class="icon-add" />
			</button>

			<hr class="hr" />
		{/if}

		<div>
			<div class="form-group center-items">
				<span for="chasLogonCommand" class="text-lg">Logon Command</span>
				<label class="switch">
					<input
						id="chasLogonCommand"
						name="hasLogonCommand"
						type="checkbox"
						checked={overrideToggles.hasLogonCommand}
					/>
					<span />
				</label>
			</div>

			{#if overrideToggles.hasLogonCommand}
				<textarea
					style="margin-top: 1.5rem;"
					name="LogonCommand"
					type="text"
					value={configValues.LogonCommand.Command}
				/>
			{/if}
		</div>

		<div class="spacer" />

		<div class="form-group center-items">
			<span for="cAudioInput" class="text-lg">Audio Input</span>
			<label class="switch">
				<input id="cAudioInput" name="AudioInput" type="checkbox" checked={configValues.AudioInput} />
				<span />
			</label>
		</div>

		<div class="form-group center-items">
			<span for="cVideoInput" class="text-lg">Video Input</span>
			<label class="switch">
				<input id="cVideoInput" name="VideoInput" type="checkbox" checked={configValues.VideoInput} />
				<span />
			</label>
		</div>

		<div class="spacer" />

		<div class="form-group center-items">
			<span for="cProtectedClient" class="text-lg">Protected Client</span>
			<label class="switch">
				<input id="cProtectedClient" name="ProtectedClient" type="checkbox" checked={configValues.ProtectedClient} />
				<span />
			</label>
		</div>

		<div class="form-group center-items">
			<span for="cPrinterRedirection" class="text-lg">Printer Redirection</span>
			<label class="switch">
				<input
					id="cPrinterRedirection"
					name="PrinterRedirection"
					type="checkbox"
					checked={configValues.PrinterRedirection}
				/>
				<span />
			</label>
		</div>

		<div class="spacer" />

		<div>
			<div class="form-group center-items">
				<span for="cmemoryOverride" class="text-lg">Set Memory in Megabytes (MB)</span>
				<label class="switch">
					<input id="cMemoryOverride" name="memoryOverride" type="checkbox" checked={overrideToggles.memoryOverride} />
					<span />
				</label>
			</div>

			{#if overrideToggles.memoryOverride}
				<input
					class="form-input"
					style="width: 100%; margin-top: 1rem;"
					name="MemoryInMB"
					type="number"
					min="1000"
					value={configValues.MemoryInMB}
				/>
			{/if}
		</div>

		<div>
			<label>
				<button class="btn btn--primary btn--pressdown" style="width: 100%; margin: 1.5rem 0;" type="submit">
					✅ Save
				</button>
			</label>
		</div>
	</form>
</div>

<style>
	.config-editor {
		max-width: 28.125rem;
		width: 100%;
		margin: 0 auto;
	}

	.config-editor .form-group {
		margin-top: 2.25rem;
		display: flex;
		justify-content: space-between;
	}

	.config-editor textarea {
		background: var(--c-secondary);
		padding: 1em;
		width: 100%;
		resize: vertical;
		border: 0;
		border-radius: 10px;
		height: 130px;
	}

	.form-input input {
		width: 100%;
	}

	.delete-folder-btn {
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: center;
		width: 100%;
		border-radius: 30px;
	}

	.delete-folder-btn span {
		margin-left: 10px;
	}
</style>
