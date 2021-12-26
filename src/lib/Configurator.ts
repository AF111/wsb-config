export interface MappedFolder {
    ReadOnly?: boolean;
    HostFolder: string;
    SandboxFolder: string;
}

interface LogonCommand {
    Command: string;
}

export interface WSBConfiguration {
    /**
     * @default {boolean} true
     * @description vGpu (virtualized GPU): Enable or disable the virtualized GPU.
     * If vGPU is disabled, the sandbox will use Windows Advanced Rasterization Platform (WARP).
     */
    vGpu: boolean;
    /**
     * @default {boolean} true
     * @description Networking: Enable or disable network access within the sandbox.
     */
    Networking: boolean;
    /**
     * @default {Array}
     * @description Mapped folders: Share folders from the host with read or write permissions.
     * Note that exposing host directories may allow malicious software to affect the system or steal data.
     */
    MappedFolders: MappedFolder[];
    /**
     * @default {Object}
     * @description Logon command: A command that's executed when Windows Sandbox starts.
     */
    LogonCommand: LogonCommand;
    /**
     * @default {boolean} true
     * @description Audio input: Shares the host's microphone input into the sandbox.
     */
    AudioInput: boolean;
    /**
     * @default {boolean} false
     * @description Video input: Shares the host's webcam input into the sandbox.
     */
    VideoInput: boolean;
    /**
     * @default {boolean} false
     * @description Protected client: Places increased security settings on the RDP session to the sandbox.
     */
    ProtectedClient: boolean;
    /**
     * @default {boolean} false
     * @description Printer redirection: Shares printers from the host into the sandbox.
     */
    PrinterRedirection: boolean;
    /**
     * @default {boolean} true
     * @description Clipboard redirection: Shares the host clipboard with the sandbox so that text and files can be pasted back and forth.
     */
    ClipboardRedirection: boolean;
    /**
     * @default {String}
     * @description Memory in MB: The amount of memory, in megabytes, to assign to the sandbox. If the memory value specified is insufficient to boot a sandbox, it will be automatically increased to the required minimum amount.
     */
    MemoryInMB: number;
}

export type KWSBConfiguration = keyof WSBConfiguration;
export type ToggleOptions = Exclude<KWSBConfiguration, 'LogonCommand' | 'MappedFolders' | 'MemoryInMB'>;

interface IonChangeCallback {
    (config: WSBConfiguration): void;
}

interface ICreateWSBConfig {
    parse(config: any): WSBConfiguration;
    update(cfg: WSBConfiguration): void;
    toggleOption(name: ToggleOptions, newValue?: boolean): ICreateWSBConfig;
    setLogonCommand(command: string): ICreateWSBConfig;
    setMemoryBytes(mBytes: number): ICreateWSBConfig;
    addMappedFolder(folder: MappedFolder): ICreateWSBConfig;
    removeMappedFolder(idx: number): ICreateWSBConfig;
    removeAllMappedFolders(): void;
    onChange(cb: IonChangeCallback): void;
    getAll(): WSBConfiguration;
}

