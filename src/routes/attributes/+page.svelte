<script>
  import Textfield from '@smui/textfield';
  import Button from '@smui/button';
  import CharacteristicRow from '$lib/components/CharacteristicRow.svelte';
  import {
    // Weapon Skill
    characteristicWSInitial,
    characteristicWSAdvances,
    characteristicWSModifiers,
    characteristicWSCurrent,
    characteristicWSCareer,
    // Ballistic Skill
    characteristicBSInitial,
    characteristicBSAdvances,
    characteristicBSModifiers,
    characteristicBSCurrent,
    characteristicBSCareer,
    // Strength
    characteristicSInitial,
    characteristicSAdvances,
    characteristicSModifiers,
    characteristicSCurrent,
    characteristicSCareer,
    // Toughness
    characteristicTInitial,
    characteristicTAdvances,
    characteristicTModifiers,
    characteristicTCurrent,
    characteristicTCareer,
    // Initiative
    characteristicIInitial,
    characteristicIAdvances,
    characteristicIModifiers,
    characteristicICurrent,
    characteristicICareer,
    // Agility
    characteristicAgInitial,
    characteristicAgAdvances,
    characteristicAgModifiers,
    characteristicAgCurrent,
    characteristicAgCareer,
    // Dexterity
    characteristicDexInitial,
    characteristicDexAdvances,
    characteristicDexModifiers,
    characteristicDexCurrent,
    characteristicDexCareer,
    // Intelligence
    characteristicIntInitial,
    characteristicIntAdvances,
    characteristicIntModifiers,
    characteristicIntCurrent,
    characteristicIntCareer,
    // Willpower
    characteristicWPInitial,
    characteristicWPAdvances,
    characteristicWPModifiers,
    characteristicWPCurrent,
    characteristicWPCareer,
    // Fellowship
    characteristicFelInitial,
    characteristicFelAdvances,
    characteristicFelModifiers,
    characteristicFelCurrent,
    characteristicFelCareer,
    // Movement
    movementBase,
    movementModifiers,
    movementEncumbrance,
    movementCurrent,
    movementWalk,
    movementRun,
    // Fate & Resilience
    fate,
    fortune,
    resilience,
    resolve
  } from '$lib/stores/character.js';

  function replenish() {
    $fortune = $fate;
    $resolve = $resilience;
  }
</script>

<div class="section-column">
  <section>
    <h2>Characteristics</h2>
    <hr>
    <table class="characteristics-table">
      <thead>
        <tr>
          <th>Characteristic</th>
          <th>Career</th>
          <th>Initial</th>
          <th>Advances</th>
          <th>Modifiers</th>
          <th>Current</th>
        </tr>
      </thead>
      <tbody>
        <CharacteristicRow
          name="Weapon Skill"
          abbreviation="WS"
          initialStore={characteristicWSInitial}
          advancesStore={characteristicWSAdvances}
          modifiersStore={characteristicWSModifiers}
          currentStore={characteristicWSCurrent}
          careerStore={characteristicWSCareer}
        />
        <CharacteristicRow
          name="Ballistic Skill"
          abbreviation="BS"
          initialStore={characteristicBSInitial}
          advancesStore={characteristicBSAdvances}
          modifiersStore={characteristicBSModifiers}
          currentStore={characteristicBSCurrent}
          careerStore={characteristicBSCareer}
        />
        <CharacteristicRow
          name="Strength"
          abbreviation="S"
          initialStore={characteristicSInitial}
          advancesStore={characteristicSAdvances}
          modifiersStore={characteristicSModifiers}
          currentStore={characteristicSCurrent}
          careerStore={characteristicSCareer}
        />
        <CharacteristicRow
          name="Toughness"
          abbreviation="T"
          initialStore={characteristicTInitial}
          advancesStore={characteristicTAdvances}
          modifiersStore={characteristicTModifiers}
          currentStore={characteristicTCurrent}
          careerStore={characteristicTCareer}
        />
        <CharacteristicRow
          name="Initiative"
          abbreviation="I"
          initialStore={characteristicIInitial}
          advancesStore={characteristicIAdvances}
          modifiersStore={characteristicIModifiers}
          currentStore={characteristicICurrent}
          careerStore={characteristicICareer}
        />
        <CharacteristicRow
          name="Agility"
          abbreviation="Ag"
          initialStore={characteristicAgInitial}
          advancesStore={characteristicAgAdvances}
          modifiersStore={characteristicAgModifiers}
          currentStore={characteristicAgCurrent}
          careerStore={characteristicAgCareer}
        />
        <CharacteristicRow
          name="Dexterity"
          abbreviation="Dex"
          initialStore={characteristicDexInitial}
          advancesStore={characteristicDexAdvances}
          modifiersStore={characteristicDexModifiers}
          currentStore={characteristicDexCurrent}
          careerStore={characteristicDexCareer}
        />
        <CharacteristicRow
          name="Intelligence"
          abbreviation="Int"
          initialStore={characteristicIntInitial}
          advancesStore={characteristicIntAdvances}
          modifiersStore={characteristicIntModifiers}
          currentStore={characteristicIntCurrent}
          careerStore={characteristicIntCareer}
        />
        <CharacteristicRow
          name="Willpower"
          abbreviation="WP"
          initialStore={characteristicWPInitial}
          advancesStore={characteristicWPAdvances}
          modifiersStore={characteristicWPModifiers}
          currentStore={characteristicWPCurrent}
          careerStore={characteristicWPCareer}
        />
        <CharacteristicRow
          name="Fellowship"
          abbreviation="Fel"
          initialStore={characteristicFelInitial}
          advancesStore={characteristicFelAdvances}
          modifiersStore={characteristicFelModifiers}
          currentStore={characteristicFelCurrent}
          careerStore={characteristicFelCareer}
        />
      </tbody>
    </table>
  </section>
