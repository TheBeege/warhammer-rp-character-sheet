import { writable, derived } from 'svelte/store';
import { browser } from '$app/environment';

/**
 * Creates a Svelte store that auto-syncs to localStorage
 * Replicates the behavior from docs/storage.js
 *
 * @param {string} key - localStorage key
 * @param {string} defaultValue - default value if nothing in storage
 * @returns {import('svelte/store').Writable<string>}
 */
export function persistedStore(key, defaultValue = '') {
	// Load initial value from localStorage (browser only)
	const initialValue = browser ? localStorage.getItem(key) ?? defaultValue : defaultValue;

	const store = writable(initialValue);

	// Auto-save to localStorage on every change (browser only)
	if (browser) {
		store.subscribe((value) => {
			if (value === null || value === undefined) {
				localStorage.removeItem(key);
			} else {
				localStorage.setItem(key, value);
			}
		});
	}

	return store;
}

// Character profile stores (matching existing localStorage keys)
export const characterName = persistedStore('character_name');
export const characterSpecies = persistedStore('character_species');
export const characterGender = persistedStore('character_gender');
export const characterAge = persistedStore('character_age');
export const characterHeight = persistedStore('character_height');
export const characterHair = persistedStore('character_hair');
export const characterEyes = persistedStore('character_eyes');
export const characterBirthday = persistedStore('character_birthday');
export const characterBirthplace = persistedStore('character_birthplace');

// Psyche stores
export const psycheReligion = persistedStore('psyche_religion');
export const psycheMotivation = persistedStore('psyche_motivation');
export const psychePsychology = persistedStore('psyche_psychology');
export const psycheShortAmbition = persistedStore('psyche_short-ambition');
export const psycheLongAmbition = persistedStore('psyche_long-ambition');

// Career stores
export const careerClass = persistedStore('career_class');
export const careerCareer = persistedStore('career_career');
export const careerTier = persistedStore('career_tier');
export const careerStatus = persistedStore('career_status');

// Party stores
export const partyName = persistedStore('party_name');
// Party member list stored by EditableListTable component
// See: src/lib/components/EditableListTable.svelte (localStorage key: 'party_members_items')
export const partyHeadquarters = persistedStore('party_headquarters');
export const partyShortAmbition = persistedStore('party_short-ambition');
export const partyLongAmbition = persistedStore('party_long-ambition');

// Experience stores
export const experienceCurrent = persistedStore('experience_current');
export const experienceSpent = persistedStore('experience_spent');

// Calculated total (derived, not persisted)
export const experienceTotal = derived(
	[experienceCurrent, experienceSpent],
	([$current, $spent]) => {
		const current = parseInt($current) || 0;
		const spent = parseInt($spent) || 0;
		return current + spent;
	}
);

// Characteristics stores
// Helper function to create a characteristic with calculated current value
function createCharacteristic(name) {
	const initial = persistedStore(`characteristic_${name}_initial`, '0');
	const advances = persistedStore(`characteristic_${name}_advances`, '0');
	const modifiers = persistedStore(`characteristic_${name}_modifiers`, '0');
	const career = persistedStore(`characteristic_${name}_career`, 'false');

	const current = derived(
		[initial, advances, modifiers],
		([$initial, $advances, $modifiers]) => {
			const initialVal = parseInt($initial) || 0;
			const advancesVal = parseInt($advances) || 0;
			const modifiersVal = parseInt($modifiers) || 0;
			return initialVal + advancesVal + modifiersVal;
		}
	);

	return { initial, advances, modifiers, current, career };
}

// Weapon Skill
const wsChar = createCharacteristic('ws');
export const characteristicWSInitial = wsChar.initial;
export const characteristicWSAdvances = wsChar.advances;
export const characteristicWSModifiers = wsChar.modifiers;
export const characteristicWSCurrent = wsChar.current;
export const characteristicWSCareer = wsChar.career;

