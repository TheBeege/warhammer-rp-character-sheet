<script>
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
</script>

<div class="section-column">
  <section>
    <h2>Character Overview</h2>
    <hr>
    <form>
      <fieldset>
        <legend>Basic Attributes</legend>
        <div class="field">
          <label for="name">Name</label>
          <input type="text" id="name" name="character_name" bind:value={$characterName} />
        </div>
        <div class="field">
          <label for="species">Species</label>
          <input type="text" id="species" name="character_species" bind:value={$characterSpecies} />
        </div>
        <div class="field">
          <label for="gender">Gender</label>
          <select id="gender" name="character_gender" bind:value={$characterGender}>
            <option value="">Choose...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </div>
      </fieldset>
      <fieldset>
        <legend>Physical Attributes</legend>
        <div class="field">
          <label for="age">Age</label>
          <input type="number" id="age" name="character_age" bind:value={$characterAge} />
        </div>
        <div class="field">
          <label for="height">Height</label>
          <input type="text" id="height" name="character_height" bind:value={$characterHeight} />
          <!-- TODO: height string constraints -->
          <!-- TODO: switch between imperial and metric -->
        </div>
        <div class="field">
          <label for="hair">Hair</label>
          <input type="text" id="hair" name="character_hair" bind:value={$characterHair} />
        </div>
        <div class="field">
          <label for="eyes">Eyes</label>
          <input type="text" id="eyes" name="character_eyes" bind:value={$characterEyes} />
        </div>
      </fieldset>
      <fieldset>
        <legend>Origins</legend>
        <div class="field">
          <label for="birthday">Birthday</label>
          <input type="text" id="birthday" name="character_birthday" bind:value={$characterBirthday} />
        </div>
        <div class="field">
          <label for="birthplace">Nationality/Birthplace</label>
          <input type="text" id="birthplace" name="character_birthplace" bind:value={$characterBirthplace} />
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
          <label for="religion">Religion/Deity</label>
          <input type="text" id="religion" name="psyche_religion" bind:value={$psycheReligion} />
        </div>
        <div class="field">
          <label for="motivation">Motivation (Resilience)</label>
          <input type="text" id="motivation" name="psyche_motivation" bind:value={$psycheMotivation} />
        </div>
      </fieldset>
      <fieldset>
        <legend>Psychology</legend>
        <div class="field">
          <label for="psychology">Psychology</label>
          <input type="text" id="psychology" name="psyche_psychology" bind:value={$psychePsychology} />
        </div>
        <!-- TODO: Allow many inputs -->
      </fieldset>
      <fieldset>
        <legend>Ambitions</legend>
        <div class="field">
          <label for="short-ambition">Short-Term Ambition</label>
          <input type="text" id="short-ambition" name="psyche_short-ambition" bind:value={$psycheShortAmbition} />
        </div>
        <div class="field">
          <label for="long-ambition">Long-Term Ambition</label>
          <input type="text" id="long-ambition" name="psyche_long-ambition" bind:value={$psycheLongAmbition} />
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
          <label for="class">Class</label>
          <select id="class" name="career_class" bind:value={$careerClass}>
            <option value="">Choose...</option>
            <option value="academic">Academic</option>
            <option value="burgher">Burgher</option>
            <option value="courtier">Courtier</option>
            <option value="peasant">Peasant</option>
            <option value="ranger">Ranger</option>
            <option value="riverfolk">Riverfolk</option>
            <option value="rogue">Rogue</option>
            <option value="warrior">Warrior</option>
          </select>
        </div>
        <div class="field">
          <label for="career">Career</label>
          <select id="career" name="career_career" bind:value={$careerCareer}>
            <option value="">Not yet, sorry</option>
            <!-- TODO: this -->
          </select>
        </div>
        <div class="field">
          <label for="tier">Career Tier/Level</label>
          <select id="tier" name="career_tier" bind:value={$careerTier}>
            <option value="">Not yet, sorry</option>
            <!-- TODO: this -->
          </select>
        </div>
        <div class="field">
          <label for="status">Status</label>
          <input type="text" id="status" name="career_status" bind:value={$careerStatus} />
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
          <label for="party-name">Name</label>
          <input type="text" id="party-name" name="party_name" bind:value={$partyName}>
        </div>
        <div class="field">
          <label for="headquarters">Headquarters</label>
          <input type="text" id="headquarters" name="party_headquarters" bind:value={$partyHeadquarters}>
        </div>
      </fieldset>
      <fieldset>
        <legend>Members</legend>
        <!-- TODO: this -->
      </fieldset>
      <fieldset>
        <legend>Ambitions</legend>
        <div class="field">
          <label for="party-short-ambition">Short-Term Ambition</label>
          <input type="text" id="party-short-ambition" name="party_short-ambition" bind:value={$partyShortAmbition} />
        </div>
        <div class="field">
          <label for="party-long-ambition">Long-Term Ambition</label>
          <input type="text" id="party-long-ambition" name="party_long-ambition" bind:value={$partyLongAmbition} />
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
          <label for="current">Current/Unspent</label>
          <input type="number" id="current" name="experience_current" bind:value={$experienceCurrent} />
        </div>
        <div class="field">
          <label for="spent">Spent</label>
          <input type="number" id="spent" name="experience_spent" bind:value={$experienceSpent} />
        </div>
        <div class="field">
          <label for="total">Total</label>
          <input disabled type="number" id="total" name="experience_total" value={$experienceTotal} />
        </div>
      </fieldset>
    </form>
  </section>
</div>
