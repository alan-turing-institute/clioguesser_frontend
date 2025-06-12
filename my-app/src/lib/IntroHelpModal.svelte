<script lang="ts">  
    import { createEventDispatcher, onMount } from 'svelte';

    const dispatch = createEventDispatcher();
    export let show: boolean;

    function closeModal(): void {
        show = false;
        dispatch('close');
    }

    // // Optional: Close modal with Escape key
    // function handleKeydown(event: KeyboardEvent): void {
    //     if (event.key === 'Escape') closeModal();
    // }

    // onMount(() => {
    //     window.addEventListener('keydown', handleKeydown);
    //     return () => window.removeEventListener('keydown', handleKeydown);
    // });
    
</script>

{#if show}
    <div class="modal-backdrop">
        <div class="modal-content" role="dialog" aria-modal="true" aria-label="How to Play">
            <button class="close-btn" on:click={closeModal} aria-label="Close">&times;</button>
            <h2>How to Play Clioguesser</h2>
                <ol>
                    <!-- <li>You will be shown 10 maps from {formatYear(min_year)} to {formatYear(max_year)}.</li> -->
                    <li>Use the polity outlines to guess the age of the map.</li>
                    <li>Submit your guess to see how close you are.</li>
                    <li>You can use hints if you get stuck, but each hint reduces your score!</li>
                    <li>To use a hint, click on a polity to show the name.</li>
                </ol>
        </div>
    </div>
     
    <!-- <div class="modal-backdrop">
        <div class="modal-content">
            <h2>How to Play Clioguesser</h2>
            <ol>
                <p>You will be shown 10 maps from {formatYear(min_year)} to {formatYear(max_year)}.</p>
                <p>Use the polity outlines to guess the age of the map.</p>
                <p>Submit your guess to see how close you are.</p>
                <p>You can use hints if you get stuck, but each hint reduces your score!</p>
                <p>To use a hint, click on a polity to show the name.</p>
            </ol>
        </div>
    </div> -->
{/if}

<style>
    .modal-backdrop {
        position: fixed;
        inset: 0;
        background: rgba(0,0,0,0.4);
        z-index: 1000;
    }
    .modal-content {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: #fff;
        padding: 2rem 2.5rem;
        border-radius: 30px;
        box-shadow: 0 4px 32px rgba(0,0,0,0.2);
        z-index: 1001;
        max-width: 90vw;
        width: 800px;
    }
    /* .close-btn {
        position: absolute;
        top: 1rem;
        right: 1.2rem;
        background: none;
        border: none;
        font-size: 1.5rem;
        cursor: pointer;
        color: #888;
    } */
    h2 {
        font-size: 2.5rem;
		margin: 3rem 0 2rem 0;
		letter-spacing: 0.15em;
		text-align: center;
    }
    ol {
        margin: 1rem 0 0 1.2rem;
        padding: 0;
        text-align: left;
    }
</style>