<script lang="ts">
    import { onMount } from 'svelte';
    import AddFileImg from '../assets/images/add-files.svg';
    import EditFileImg from '../assets/images/edit-files.svg';

    import { Link, navigate } from 'svelte-routing';

    let importConfigInput: HTMLInputElement;

    onMount(() => {
        importConfigInput.addEventListener('change', (ev) => {
            const t = ev.target as HTMLInputElement;

            const reader = new FileReader();

            reader.addEventListener(
                'load',
                () => {
                    // this will then display a text file
                    localStorage.setItem('to-edit-cfg', reader.result as string);
                    navigate('/edit');
                },
                false
            );

            reader.readAsText(t.files.item(0));
        });
    });

    const openFilePicker = () => {
        importConfigInput.click();
    };
</script>

<div class="main-screen">
    <div class="main-screen__card" on:click={openFilePicker}>
        <img src={AddFileImg} alt="edit existing config" width="179" height="151" srcset="" />
        <p class="text-2xl">Upload & edit config file</p>
        <input
            bind:this={importConfigInput}
            style="display: none;"
            accept="text/*, .wsb"
            type="file"
            name="importConfog"
        />
    </div>
    <h4 style="margin: 2rem;" class="text-center text-4xl">OR</h4>

    <Link to="/edit">
        <div class="main-screen__card">
            <img src={EditFileImg} alt="create new config" width="179" height="151" srcset="" />
            <p class="text-2xl">Create a new config file</p>
        </div>
    </Link>
</div>

<style>
    .main-screen {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
    }

    .main-screen__card {
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        border-radius: 10px;
        background: var(--c-secondary);
        width: 318px;
        min-height: 252px;
        cursor: pointer;
        transition: box-shadow 100ms linear;
    }

    .main-screen__card:hover {
        box-shadow: 0px 0px 5px 4px rgb(0 0 0 / 16%);
    }

    .main-screen__card img {
        transition: transform 150ms linear;
    }

    .main-screen__card:hover img {
        transform: scale(1.1) rotate(-10deg);
    }

    .main-screen__card:nth-child(2n + 1):hover img {
        transform: scale(1.1) rotate(10deg);
    }

    .main-screen__card p {
        margin-top: 2rem;
    }

    @media screen and (max-width: 325px) {
        .main-screen__card {
            width: 100%;
            padding: 2rem;
            text-align: center;
        }
    }
</style>
