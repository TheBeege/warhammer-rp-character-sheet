import { describe, it, expect, beforeEach } from 'vitest';
import { get } from 'svelte/store';
import { persistedStore } from '../src/lib/stores/character.js';

/**
 * Tests for Svelte persisted stores
 * These replace the vanilla docs/storage.js tests
 * Core behavior must remain the same: auto-save/load from localStorage
 */

describe('Svelte Persisted Stores', () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it('saves to localStorage when store updates', () => {
		const testStore = persistedStore('test_field');

		testStore.set('New Value');

		expect(localStorage.getItem('test_field')).toBe('New Value');
		expect(get(testStore)).toBe('New Value');
	});

	it('loads from localStorage on initialization', () => {
		localStorage.setItem('test_field', 'Saved Value');

		const testStore = persistedStore('test_field');

		expect(get(testStore)).toBe('Saved Value');
	});

	it('handles missing localStorage values with default', () => {
		const testStore = persistedStore('missing_field', 'default value');

		expect(get(testStore)).toBe('default value');
	});

	it('uses empty string as default when no default provided', () => {
		const testStore = persistedStore('empty_field');

		expect(get(testStore)).toBe('');
	});

	it('updates localStorage on multiple changes', () => {
		const testStore = persistedStore('test_field');

		testStore.set('First');
		expect(localStorage.getItem('test_field')).toBe('First');

		testStore.set('Second');
		expect(localStorage.getItem('test_field')).toBe('Second');

		testStore.set('Third');
		expect(localStorage.getItem('test_field')).toBe('Third');
	});

	it('persists data across simulated page reloads', () => {
		// First "page load" - user sets data
		const testStore1 = persistedStore('test_field');
		testStore1.set('Persistent Data');

		// Simulate page reload by creating new store instance
		const testStore2 = persistedStore('test_field');

		expect(get(testStore2)).toBe('Persistent Data');
	});

	it('handles numeric values as strings', () => {
		const testStore = persistedStore('numeric_field');

		testStore.set('42');

		expect(localStorage.getItem('numeric_field')).toBe('42');
		expect(get(testStore)).toBe('42');
	});

	it('works with select/dropdown values', () => {
		const testStore = persistedStore('gender_field');

		testStore.set('');
		expect(get(testStore)).toBe('');

		testStore.set('female');
		expect(get(testStore)).toBe('female');
		expect(localStorage.getItem('gender_field')).toBe('female');
	});
});
