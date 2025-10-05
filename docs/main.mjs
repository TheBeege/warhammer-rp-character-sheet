import { EditableTable } from "./editable-table/element.mjs";
import { persistFormInput, fillFieldFromStorage } from "./storage.js";

/**
 * This is linked using the html `defer` attribute, so `onload` nonsense isn't necessary.
 */

customElements.define("editable-table", EditableTable);

// Fetch every field
const allFields = document.querySelectorAll("input:not(:disabled):not([readonly]), " +
    "select:not(:disabled):not([readonly])");

for (const field of allFields) {
    // Load existing data from local storage
    fillFieldFromStorage(field);

    // Trigger persisting data for every field
    if (field.tagName.toLowerCase() === "select") {
        field.addEventListener("change", persistFormInput);
    } else if (field.tagName.toLowerCase() === "input") {
        field.addEventListener("focusout", persistFormInput);
    }
}
