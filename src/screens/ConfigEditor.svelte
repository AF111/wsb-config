<script lang="ts">
    import { toggleOptions, ToggleOptions, validateConfig, WSBConfiguration } from '../lib/Configurator';

    import { onMount } from 'svelte';
    import { createWSBConfig } from '../lib/Configurator';
    import { toXML } from 'jstoxml';

    export const config = createWSBConfig();
    const toEditConfig = localStorage.getItem('to-edit-cfg');

    const defaultFolder = {
        HostFolder: '',
        SandboxFolder: '',
        ReadOnly: true,
    };

    let configValues = config.getAll();
    let showRawConfig = location.hostname === 'localhost' ? true : false;
    let overrideToggles = { memoryOverride: false, hasLogonCommand: false, hasMappedFolders: false };
    // folders being edited
    let touchedFolders = [];
    let memoryErrMsgEl: HTMLParagraphElement;
    let configFileName = '';
    let configFormat: 'JSON' | 'XML' = 'JSON';

    onMount(() => {
        config.onChange((updatedConfig) => {
            configValues = updatedConfig;
        });

        if (toEditConfig) {
            try {
                const parsedCfg = config.parse(toEditConfig);

                overrideToggles = {
                    memoryOverride: parsedCfg.MemoryInMB > 0,
                    hasLogonCommand: !!parsedCfg.LogonCommand.Command,
                    hasMappedFolders: !!parsedCfg.MappedFolders.length,
                };

                config.update(parsedCfg);
                localStorage.removeItem('to-edit-cfg');
            } catch (error) {
                alert(error.message);
            }
        }
    });

    const handleFormChange = (ev: Event & { currentTarget: EventTarget & HTMLFormElement }) => {
        const t = ev.target as any;
        const name = t.name;
        const value = t.type == 'checkbox' ? t.checked : t.value;

        switch (name) {
            case 'folder': {
                const { folderIdx, folderKey } = t.dataset;
                const folder = configValues.MappedFolders[folderIdx];

                if (!folder) return;

                folder[folderKey] = typeof value === 'boolean' ? value : value.trim();

                configValues = config.getAll();
                return;
            }

            case 'memoryOverride':
            case 'hasLogonCommand':
            case 'hasMappedFolders': {
                overrideToggles[name] = value;

                if (name === 'hasMappedFolders') {
                    if (value) {
                        if (touchedFolders.length) {
                            touchedFolders.forEach((f) => config.addMappedFolder(f));
                            touchedFolders = [];
                        } else {
                            config.addMappedFolder(defaultFolder);
                        }
                    } else {
                        touchedFolders = configValues.MappedFolders;
                        config.removeAllMappedFolders();
                    }
                }
                return;
            }

            case 'LogonCommand':
                config.setLogonCommand(value as string);
                return;

            case 'MemoryInMB': {
                let num = +value;

                if (Number.isNaN(num)) {
                    memoryErrMsgEl.textContent = 'Memory should be a number';
                    console.error('Memory should be a number');
                    return;
                }

                /// 512??
                if (num < 512) {
                    memoryErrMsgEl.textContent =
                        "INFO: Memory will be automatically increased to the required minimum if it's insufficient to boot the sandbox.";
                    console.info(
                        "INFO: Memory will be automatically increased to the required minimum if it's insufficient to boot the sandbox."
                    );
                } else {
                    memoryErrMsgEl.textContent = '';
                }

                config.setMemoryBytes(num);
                return;
            }

            default:
                config.toggleOption(name as ToggleOptions, value);
        }
    };

    const addFolderMapping = () => {
        config.addMappedFolder(defaultFolder);
    };

    const removeFolderMapping = (idx: number) => {
        config.removeMappedFolder(idx);

        if (!configValues.MappedFolders.length) {
            overrideToggles.hasMappedFolders = false;
        }
    };

    const omitEmptyValues = (cfg: Partial<WSBConfiguration>) => {
        const exportObj = {
            ...cfg,
            LogonCommand: { ...cfg.LogonCommand },
        } as Partial<WSBConfiguration>;

        delete exportObj.MappedFolders;

        if (!exportObj.LogonCommand?.Command || !overrideToggles.hasLogonCommand) {
            delete exportObj.LogonCommand;
        }

        if ('MemoryInMB' in exportObj && exportObj.MemoryInMB < 1) {
            delete exportObj.MemoryInMB;
        }

        if (cfg.MappedFolders && cfg.MappedFolders.length) {
            const folders = configValues.MappedFolders.map((f) => ({ MappedFolder: f })).filter((f) => {
                return f.MappedFolder.HostFolder && f.MappedFolder.SandboxFolder;
            });

            if (folders.length) {
                (exportObj as any).MappedFolders = folders;
            }
        }

        for (const opt of toggleOptions) {
            const value = exportObj[opt];
            exportObj[opt] = value ? 'Enable' : 'Disable';
        }

        return exportObj;
    };

    const convertToXML = (cfg: Partial<WSBConfiguration>) => {
        return toXML({ Configuration: omitEmptyValues(cfg) }, { header: false, indent: '  ' });
    };

    const exportConfig = () => {
        try {
            const xmlStr = convertToXML(validateConfig(configValues));
            const fileName = configFileName
                ? configFileName.endsWith('.wsb')
                    ? configFileName
                    : `${configFileName}.wsb`
                : 'config.wsb';

            const dlBtn = document.createElement('a');
            const dataURI = 'data:application/octet-stream;charset=utf-8,' + encodeURIComponent(xmlStr);
            dlBtn.setAttribute('href', dataURI);
            dlBtn.setAttribute('download', fileName);
            dlBtn.style.display = 'none';
            document.body.appendChild(dlBtn);

            dlBtn.click();
            dlBtn.remove();
        } catch (error) {
            alert('Validation err: ' + error.message);
        }
    };

    $: rawConfig = configFormat === 'JSON' ? JSON.stringify(configValues, null, 2) : convertToXML(configValues);
