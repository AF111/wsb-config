export const darkModeMQ = window.matchMedia('(prefers-color-scheme: dark)');
export const supportsDarkMode = window.matchMedia('(prefers-color-scheme)').media !== 'not all';
export type Theme = 'system' | 'dark' | 'light';

const themes = ['system', 'light', 'dark'];

/**
 * @description Gets the persisted theme
 * @returns {Theme}
 */
export const getCurrentTheme = (): Theme => {
    return (localStorage.getItem('app-theme') as Theme) ?? 'system';
};

/**
 * @description Returns theme style: dark if supported or light
 * @returns {('dark' | 'light')}
 */
export const getThemeStyle = (): Exclude<Theme, 'system'> => {
    const currentTheme = getCurrentTheme();

    switch (currentTheme) {
        case 'dark':
            return supportsDarkMode ? 'dark' : 'light';
        case 'light':
            return 'light';

        default:
            return supportsDarkMode && darkModeMQ.matches ? 'dark' : 'light';
    }
};

const logTheme = (sys: boolean, ...args: string[]) => {
    console.log('🌟 Theme changed to:', ...args, sys ? '(system)' : '(user)');
};

/**
 * @param {Theme} theme to change to
 * @returns {void}
 */
export const changeTheme = (theme?: Theme): void => {
    if (!supportsDarkMode || !themes.includes(theme)) return;

    localStorage.setItem('app-theme', theme);
    const themeStyle = getThemeStyle();

    if (themeStyle === 'dark') {
        document.body.classList.add('themed--dark');
        logTheme(theme === 'system', 'dark');
    } else {
        document.body.classList.remove('themed--dark');
        logTheme(theme === 'system', 'light');
    }
};
