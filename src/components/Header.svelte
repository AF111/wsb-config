<script lang="ts">
    import NavLink from './NavLink.svelte';
    import WSBLogo from '../assets/images/wsb-logo.jpg';
    import TripleStateSwitch from './TripleStateSwitch.svelte';
    import { supportsDarkMode, changeTheme, getCurrentTheme, Theme } from '../lib/theme';

    let defaultTheme = getCurrentTheme();

    const states = [
        {
            title: 'light',
            value: '☀️',
        },
        {
            title: 'system',
            value: '➖',
        },
        {
            title: 'dark',
            value: '🌒',
        },
    ];

    const handleValueChange = (ev: any) => {
        let theme: Theme;

        switch (ev.detail) {
            case '☀️':
                theme = 'light';
                break;
            case '🌒':
                theme = 'dark';
                break;
            default:
                theme = 'system';
        }

        changeTheme(theme);
    };
</script>

<header class="main-header">
    <div class="main-header__top">
        <div class="wsb-logo">
            <img style="border-radius: 2.5px;" src={WSBLogo} width="75" height="75" alt="Windows Sandbox" />
        </div>
        <div>
            <h1 class="text-3xl text-w3">Windows Sandbox Configuration Editor</h1>
        </div>

        {#if supportsDarkMode}
            <TripleStateSwitch on:value={handleValueChange} value={defaultTheme} {states} />
        {/if}
    </div>

    <nav class="container main-header__nav">
        <ul>
            <li class="text-2xl c-primary cursor-pointer">
                <NavLink className="back-btn" to="/">
                    <div style="display: flex; align-items: center;">
                        <span class="arrow left" />
                        Main
                    </div>
                </NavLink>
            </li>
            <li class="text-2xl c-primary cursor-pointer">
                <NavLink to="/configs">
                    <div style="display: flex; align-items: center;">Saved Configs</div>
                </NavLink>
            </li>
        </ul>
    </nav>
</header>

<style>
    .main-header {
        padding: 2rem 0;
        max-width: 30rem;
        margin: 0 auto;
    }

    .main-header__top {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .main-header__nav {
        max-width: 33rem;
    }

    .main-header__top .wsb-logo {
        margin-right: 0.1875rem;
    }

    .main-header__nav {
        margin-top: 3rem;
    }

    .main-header__nav ul {
        list-style: none;
        margin: 0;
        padding: 0;
        display: flex;
        justify-content: space-evenly;
    }

    .main-header__nav ul li > a.back-btn.active div span {
        display: none;
    }

    @media screen and (max-width: 490px) {
        .main-header {
            padding: 2rem 0;
        }

        .main-header__top {
            flex-direction: column;
        }

        .main-header__top .wsb-logo {
            margin-right: 0;
        }

        .main-header__top h1 {
            font-size: 1.25rem;
            text-align: center;
        }
    }

    .main-header__top h1 {
        text-align: center;
    }
</style>
