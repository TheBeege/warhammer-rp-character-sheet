export class EditableTable extends HTMLElement {

    constructor() {
        super();
        
        this.attachShadow({ mode: "open" });
        this.tableId = null;
        this.rowCounter = 0;

        // Web Javascript is the stupidest language on the planet.
        this.addListItem = this.addListItem.bind(this);
        this.removeListItem = this.removeListItem.bind(this);
        this.persistFormInput = this.persistFormInput.bind(this);
        this.fillFieldFromStorage = this.fillFieldFromStorage.bind(this);
    }

    async connectedCallback() {
        // Generate unique table ID from legend or fallback to timestamp
        const legend = this.querySelector('legend')?.textContent || `table-${Date.now()}`;
        this.tableId = legend.toLowerCase().replace(/[^a-z0-9]/g, '-');

        const url = new URL(import.meta.url);
        const directory = url.pathname.substring(0, url.pathname.lastIndexOf('/'));
        const baseUrl = `${url.origin}${directory}`;
        const [html, css] = await Promise.all([
            fetch(`${baseUrl}/template.html`).then((resp) => resp.text()),
            fetch(`${baseUrl}/styles.css`).then((resp) => resp.text())
        ]);
        const parser = new DOMParser();
        const template = parser
            .parseFromString(html, 'text/html')
            .querySelector('template');
        const style = document.createElement('style');

        style.textContent = css;
        template.content.prepend(style);

        const fieldHeaderRow = template.content.querySelector(".field-header-row");
        const deleteHeader = template.content.querySelector(".delete-header");
        const templateRecordRow = template.content.querySelector(".template-record");
        const tableDeleteRow = template.content.querySelector(".table-row-delete");

        const fields = Array.from(this.querySelectorAll(`span[data-slot="field-headers"]`))
        const templateRecordPlaceholders = Array.from(this.querySelectorAll(`span[data-slot="template-record"]`))
        
        for (let i = 0; i < fields.length; i++) {
            const fieldTableHead = document.createElement("th");
            const fieldTableHeadSlot = document.createElement("slot");
            fieldTableHeadSlot.setAttribute("name", `field-${i}`);
            fieldTableHead.appendChild(fieldTableHeadSlot);
            fields[i].setAttribute("slot", `field-${i}`);
            fieldHeaderRow.insertBefore(fieldTableHead, deleteHeader);

            const templateRecordCell = document.createElement("td");
            const templateRecordSlot = document.createElement("slot");
            templateRecordSlot.setAttribute("name", `template-record-${i}`);
            templateRecordCell.appendChild(templateRecordSlot);
            templateRecordPlaceholders[i].setAttribute("slot", `template-record-${i}`);
            templateRecordRow.insertBefore(templateRecordCell, tableDeleteRow);
        }

        // Store the template elements for cloning
        this.templateRecordElements = templateRecordPlaceholders;

        const clonedNode = template.content.cloneNode(true);
        this.shadowRoot.appendChild(clonedNode);

        // Set up the add button
        const addElementButton = this.shadowRoot.querySelector(".table-add");
        addElementButton.addEventListener('click', this.addListItem, false);

        // Convert the template row to be editable and persistent
        this.makeRowEditable(templateRecordRow, 0);
        
        // Set up delete button for template row
        const templateDeleteButton = templateRecordRow.querySelector(".table-row-delete button");
        templateDeleteButton.addEventListener("click", this.removeListItem, false);

        // Load existing rows from storage
        this.loadFromStorage();
    }

    makeRowEditable(row, rowIndex) {
        const cells = row.querySelectorAll("td:not(.table-row-delete)");
        
        cells.forEach((cell, colIndex) => {
            const slot = cell.querySelector("slot");
            if (slot) {
                const slotName = slot.getAttribute("name");
                const templateElementIndex = parseInt(slotName.split('-').pop());
                const templateElement = this.templateRecordElements[templateElementIndex];
                
                if (templateElement) {
                    // Clone the template element
                    const input = templateElement.cloneNode(true);
                    
                    // Convert editable text spans to input elements
                    const editableInput = this.convertToEditableInput(input);
                    
                    // Generate unique name for persistence
                    const fieldName = `table-${this.tableId}-row-${rowIndex}-col-${colIndex}`;
                    this.setFieldName(editableInput, fieldName);
                    
                    // Clear the cell and add the input
                    cell.innerHTML = '';
                    cell.appendChild(editableInput);
                    
                    // Set up persistence
                    this.setupPersistence(editableInput);
                }
            }
        });
    }

    convertToEditableInput(element) {
        // If element has class "table-editable-text", convert it to an input element
        if (element.classList && element.classList.contains('table-editable-text')) {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = element.textContent || '';
            // Copy any other attributes that might be relevant
            if (element.placeholder) input.placeholder = element.placeholder;
            if (element.title) input.title = element.title;
            return input;
        }
        
        // If element contains children with table-editable-text class, convert them
        const editableChildren = element.querySelectorAll('.table-editable-text');
        editableChildren.forEach(child => {
            const input = document.createElement('input');
            input.type = 'text';
            input.value = child.textContent || '';
            if (child.placeholder) input.placeholder = child.placeholder;
            if (child.title) input.title = child.title;
            child.parentNode.replaceChild(input, child);
        });
        
        return element;
    }

    setFieldName(element, baseName) {
        // Set name attribute on the element or its form children
        if (element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA') {
            element.setAttribute('name', baseName);
        } else {
            // Handle nested form elements
            const formElements = element.querySelectorAll('input, select, textarea');
            formElements.forEach((formEl, index) => {
                const uniqueName = formElements.length > 1 ? `${baseName}-${index}` : baseName;
                formEl.setAttribute('name', uniqueName);
            });
        }
    }

    setupPersistence(element) {
        // Set up event listeners for persistence (similar to main.mjs)
        const formElements = element.tagName === 'INPUT' || element.tagName === 'SELECT' || element.tagName === 'TEXTAREA' 
            ? [element] 
            : element.querySelectorAll('input, select, textarea');
            
        formElements.forEach(formEl => {
            // Load existing value
            this.fillFieldFromStorage(formEl);
            
            // Set up auto-save
            if (formEl.tagName.toLowerCase() === "select") {
                formEl.addEventListener("change", this.persistFormInput);
            } else if (formEl.tagName.toLowerCase() === "input") {
                if (formEl.type === 'checkbox' || formEl.type === 'radio') {
                    formEl.addEventListener("change", this.persistFormInput);
                } else {
                    formEl.addEventListener("focusout", this.persistFormInput);
                }
            } else if (formEl.tagName.toLowerCase() === "textarea") {
                formEl.addEventListener("focusout", this.persistFormInput);
            }
        });
    }

    addListItem(event) {
        event.preventDefault();
        
        this.rowCounter++;
        
        const tableBody = this.shadowRoot.querySelector("tbody");
        const newRow = document.createElement("tr");
        
        // Clone each template record element from the light DOM
        this.templateRecordElements.forEach((templateElement, colIndex) => {
            const cell = document.createElement("td");
            const clonedContent = templateElement.cloneNode(true);
            
            // Convert editable text spans to input elements
            const editableContent = this.convertToEditableInput(clonedContent);
            
            // Generate unique name for persistence
            const fieldName = `table-${this.tableId}-row-${this.rowCounter}-col-${colIndex}`;
            this.setFieldName(editableContent, fieldName);
            
            // Clear any form values
            this.clearFormElement(editableContent);
            
            cell.appendChild(editableContent);
            newRow.appendChild(cell);
            
            // Set up persistence for this cell
            this.setupPersistence(editableContent);
        });
        
        // Add delete button
        const deleteCell = document.createElement("td");
        deleteCell.className = "table-row-delete";
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "⊟";
        deleteButton.addEventListener("click", this.removeListItem, false);
        deleteCell.appendChild(deleteButton);
        newRow.appendChild(deleteCell);
        
        tableBody.appendChild(newRow);
        
        // Save row count to storage
        this.saveRowCount();
    }

    removeListItem(event) {
        const row = event.target.closest('tr');
        const rowIndex = Array.from(row.parentNode.children).indexOf(row);
        
        // Clear storage for this row
        this.clearRowFromStorage(rowIndex);
        
        // Remove the row
        row.remove();
        
        // Reindex remaining rows and update their storage keys
        this.reindexRows();
        
        // Update row count
        this.updateRowCount();
        this.saveRowCount();
    }

    clearFormElement(element) {
        if (element.tagName === 'INPUT') {
            if (element.type === 'checkbox' || element.type === 'radio') {
                element.checked = false;
            } else {
                element.value = '';
            }
        } else if (element.tagName === 'SELECT') {
            element.selectedIndex = 0;
        } else if (element.tagName === 'TEXTAREA') {
            element.value = '';
        }
        
        const childFormElements = element.querySelectorAll('input, select, textarea');
        childFormElements.forEach(child => this.clearFormElement(child));
    }

    // Persistence methods (similar to main.mjs)
    persistFormInput(event) {
        const fieldName = event.target.getAttribute("name");
        let fieldValue;
        
        if (event.target.type === 'checkbox' || event.target.type === 'radio') {
            fieldValue = event.target.checked.toString();
        } else {
            fieldValue = event.target.value;
        }
        
        try {
            localStorage.setItem(fieldName, fieldValue);
        } catch (error) {
            console.warn('Failed to save to localStorage:', error);
        }
    }

    fillFieldFromStorage(field) {
        const fieldName = field.getAttribute("name");
        try {
            const fieldValue = localStorage.getItem(fieldName);
            if (fieldValue !== null) {
                if (field.type === 'checkbox' || field.type === 'radio') {
                    field.checked = fieldValue === 'true';
                } else {
                    field.value = fieldValue;
                }
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
    }

    saveRowCount() {
        const rowCount = this.shadowRoot.querySelectorAll("tbody tr").length;
        try {
            localStorage.setItem(`table-${this.tableId}-row-count`, rowCount.toString());
        } catch (error) {
            console.warn('Failed to save row count to localStorage:', error);
        }
    }

    updateRowCount() {
        const rows = this.shadowRoot.querySelectorAll("tbody tr");
        this.rowCounter = rows.length > 0 ? rows.length - 1 : 0;
    }

    clearRowFromStorage(rowIndex) {
        // Clear all fields for this row
        this.templateRecordElements.forEach((_, colIndex) => {
            const fieldName = `table-${this.tableId}-row-${rowIndex}-col-${colIndex}`;
            try {
                localStorage.removeItem(fieldName);
            } catch (error) {
                console.warn('Failed to remove from localStorage:', error);
            }
        });
    }

    loadFromStorage() {
        try {
            const storedRowCount = localStorage.getItem(`table-${this.tableId}-row-count`);
            if (storedRowCount) {
                const rowCount = parseInt(storedRowCount);
                // We start with 1 row (the template), so add the remaining rows
                for (let i = 1; i < rowCount; i++) {
                    this.addListItem(new Event('click'));
                }
            }
        } catch (error) {
            console.warn('Failed to load from localStorage:', error);
        }
    }

    reindexRows() {
        // Get all rows in the table
        const rows = Array.from(this.shadowRoot.querySelectorAll("tbody tr"));
        
        // Reindex each row and update storage keys
        rows.forEach((row, newIndex) => {
            const cells = row.querySelectorAll("td:not(.table-row-delete)");
            
            cells.forEach((cell, colIndex) => {
                const formElements = cell.querySelectorAll('input, select, textarea');
                formElements.forEach(element => {
                    const oldName = element.getAttribute('name');
                    const newName = `table-${this.tableId}-row-${newIndex}-col-${colIndex}`;
                    
                    if (oldName !== newName) {
                        // Move the stored value to the new key
                        try {
                            const storedValue = localStorage.getItem(oldName);
                            if (storedValue !== null) {
                                localStorage.setItem(newName, storedValue);
                                localStorage.removeItem(oldName);
                            }
                        } catch (error) {
                            console.warn('Failed to reindex localStorage:', error);
                        }
                        
                        // Update the element's name attribute
                        element.setAttribute('name', newName);
                    }
                });
            });
        });
    }
}