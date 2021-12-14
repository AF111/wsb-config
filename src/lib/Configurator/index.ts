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

interface ICreateWSBConfig {
	toggleOption(name: ToggleOptions, newValue?: boolean): ICreateWSBConfig;
	setLogonCommand(command: string): ICreateWSBConfig;
	setMemoryBytes(mBytes: number): ICreateWSBConfig;
	addMappedFolder(folder: MappedFolder): ICreateWSBConfig;
	removeMappedFolder(idx: number): ICreateWSBConfig;
	getAll(): WSBConfiguration;
}

export const createWSBConfig = (): ICreateWSBConfig => {
	const config: Partial<WSBConfiguration> = {
		AudioInput: true,
		VideoInput: false,
		ClipboardRedirection: true,
		vGpu: true,
		ProtectedClient: false,
		PrinterRedirection: false,
		Networking: true,
	};

	return {
		toggleOption(name: ToggleOptions, newValue?: boolean) {
			if (typeof newValue === 'boolean') {
				config[name] = newValue;
			} else {
				const currentValue = config[name] ?? false;
				config[name] = !!currentValue;
			}
			return this;
		},
		setLogonCommand(command: string) {
			if (!command) {
				delete config.LogonCommand;
				return this;
			}

			config.LogonCommand = {
				Command: command,
			};
			return this;
		},
		setMemoryBytes(mBytes: number) {
			if (!mBytes) {
				delete config.MemoryInMB;
				return this;
			}
			config.MemoryInMB = mBytes;
			return this;
		},
		addMappedFolder(folder: MappedFolder) {
			const mappedFolders = config.MappedFolders || [];
			config.MappedFolders = [...mappedFolders, folder];
			return this;
		},
		removeMappedFolder(idx: number) {
			const mappedFolders = config.MappedFolders || [];

			if (!mappedFolders[idx]) {
				return;
			}

			config.MappedFolders = mappedFolders.filter((_, i) => i !== idx);
			return this;
		},
		getAll() {
			return {
				vGpu: config.vGpu ?? true,
				AudioInput: config.AudioInput ?? true,
				VideoInput: config.VideoInput ?? false,
				Networking: config.Networking ?? true,
				MemoryInMB: config.MemoryInMB ?? 0,
				MappedFolders: config.MappedFolders ?? ([] as MappedFolder[]),
				PrinterRedirection: config.PrinterRedirection ?? false,
				ClipboardRedirection: config.ClipboardRedirection ?? true,
				ProtectedClient: config.ProtectedClient ?? false,
				LogonCommand: config.LogonCommand ?? { Command: '' },
			};
		},
	};
};
