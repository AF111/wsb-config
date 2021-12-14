<script lang="ts">
	export let id: string = '';
</script>

<div class="config-editor">
	{#if id !== ""} 
		<h2 class="text-2xl">Edit Configuration {id}</h2>
	{:else}
		<h2 class="text-2xl">New Configuration</h2>
	{/if}

	<form id="config-editor-form">
		<div class="form-group center-items">
			<span class="text-lg">vGpu</span>
			<label class="switch">
				<input name="vGpu" type="checkbox" checked />
				<span />
			</label>
		</div>

		<div class="form-group center-items">
			<span class="text-lg">Networking</span>
			<label class="switch">
				<input name="networking" type="checkbox" checked />
				<span />
			</label>
		</div>

		<div class="form-group center-items">
			<span class="text-lg">Mapped Folders</span>
			<label class="switch">
				<input name="mappedFolders" type="checkbox" />
				<span />
			</label>
		</div>

		<div
			data-if="mappedFolders"
			id="forlderMappingsContainer"
			style="
                  padding-left: 15px;
                  border-left: 3px solid var(--c-primary);"
		>
			<div style="margin: 3.5rem 0;" class="form-group center-items">
				<span class="text-lg">Read only</span>
				<label class="switch">
					<input name="readOnly" type="checkbox" />
					<span />
				</label>
			</div>

			<div id="mappedFoldersMounts">
				<div style="margin: 2rem 0;">
					<span style="display: block; margin-bottom: 1.75rem;" class="text-lg"
						>Host Folder</span
					>
					<div style="margin-top: 0;" class="form-group center-items folder-input">
						<input
							name="folderMappings[hostFolder]"
							type="text"
							placeholder="C:\Users\John\Desktop\Sandbox"
						/>
						<input style="display: none;" type="file" name="selectHostFolder" />
						<button class="btn open-folder-btn">
							Open folder
							<span class="icon-folder" />
						</button>
					</div>
				</div>

				<div style="margin: 2rem 0;">
					<span style="display: block; margin-bottom: 1.75rem;" class="text-lg"
						>Sandbox Folder</span
					>
					<div style="margin-top: 0;" class="form-group center-items folder-input">
						<input
							name="folderMappings[sandboxFolder]"
							type="text"
							placeholder="C:\Users\WDAGUtilityAccount\Desktop\Sandbox"
						/>
						<button class="btn open-folder-btn">
							Open folder
							<span class="icon-folder" />
						</button>
					</div>
				</div>

				<div style="margin: 2rem 0;">
					<button class="btn btn--danger delete-folder-btn">
						Remove <span class="icon-minus" />
					</button>
				</div>
			</div>
		</div>

		<div
			class="form-group center-items c-primary"
			style="justify-content: unset; cursor: pointer; margin-top: 1.75rem; margin-bottom: 0.75rem;"
		>
			<p style="margin: 0; margin-right: 1.5rem;" class="text-lg">
				Add folder mapping
			</p>
			<span class="icon-add" />
		</div>

		<hr class="hr" />

		<!-- <div class="form-group center-items">
                      <span class="text-lg">Read only</span>
                      <label class="switch">
                          <input name="readOnly" type="checkbox">
                          <span></span>
                      </label>
                  </div> -->

		<!-- FOLDER INPUTS -->

		<!-- FOLDER HR -->
		<div>
			<div class="form-group center-items">
				<span class="text-lg">Logon Command</span>
				<label class="switch">
					<input name="hasLogonCommand" type="checkbox" />
					<span />
				</label>
			</div>

			<textarea
				data-if="hasLogonCommand"
				style="margin-top: 1.5rem;"
				name="logonCommand"
				type="text"
				value="cmd.exe"
				class="d-none"
			/>
		</div>

		<div class="spacer" />

		<div class="form-group center-items">
			<span class="text-lg">Audio Input</span>
			<label class="switch">
				<input name="audioInput" type="checkbox" />
				<span />
			</label>
		</div>

		<div class="form-group center-items">
			<span class="text-lg">Video Input</span>
			<label class="switch">
				<input name="videoInput" type="checkbox" />
				<span />
			</label>
		</div>

		<div class="spacer" />

		<div class="form-group center-items">
			<span class="text-lg">Protected Client</span>
			<label class="switch">
				<input name="protectedClient" type="checkbox" />
				<span />
			</label>
		</div>

		<div class="form-group center-items">
			<span class="text-lg">Printer Redirection</span>
			<label class="switch">
				<input name="printerRedirection" type="checkbox" />
				<span />
			</label>
		</div>

		<div class="spacer" />

		<div>
			<div class="form-group center-items">
				<span class="text-lg">Memory in MiB (Mebibytes)</span>
				<label class="switch">
					<input name="overrideMemory" type="checkbox" />
					<span />
				</label>
			</div>

			<input
				data-if="overrideMemory"
				class="d-none"
				style="margin-top: 1.5rem; width: 100%;"
				name="memoryMB"
				placeholder="1024 MiB"
				type="number"
				min="1024"
			/>
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

	.open-folder-btn {
		border-radius: 40px;
		font-weight: bold;
		display: flex;
		align-items: center;
		justify-content: space-between;
		width: 160px;
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

	@media screen and (max-width: 510px) {
		.folder-input {
			flex-direction: column;
			row-gap: 1rem;
		}

		
		.folder-input .btn {
			justify-content: center;
			column-gap: 1rem;
		}

		.folder-input .btn, .folder-input input {
			width: 100%;
		}
	}
</style>