</script>

<div class="config-editor">
    <div class="config-name">
        <span class="text-2xl" style="font-weight: 500;">Config Editor</span>
        <input
            type="text"
            style="margin-top: 1rem; display: block; width: 100%;"
            placeholder="Set config file name"
            title="Change config file name when downloading"
            bind:value={configFileName}
        />
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
                bind:value={configFormat}
            >
                <option value="JSON" selected>JSON</option>
                <option value="XML">XML</option>
            </select>
        </div>
        <pre class="config-preview">
            {rawConfig}
        </pre>
    {/if}

    <form id="config-editor-form" on:change={handleFormChange} on:submit|preventDefault={exportConfig}>
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
            <div style="padding-left: 15px; border-left: 3px solid var(--c-primary);">
                {#each configValues.MappedFolders as folder, idx}
                    <div>
                        <h4 style="margin-top: 1rem; font-weight: normal;">#{idx + 1}</h4>
                        <div style="margin: 2rem 0;" class="form-group center-items">
                            <span class="text-lg">Read only</span>
                            <label class="switch">
                                <input
                                    type="checkbox"
                                    data-folder-idx={idx}
                                    data-folder-key="ReadOnly"
                                    name="folder"
                                    checked={folder.ReadOnly}
                                />
                                <span />
                            </label>
                        </div>

                        <div>
                            <div style="margin: 2rem 0;">
                                <span style="display: block; margin-bottom: 1.75rem;" class="text-lg">Host Folder</span>
                                <div style="margin-top: 0;" class="form-group center-items form-input">
                                    <input
                                        type="text"
                                        name="folder"
                                        placeholder="C:\Users\John\Desktop\HostFolder"
                                        data-folder-idx={idx}
                                        data-folder-key="HostFolder"
                                        value={folder.HostFolder}
                                    />
                                </div>
                            </div>

                            <div style="margin: 2rem 0;">
                                <span style="display: block; margin-bottom: 1.75rem;" class="text-lg"
                                    >Sandbox Folder</span
                                >
                                <div style="margin-top: 0;" class="form-group center-items form-input">
                                    <input
                                        type="text"
                                        name="folder"
                                        placeholder="C:\Users\WDAGUtilityAccount\Desktop\Sandbox"
                                        data-folder-idx={idx}
                                        data-folder-key="SandboxFolder"
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
            <span for="cClipboardRedirection" class="text-lg">Clipboard Redirection</span>
            <label class="switch">
                <input
                    id="cClipboardRedirection"
                    name="ClipboardRedirection"
                    type="checkbox"
                    checked={configValues.ClipboardRedirection}
                />
                <span />
            </label>
        </div>

        <div class="form-group center-items">
            <span for="cProtectedClient" class="text-lg">Protected Client</span>
            <label class="switch">
                <input
                    id="cProtectedClient"
                    name="ProtectedClient"
                    type="checkbox"
                    checked={configValues.ProtectedClient}
                />
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
                    <input
                        id="cMemoryOverride"
                        name="memoryOverride"
                        type="checkbox"
                        checked={overrideToggles.memoryOverride}
                    />
                    <span />
                </label>
            </div>

            {#if overrideToggles.memoryOverride}
                <input
                    class="form-input"
                    style="width: 100%; margin-top: 1rem;"
                    name="MemoryInMB"
                    type="number"
                    min="0"
                    value={configValues.MemoryInMB}
                />

                <p bind:this={memoryErrMsgEl} class="info-msg" />
            {/if}
        </div>

        <div>
            <label>
                <button class="btn btn--primary btn--pressdown" style="width: 100%; margin: 1.5rem 0;" type="submit">
                    ✅ Export WSB configuration (XML)
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

    .config-preview {
        border-left: 3px solid var(--c-primary);
        padding-left: 10px;
        padding-top: 10px;
        padding-bottom: 10px;
        background: var(--c-secondary);
        overflow-x: auto;
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

    .info-msg {
        color: var(--c-primary);
        font-weight: 500;
    }
</style>
