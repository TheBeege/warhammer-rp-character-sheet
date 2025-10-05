<script>
    import Button from '@smui/button';
    import { persistedStore } from '$lib/stores/character.js';

    export let persistenceKeyPrefix;

    const itemsStore = persistedStore(`${persistenceKeyPrefix}_items`, '[]');

    // Reactive: parse the store value into an array
    $: currentItems = (() => {
        try {
            return JSON.parse($itemsStore);
        } catch {
            return [];
        }
    })();

    let editingIndex = null;

    function startEdit(index) {
        editingIndex = index;
    }

    function persistEdit(index, event) {
        editingIndex = null;
        const items = [...currentItems];
        items[index] = event.target.textContent;
        itemsStore.set(JSON.stringify(items));
    }

    function handleTextInput(index, event) {
        if (event.key === 'Enter') {
            event.preventDefault();
            event.target.blur();
        } else if (event.key === 'Escape') {
            event.target.textContent = currentItems[index];
            event.target.blur();
        }
    }

    function addListItem() {
        const items = [...currentItems, ''];
        itemsStore.set(JSON.stringify(items));
    }

    function deleteItem(index) {
        const items = currentItems.filter((_, i) => i !== index);
        itemsStore.set(JSON.stringify(items));
    }
</script>

<style>
    table {
        border-collapse: collapse;
        width: 100%;
    }

    td {
        border: 1px solid #ddd;
        padding: 8px;
    }

    /* Optional: Add hover effect */
    tr:hover {
        background-color: #181818;
    }

    .delete-cell {
        width: 1px;
        white-space: nowrap;
    }
</style>

<table>
<tbody>
    {#each currentItems as item, index}
        <tr>
            <td contenteditable
                on:click={() => startEdit(index)}
                on:blur={(event) => persistEdit(index, event)}
                on:keydown={(event) => handleTextInput(index, event)}
                id="{persistenceKeyPrefix}_{index}"
                name="{persistenceKeyPrefix}_{index}"
            >
            {item}</td>
            <td class="delete-cell"><Button on:click={() => deleteItem(index)}>❌</Button></td>
        </tr>
    {/each}
    <tr><td colspan="2"><Button onclick={addListItem}>+</Button></td></tr>
</tbody>
</table>