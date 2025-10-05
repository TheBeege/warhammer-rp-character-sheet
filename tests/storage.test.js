import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/dom';
import { userEvent } from '@testing-library/user-event';
import { persistFormInput, fillFieldFromStorage } from '../docs/storage.js';

/**
 * Tests for storage.js - the pure localStorage logic
 * These functions are now separated from DOM setup for testability
 */

describe('storage.js LocalStorage Functions', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    document.body.innerHTML = '';
  });

  describe('persistFormInput', () => {
    it('saves text input value to localStorage on blur event', async () => {
      document.body.innerHTML = `
        <label for="name">Name</label>
        <input type="text" id="name" name="character_name" />
      `;

      const input = screen.getByLabelText('Name');
      input.addEventListener('focusout', persistFormInput);

      await user.type(input, 'Gunther the Bold');
      await user.tab();

      expect(localStorage.getItem('character_name')).toBe('Gunther the Bold');
    });

    it('saves select value to localStorage on change event', async () => {
      document.body.innerHTML = `
        <label for="gender">Gender</label>
        <select id="gender" name="character_gender">
          <option value="">Choose...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      `;

      const select = screen.getByLabelText('Gender');
      select.addEventListener('change', persistFormInput);

      await user.selectOptions(select, 'female');

      expect(localStorage.getItem('character_gender')).toBe('female');
    });

    it('saves number input value to localStorage', async () => {
      document.body.innerHTML = `
        <label for="age">Age</label>
        <input type="number" id="age" name="character_age" />
      `;

      const input = screen.getByLabelText('Age');
      input.addEventListener('focusout', persistFormInput);

      await user.type(input, '42');
      await user.tab();

      expect(localStorage.getItem('character_age')).toBe('42');
    });
  });

  describe('fillFieldFromStorage', () => {
    it('loads text input value from localStorage', () => {
      localStorage.setItem('character_name', 'Saved Hero');

      document.body.innerHTML = `
        <label for="name">Name</label>
        <input type="text" id="name" name="character_name" />
      `;

      const input = screen.getByLabelText('Name');
      fillFieldFromStorage(input);

      expect(input.value).toBe('Saved Hero');
    });

    it('loads select value from localStorage', () => {
      localStorage.setItem('character_gender', 'male');

      document.body.innerHTML = `
        <label for="gender">Gender</label>
        <select id="gender" name="character_gender">
          <option value="">Choose...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      `;

      const select = screen.getByLabelText('Gender');
      fillFieldFromStorage(select);

      expect(select.value).toBe('male');
    });

    it('handles missing localStorage values gracefully', () => {
      document.body.innerHTML = `
        <label for="name">Name</label>
        <input type="text" id="name" name="character_name" />
      `;

      const input = screen.getByLabelText('Name');
      fillFieldFromStorage(input);

      // Should not crash, field remains empty
      expect(input.value).toBe('');
    });
  });

  describe('Integration: Save and Load Cycle', () => {
    it('persists data across simulated page reloads', async () => {
      // First "page load" - user enters data
      document.body.innerHTML = `
        <label for="name">Name</label>
        <input type="text" id="name" name="character_name" />
      `;

      let input = screen.getByLabelText('Name');
      input.addEventListener('focusout', persistFormInput);

      await user.type(input, 'Persistent Hero');
      await user.tab();

      expect(localStorage.getItem('character_name')).toBe('Persistent Hero');

      // Simulate page reload by recreating DOM
      document.body.innerHTML = `
        <label for="name">Name</label>
        <input type="text" id="name" name="character_name" />
      `;

      input = screen.getByLabelText('Name');
      fillFieldFromStorage(input);

      expect(input.value).toBe('Persistent Hero');
    });

    it('handles multiple fields correctly', async () => {
      localStorage.setItem('character_name', 'Pre-saved Name');
      localStorage.setItem('character_gender', 'female');

      document.body.innerHTML = `
        <form>
          <label for="name">Name</label>
          <input type="text" id="name" name="character_name" />

          <label for="species">Species</label>
          <input type="text" id="species" name="character_species" />

          <label for="gender">Gender</label>
          <select id="gender" name="character_gender">
            <option value="">Choose...</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </form>
      `;

      const nameInput = screen.getByLabelText('Name');
      const speciesInput = screen.getByLabelText('Species');
      const genderSelect = screen.getByLabelText('Gender');

      // Load saved values
      fillFieldFromStorage(nameInput);
      fillFieldFromStorage(genderSelect);
      fillFieldFromStorage(speciesInput);

      expect(nameInput.value).toBe('Pre-saved Name');
      expect(genderSelect.value).toBe('female');
      expect(speciesInput.value).toBe('');

      // Save new value
      speciesInput.addEventListener('focusout', persistFormInput);
      await user.type(speciesInput, 'Dwarf');
      await user.tab();

      expect(localStorage.getItem('character_species')).toBe('Dwarf');
    });
  });
});