const WIN_PATH_REGEX = /(^[a-zA-Z]:|\\)\\(((?![<>:"\/\\|?*]).)+((?<![ .])\\)?)*$/i;
export const isValidWinAbsPath = (path: string) => WIN_PATH_REGEX.test(path);

export const validateConfig = (config: WSBConfiguration): WSBConfiguration => {
    const configKeys = Object.keys(config);
    const toggleableKeys = [
        'AudioInput',
        'VideoInput',
        'ClipboardRedirection',
        'vGpu',
        'ProtectedClient',
        'PrinterRedirection',
        'Networking',
    ];

    for (const key of configKeys) {
        const value = config[key];

        switch (key) {
            // cannot set non number value using setMemoryBytes method, skip
            case 'MemoryInMB':
                break;

            case 'MappedFolders':
                for (const folder of value) {
                    if (!isValidWinAbsPath(folder.HostFolder)) {
                        throw new TypeError('Mapped Folder: HostFolder is not a valid windows absolute path');
                    }

                    if (!isValidWinAbsPath(folder.SandboxFolder)) {
                        throw new TypeError('Mapped Folder: SandboxFolder is not a valid windows absolute path');
                    }

                    if (typeof folder.ReadOnly !== 'boolean') {
                        throw new TypeError('Mapped Folder: ReadOnly must be a boolean');
                    }
                }

                break;

            case 'LogonCommand':
                if (typeof value !== 'object') {
                    throw new Error('LogonCommand must be an object');
                }

                if (Object.keys(value).length > 1) {
                    throw new Error('"LogonCommand" object must only contain a "Command" property');
                }

                if (typeof value.Command !== 'string') {
                    throw new Error('"LogonCommand.Command" must be a string');
                }

                break;

            default:
                if (!toggleableKeys.includes(key)) {
                    throw new TypeError(`unknown config property "${key}"`);
                }
                if (typeof value !== 'boolean') {
                    throw new TypeError(`${key} must be a boolean`);
                }
                break;
        }
    }

    return config;
};

const xmlParser = (cfg: string) => {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(cfg, 'text/xml');

    const tryAsBoolValue = (selector: string, doc: Document | Element = xmlDoc): boolean | undefined => {
        const value = doc.querySelector(selector)?.textContent;

        if (value !== 'true' && value !== 'false') return undefined;

        return value === 'true' ? true : false;
    };

    const getMappedFolders = (): MappedFolder[] =>
        [...xmlDoc.querySelectorAll('MappedFolders MappedFolder')].map((node) => ({
            HostFolder: node.querySelector('HostFolder')?.textContent ?? '',
            SandboxFolder: node.querySelector('SandboxFolder')?.textContent ?? '',
            ReadOnly: tryAsBoolValue('ReadOnly', node) ?? false,
        }));

    let memoryInMB = 0;
    let _memoryInMB = +xmlDoc.querySelector('MemoryInMB')?.textContent;

    if (!Number.isNaN(_memoryInMB) && _memoryInMB > 1000) {
        memoryInMB = Math.abs(_memoryInMB);
    }

    return {
        AudioInput: tryAsBoolValue('AudioInput') ?? true,
        VideoInput: tryAsBoolValue('VideoInput') ?? false,
        ClipboardRedirection: tryAsBoolValue('ClipboardRedirection') ?? true,
        vGpu: tryAsBoolValue('vGpu') ?? true,
        ProtectedClient: tryAsBoolValue('ProtectedClient') ?? false,
        PrinterRedirection: tryAsBoolValue('PrinterRedirection') ?? false,
        Networking: tryAsBoolValue('Networking') ?? true,
        MemoryInMB: memoryInMB,
        MappedFolders: getMappedFolders(),
        LogonCommand: { Command: xmlDoc.querySelector('LogonCommand')?.textContent?.trim() ?? '' },
    };
};

export const createWSBConfig = (): ICreateWSBConfig => {
    let config: WSBConfiguration = {
        AudioInput: true,
        VideoInput: false,
        ClipboardRedirection: true,
        vGpu: true,
        ProtectedClient: false,
        PrinterRedirection: false,
        Networking: true,
        MemoryInMB: 0,
        MappedFolders: [] as MappedFolder[],
        LogonCommand: { Command: '' },
    };

    let onChangeCB: IonChangeCallback;

    const emitChange = () => {
        if (!onChangeCB) return;

        console.log('emit(config:change)', config);
        onChangeCB(config);
    };

    return {
        parse(cfg: any) {
            let parsedConfig: WSBConfiguration;

            try {
                parsedConfig = JSON.parse(cfg);
            } catch (error) {
                // as xml
                parsedConfig = xmlParser(cfg);
            }

            return validateConfig(parsedConfig);
        },
        update(cfg: WSBConfiguration) {
            config = validateConfig(cfg);
            emitChange();
        },
        getAll() {
            return config;
        },
        onChange(cb: IonChangeCallback): void {
            if (typeof cb === 'function') {
                onChangeCB = cb;
            }
        },
        toggleOption(optName: ToggleOptions, newValue?: boolean) {
            if (typeof newValue === 'boolean') {
                config[optName as any] = newValue;
            } else {
                const currentValue = config[optName as any] ?? false;
                config[optName as any] = !!currentValue;
            }
            emitChange();
            return this;
        },
        setLogonCommand(command: string) {
            config.LogonCommand = {
                Command: command.toString(),
            };
            emitChange();
            return this;
        },
        setMemoryBytes(mBytes: number) {
            mBytes = +mBytes;

            if (Number.isNaN(mBytes)) {
                return this;
            }

            config.MemoryInMB = mBytes;
            emitChange();
            return this;
        },
        addMappedFolder(folder: MappedFolder) {
            if (typeof folder.HostFolder !== 'string' && typeof folder.SandboxFolder !== 'string') {
                throw new TypeError('Folder mappings for both the Host and Sandbox must be a strings');
            }

            if (typeof folder.ReadOnly !== 'boolean') {
                throw new TypeError('ReadOnly must be a boolean');
            }

            config.MappedFolders.push({
                HostFolder: folder.HostFolder,
                SandboxFolder: folder.SandboxFolder,
                ReadOnly: folder.ReadOnly,
            });

            emitChange();

            return this;
        },
        removeMappedFolder(idx: number) {
            config.MappedFolders = config.MappedFolders.filter((_, folderIdx) => folderIdx !== idx);
            emitChange();

            return this;
        },
        removeAllMappedFolders(): void {
            config.MappedFolders = [];
            emitChange();

            return this;
        },
    };
};
