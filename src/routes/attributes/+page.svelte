<script>
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
    characteristicFelCareer
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

  <section>
    <h2>Movement</h2>
    <hr>
    <p>TODO: Movement section</p>
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
</style>
