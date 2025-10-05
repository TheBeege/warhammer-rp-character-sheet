/**
 * Form field localStorage persistence logic
 * Separated from DOM setup for testability
 */

/**
 * Event handler for form input events (blur/change)
 * Extracts field name and value, then persists to localStorage
 *
 * @param {Event} event - The DOM event
 */
export function persistFormInput(event) {
    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;
    localStorage.setItem(fieldName, fieldValue);
}

/**
 * Loads and populates a form field from localStorage
 *
 * @param {HTMLInputElement|HTMLSelectElement} field - The field to populate
 */
export function fillFieldFromStorage(field) {
    const fieldName = field.getAttribute("name");
    const fieldValue = localStorage.getItem(fieldName);
    if (fieldValue !== null) {
        field.value = fieldValue;
    }
}
