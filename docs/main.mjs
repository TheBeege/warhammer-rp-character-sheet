import { EditableTable } from "./editable-table/element.mjs";

/**
 * This is linked using the html `defer` attribute, so `onload` nonsense isn't necessary.
 */

customElements.define("editable-table", EditableTable);

const editableTable = customElements.get("editable-table");

/**
 * This reads data from the triggering form event and persists it to browser storage.
 * 
 * @param {Event} event
 */
function persistFormInput(event) {
    const fieldName = event.target.getAttribute("name");
    const fieldValue = event.target.value;
    localStorage.setItem(fieldName, fieldValue);
}

/**
 * This checks local storage for an existing value and populates that field if the 
 * corresponding value is found.
 * 
 * @param {(HTMLInputElement|HTMLSelectElement)} field 
 */
function fillFieldFromStorage(field) {
    const fieldName = field.getAttribute("name");
    const fieldValue = localStorage.getItem(fieldName);
    field.value = fieldValue;
}

// Fetch every field
const allFields = document.querySelectorAll("input:not(:disabled):not([readonly]), " + 
    "select:not(:disabled):not([readonly])");

for (const field of allFields) {
    // Load existing data from local storage
    fillFieldFromStorage(field);

    // Trigger persisting data for every field
    if (field.tagName === "select") {
        field.addEventListener("change", persistFormInput);
    } else if (field.tagName === "input") {
        field.addEventListener("focusout", persistFormInput);
    }
}
