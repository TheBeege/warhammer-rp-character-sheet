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
