<script>
  import Textfield from '@smui/textfield';
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
    movementRun
  } from '$lib/stores/character.js';
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
    <p>TODO: Fate & Resilience section</p>
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
</style>
