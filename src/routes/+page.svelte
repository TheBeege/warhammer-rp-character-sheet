<script>
  import Select, { Option } from '@smui/select';
  import Textfield from '@smui/textfield';
  import {
    characterName,
    characterSpecies,
    characterGender,
    characterAge,
    characterHeight,
    characterHair,
    characterEyes,
    characterBirthday,
    characterBirthplace,
    psycheReligion,
    psycheMotivation,
    psychePsychology,
    psycheShortAmbition,
    psycheLongAmbition,
    careerClass,
    careerCareer,
    careerTier,
    careerStatus,
    partyName,
    partyHeadquarters,
    partyShortAmbition,
    partyLongAmbition,
    experienceCurrent,
    experienceSpent,
    experienceTotal
  } from '$lib/stores/character.js';
  import EditableListTable from '$lib/components/EditableListTable.svelte'
</script>

<div class="section-column">
  <section>
    <h2>Character Overview</h2>
    <hr>
    <form>
      <fieldset>
        <legend>Basic Attributes</legend>
        <div class="field">
          <Textfield 
            type="text"
            id="name"
            name="character_name"
            label="Name"
            bind:value={$characterName}
          />
        </div>
        <div class="field">
          <Select bind:value={$characterSpecies} label="Species" id="species" name="character_species">
            <Option value="human">Human</Option>
            <Option value="dwarf">Dwarf</Option>
            <Option value="elf">Elf</Option>
            <Option value="halfling">Halfling</Option>
          </Select>
        </div>
        <div class="field">
          <Select bind:value={$characterGender} label="Gender" id="gender" name="character_gender">
            <Option value="male">Male</Option>
            <Option value="female">Female</Option>
            <Option value="other">Other</Option>
          </Select>
        </div>
      </fieldset>
      <fieldset>
        <legend>Physical Attributes</legend>
        <div class="field">
          <Textfield 
            type="number"
            id="age"
            name="character_age"
            label="Age"
            bind:value={$characterAge}
          />
        </div>
        <div class="field">
          <Textfield 
            type="number"
            id="height"
            name="character_height"
            label="Height"
            suffix="cm"
            bind:value={$characterHeight}
          />
          <!-- TODO: height string constraints -->
          <!-- TODO: switch between imperial and metric -->
        </div>
        <div class="field">
          <Textfield 
            type="text"
            id="hair"
            name="character_hair"
            label="Hair"
            bind:value={$characterHair}
          />
        </div>
        <div class="field">
          <Textfield 
            type="text"
            id="eyes"
            name="character_eyes"
            label="Eyes"
            bind:value={$characterEyes}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend>Origins</legend>
        <div class="field">
          <Textfield 
            type="text"
            id="birthday"
            name="character_birthday"
            label="Birthday"
            bind:value={$characterBirthday}
          />
        </div>
        <div class="field">
          <Textfield 
            type="text"
            id="birthplace"
            name="character_birthplace"
            label="Nationality/Birthplace"
            bind:value={$characterBirthplace}
          />
        </div>
      </fieldset>
    </form>
  </section>
  <section>
    <h2>Psyche</h2>
    <hr>
    <form>
      <fieldset>
        <legend>Drivers</legend>
        <div class="field">
          <Textfield 
            type="text"
            id="religion"
            name="psyche_religion"
            label="Religion/Deity"
            bind:value={$psycheReligion}
          />
        </div>
        <div class="field">
          <Textfield 
            type="text"
            id="motivation"
            name="psyche_motivation"
            label="Motivation (Resilience)"
            bind:value={$psycheMotivation}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend>Psychology</legend>
        <div class="field">
          <Textfield 
            type="text"
            id="psychology"
            name="psyche_psychology"
            label="Psychology"
            bind:value={$psychePsychology}
          />
        </div>
        <!-- TODO: Allow many inputs -->
      </fieldset>
      <fieldset>
        <legend>Ambitions</legend>
        <div class="field">
          <Textfield 
            textarea
            id="short-ambition"
            name="psyche_short-ambition"
            label="Short-Term Ambition"
            bind:value={$psycheShortAmbition}
          />
        </div>
        <div class="field">
          <Textfield 
            textarea
            id="long-ambition"
            name="psyche_long-ambition"
            label="Long-Term Ambition"
            bind:value={$psycheLongAmbition}
          />
        </div>
      </fieldset>
    </form>
  </section>
</div>
<div class="section-column">
  <section>
    <h2>Career</h2>
    <hr>
    <form>
      <fieldset>
        <legend>Career</legend>
        <div class="field">
          <Select label="Class" id="class" name="career_class" bind:value={$careerClass}>
            <Option value="academic">Academic</Option>
            <Option value="burgher">Burgher</Option>
            <Option value="courtier">Courtier</Option>
            <Option value="peasant">Peasant</Option>
            <Option value="ranger">Ranger</Option>
            <Option value="riverfolk">Riverfolk</Option>
            <Option value="rogue">Rogue</Option>
            <Option value="warrior">Warrior</Option>
          </Select>
        </div>
        <div class="field">
          <Select label="Career" id="career" name="career_career" bind:value={$careerCareer}>
            <Option value="">Not yet, sorry</Option>
            <!-- TODO: this -->
          </Select>
        </div>
        <div class="field">
          <Select label="Career Tier/Level" id="tier" name="career_tier" bind:value={$careerTier}>
            <Option value="">Not yet, sorry</Option>
            <!-- TODO: this -->
          </Select>
        </div>
        <div class="field">
          <Textfield 
            type="text"
            id="status"
            name="career_status"
            label="Status"
            bind:value={$careerStatus}
          />
          <!-- TODO: find a better way to handle status -->
        </div>
      </fieldset>
    </form>
  </section>
  <section>
    <h2>Party</h2>
    <hr>
    <form>
      <fieldset>
        <legend>Basics</legend>
        <div class="field">
          <Textfield 
            type="text"
            id="party-name"
            name="party_name"
            label="Name"
            bind:value={$partyName}
          />
        </div>
        <div class="field">
          <Textfield 
            type="text"
            id="headquarters"
            name="party_headquarters"
            label="Headquarters"
            bind:value={$partyHeadquarters}
          />
        </div>
      </fieldset>
      <fieldset>
        <legend>Members</legend>
        <EditableListTable persistenceKeyPrefix="party_members" />
      </fieldset>
      <fieldset>
        <legend>Ambitions</legend>
        <div class="field">
          <Textfield 
            textarea
            id="party-short-ambition"
            name="party_short-ambition"
            label="Short-Term Ambition"
            bind:value={$partyShortAmbition}
          />
        </div>
        <div class="field">
          <Textfield 
            textarea
            id="party-long-ambition"
            name="party_long-ambition"
            label="Long-Term Ambition"
            bind:value={$partyLongAmbition}
          />
        </div>
      </fieldset>
    </form>
  </section>
</div>
<div class="section-column">
  <section>
    <h2>Experience</h2>
    <hr>
    <form>
      <fieldset>
        <legend>Experience</legend>
        <div class="field">
          <Textfield 
            type="number"
            id="current"
            name="experience_current"
            label="Current/Unspent"
            bind:value={$experienceCurrent}
          />
        </div>
        <div class="field">
          <Textfield 
            type="number"
            id="spent"
            name="experience_spent"
            label="Spent"
            bind:value={$experienceSpent}
          />
        </div>
        <div class="field">
          <Textfield 
            disabled
            type="number"
            id="total"
            name="experience_total"
            label="Total"
            bind:value={$experienceTotal}
          />
        </div>
      </fieldset>
    </form>
  </section>
</div>