</div>

<div class="section-column">
  <section>
    <h2>Movement</h2>
    <hr>
    <div class="movement-container">
      <table class="movement-table">
        <thead>
          <tr>
            <th>Base</th>
            <th>Modifiers</th>
            <th>Enc</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>
              <Textfield type="number" bind:value={$movementBase} />
            </td>
            <td class="movement-readonly">{$movementModifiers}</td>
            <td class="movement-readonly">{$movementEncumbrance}</td>
          </tr>
        </tbody>
      </table>
      <table class="movement-table movement-derived-table">
        <thead>
          <tr>
            <th>Movement</th>
            <th>Walk</th>
            <th>Run</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="movement-current">{$movementCurrent}</td>
            <td class="movement-derived">{$movementWalk} yards</td>
            <td class="movement-derived">{$movementRun} yards</td>
          </tr>
        </tbody>
      </table>
    </div>
  </section>

  <section>
    <h2>Fate & Resilience</h2>
    <hr>
    <div class="fate-resilience-container">
      <div class="fate-group">
        <div class="pool-header">Fate</div>
        <div class="pool-values">
          <div class="pool-item">
            <label for="fate">Fate</label>
            <Textfield class="pool-input" type="number" id="fate" bind:value={$fate} />
          </div>
          <div class="pool-item">
            <label for="fortune">Fortune</label>
            <div class="current-max-wrapper">
              <Textfield class="pool-input" type="number" id="fortune" bind:value={$fortune} />
              <span class="max-indicator">/ {$fate}</span>
            </div>
          </div>
        </div>
      </div>

      <div class="fate-group">
        <div class="pool-header">Resilience</div>
        <div class="pool-values">
          <div class="pool-item">
            <label for="resilience">Resilience</label>
            <Textfield class="pool-input" type="number" id="resilience" bind:value={$resilience} />
          </div>
          <div class="pool-item">
            <label for="resolve">Resolve</label>
            <div class="current-max-wrapper">
              <Textfield class="pool-input" type="number" id="resolve" bind:value={$resolve} />
              <span class="max-indicator">/ {$resilience}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="replenish-button-container">
      <Button variant="raised" onclick={() => replenish()}>
        Replenish Fortune & Resolve
      </Button>
    </div>
  </section>
</div>

<div class="section-column">
  <section>
    <h2>Conditions</h2>
    <hr>
    <p>TODO: Conditions section</p>
  </section>

  <section>
    <h2>Wounds</h2>
    <hr>
    <p>TODO: Wounds section</p>
  </section>
</div>

<div class="section-column">
  <section>
    <h2>Injuries & Diseases</h2>
    <hr>
    <p>TODO: Injuries & Diseases section</p>
  </section>

  <section>
    <h2>Corruption</h2>
    <hr>
    <p>TODO: Corruption section</p>
  </section>
</div>

<style>
  .characteristics-table {
    border-collapse: collapse;
    width: fit-content;
  }

  .characteristics-table th {
    font-weight: bold;
    padding: 0.5rem;
    text-align: center;
    border-bottom: 2px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38));
  }

  .characteristics-table th:first-child {
    text-align: left;
  }

  .characteristics-table td {
    padding: 0.5rem;
    text-align: center;
    border-bottom: 1px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.12));
  }

  /* Movement section styles */
  .movement-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }

  .movement-table {
    border-collapse: collapse;
    width: fit-content;
  }

  .movement-table th {
    font-weight: bold;
    padding: 0.5rem;
    text-align: center;
    border-bottom: 2px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38));
    white-space: nowrap;
  }

  .movement-table td {
    padding: 0.5rem;
    text-align: center;
    width: 5rem;
  }

  .movement-derived-table {
    margin-top: 0.5rem;
  }

  .movement-readonly {
    color: var(--mdc-theme-text-secondary-on-background, #999);
  }

  .movement-current {
    font-size: 1.25rem;
    font-weight: bold;
    color: var(--mdc-theme-primary, #6200ee);
  }

  .movement-derived {
    font-weight: 500;
    color: var(--mdc-theme-secondary, #03dac6);
  }

  /* Fate & Resilience section styles */
  .fate-resilience-container {
    display: flex;
    justify-content: center;
    gap: 2rem;
    margin-bottom: 1rem;
  }

  .fate-group {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }

  .pool-header {
    font-size: 1.1rem;
    font-weight: bold;
    text-align: center;
    padding-bottom: 0.25rem;
    border-bottom: 2px solid var(--mdc-theme-text-hint-on-background, rgba(0, 0, 0, 0.38));
  }

  .pool-values {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .pool-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  .pool-item label {
    font-size: 0.875rem;
    font-weight: 500;
  }

  .current-max-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .max-indicator {
    font-size: 1rem;
    font-weight: 500;
    color: var(--mdc-theme-text-secondary-on-background, #999);
    white-space: nowrap;
  }

  .replenish-button-container {
    display: flex;
    justify-content: center;
    margin-top: 1rem;
  }

  /* Pool input minimal width */
  :global(.pool-input) {
    width: 4rem;
  }
</style>
