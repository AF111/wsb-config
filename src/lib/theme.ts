export const darkModeMQ = window.matchMedia('(prefers-color-scheme: dark)');
export const supportsDarkMode = window.matchMedia('(prefers-color-scheme)').media !== 'not all';
export type Theme = 'system' | 'dark' | 'light';

const themes = ['system', 'light', 'dark'];

export const getCurrentTheme = (): Theme => {
	let persistedTheme = localStorage.getItem('app-theme') as Theme | null;

	if (persistedTheme) {
		if (!themes.includes(persistedTheme)) {
			return darkModeMQ.matches ? 'dark' : 'light';
		}
		return persistedTheme;
	}

	return darkModeMQ.matches ? 'dark' : 'light';
};

const logTheme = console.log.bind(console, '🌟 Theme changed to:');

export const changeTheme = (theme?: Theme) => {
	if (!supportsDarkMode || !themes.includes(theme)) return;

	if (theme === 'system') {
		if (darkModeMQ.matches) {
			document.body.classList.add('themed--dark');
			logTheme('system default (dark)');
		} else {
			document.body.classList.remove('themed--dark');
			logTheme('system default (light)');
		}
		localStorage.setItem('app-theme', theme);
		return;
	}

	localStorage.setItem('app-theme', theme);
	if (theme === 'dark') {
		document.body.classList.add('themed--dark');
		logTheme('dark');
	} else {
		document.body.classList.remove('themed--dark');
		logTheme('light');
	}
};