// Ballistic Skill
const bsChar = createCharacteristic('bs');
export const characteristicBSInitial = bsChar.initial;
export const characteristicBSAdvances = bsChar.advances;
export const characteristicBSModifiers = bsChar.modifiers;
export const characteristicBSCurrent = bsChar.current;
export const characteristicBSCareer = bsChar.career;

// Strength
const sChar = createCharacteristic('s');
export const characteristicSInitial = sChar.initial;
export const characteristicSAdvances = sChar.advances;
export const characteristicSModifiers = sChar.modifiers;
export const characteristicSCurrent = sChar.current;
export const characteristicSCareer = sChar.career;

// Toughness
const tChar = createCharacteristic('t');
export const characteristicTInitial = tChar.initial;
export const characteristicTAdvances = tChar.advances;
export const characteristicTModifiers = tChar.modifiers;
export const characteristicTCurrent = tChar.current;
export const characteristicTCareer = tChar.career;

// Initiative
const iChar = createCharacteristic('i');
export const characteristicIInitial = iChar.initial;
export const characteristicIAdvances = iChar.advances;
export const characteristicIModifiers = iChar.modifiers;
export const characteristicICurrent = iChar.current;
export const characteristicICareer = iChar.career;

// Agility
const agChar = createCharacteristic('ag');
export const characteristicAgInitial = agChar.initial;
export const characteristicAgAdvances = agChar.advances;
export const characteristicAgModifiers = agChar.modifiers;
export const characteristicAgCurrent = agChar.current;
export const characteristicAgCareer = agChar.career;

// Dexterity
const dexChar = createCharacteristic('dex');
export const characteristicDexInitial = dexChar.initial;
export const characteristicDexAdvances = dexChar.advances;
export const characteristicDexModifiers = dexChar.modifiers;
export const characteristicDexCurrent = dexChar.current;
export const characteristicDexCareer = dexChar.career;

// Intelligence
const intChar = createCharacteristic('int');
export const characteristicIntInitial = intChar.initial;
export const characteristicIntAdvances = intChar.advances;
export const characteristicIntModifiers = intChar.modifiers;
export const characteristicIntCurrent = intChar.current;
export const characteristicIntCareer = intChar.career;

// Willpower
const wpChar = createCharacteristic('wp');
export const characteristicWPInitial = wpChar.initial;
export const characteristicWPAdvances = wpChar.advances;
export const characteristicWPModifiers = wpChar.modifiers;
export const characteristicWPCurrent = wpChar.current;
export const characteristicWPCareer = wpChar.career;

// Fellowship
const felChar = createCharacteristic('fel');
export const characteristicFelInitial = felChar.initial;
export const characteristicFelAdvances = felChar.advances;
export const characteristicFelModifiers = felChar.modifiers;
export const characteristicFelCurrent = felChar.current;
export const characteristicFelCareer = felChar.career;

// Movement stores
export const movementBase = persistedStore('movement_base', '0');
export const movementModifiers = persistedStore('movement_modifiers', '0');
export const movementEncumbrance = persistedStore('movement_encumbrance', '0');

// Calculated movement value (Base + Modifiers + Encumbrance)
export const movementCurrent = derived(
	[movementBase, movementModifiers, movementEncumbrance],
	([$base, $modifiers, $encumbrance]) => {
		const baseVal = parseInt($base) || 0;
		const modifiersVal = parseInt($modifiers) || 0;
		const encumbranceVal = parseInt($encumbrance) || 0;
		return baseVal + modifiersVal + encumbranceVal;
	}
);

// Walk: Movement * 2
export const movementWalk = derived(
	[movementCurrent],
	([$current]) => {
		return $current * 2;
	}
);

// Run: Movement * 4
export const movementRun = derived(
	[movementCurrent],
	([$current]) => {
		return $current * 4;
	}
);

// Fate & Resilience stores
export const fate = persistedStore('fate', '0');
export const fortune = persistedStore('fortune', '0');
export const resilience = persistedStore('resilience', '0');
export const resolve = persistedStore('resolve', '0');
