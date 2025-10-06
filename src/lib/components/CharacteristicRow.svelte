<script>
  import Textfield from '@smui/textfield';
  import Checkbox from '@smui/checkbox';
  import FormField from '@smui/form-field';

  export let name;
  export let abbreviation;
  export let initialStore;
  export let advancesStore;
  export let modifiersStore;
  export let currentStore;
  export let careerStore;
</script>

<tr>
  <td class="char-name">{name} ({abbreviation})</td>
  <td class="char-career">
    <FormField>
      <Checkbox bind:checked={$careerStore} />
    </FormField>
  </td>
  <td class="char-value">
    <Textfield type="number" bind:value={$initialStore} />
  </td>
  <td class="char-value">
    <Textfield type="number" bind:value={$advancesStore} />
  </td>
  <td class="char-readonly">{$modifiersStore}</td>
  <td class="char-current">{$currentStore}</td>
</tr>

<style>
  .char-name {
    font-weight: bold;
    white-space: nowrap;
    text-align: left;
  }

  .char-career {
    width: 4rem;
  }

  .char-value {
    width: 5rem;
  }

  .char-readonly {
    color: var(--mdc-theme-text-secondary-on-background, #999);
  }

  .char-current {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--mdc-theme-primary, #6200ee);
  }

  td {
    padding: 0.5rem;
    text-align: center;
    border-bottom: 1px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.12));
  }
</style>
