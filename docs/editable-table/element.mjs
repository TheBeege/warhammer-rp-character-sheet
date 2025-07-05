export class EditableTable extends HTMLElement {

    addRecordRow;

    constructor() {
        super();
        
        this.attachShadow({ mode: "open" });

        // Web Javascript is the stupidest language on the planet.
        this.addListItem = this.addListItem.bind(this);
        this.removeListItem = this.removeListItem.bind(this);
    }

    async connectedCallback() {
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

        // This is gross, but slots don't like tables.
        // When attempting to define a slot within the table structure,
        // the slot is instead placed outside the table.
        // So we avoid the table entirely and just slot inside the table cells.
        const fieldHeaderRow = template.content.querySelector(".field-header-row");
        const deleteHeader = template.content.querySelector(".delete-header");
        const templateRecordRow = template.content.querySelector(".template-record");
        const tableDeleteRow = template.content.querySelector(".table-row-delete");

        const fields = Array.from(this.querySelectorAll(`span[data-slot="field-headers"]`));
        const templateRecordPlaceholders = Array.from(this.querySelectorAll(`span[data-slot="template-record"]`));

        for (let i = 0; i < fields.length; i++) {
            const fieldTableHead = document.createElement("th");
            const fieldTableHeadSlot = document.createElement("slot");
            fieldTableHeadSlot.setAttribute("name", `field-${i}`);
            fieldTableHead.appendChild(fieldTableHeadSlot);
            fields[i].setAttribute("slot", `field-${i}`);
            fieldHeaderRow.insertBefore(fieldTableHead, deleteHeader);

            // We're assuming there's the same number of fields defined as template record cells.
            // If not, that's the engineer's problem.
            // TODO: Add nice error handling
            const templateRecordCell = document.createElement("td");
            const templateRecordSlot = document.createElement("slot");
            templateRecordSlot.setAttribute("name", `template-record-${i}`);
            templateRecordCell.appendChild(templateRecordSlot);
            templateRecordPlaceholders[i].setAttribute("slot", `template-record-${i}`);
            templateRecordRow.insertBefore(templateRecordCell, tableDeleteRow);
        }

        // Store the template elements for cloning later
        this.templateRecordElements = templateRecordPlaceholders;

        const clonedNode = template.content.cloneNode(true);
        this.shadowRoot.appendChild(clonedNode);

        // Thanks to https://github.com/mdn/web-components-examples/blob/main/editable-list/main.js
        const addElementButton = this.shadowRoot.querySelector(".table-add");
        addElementButton.addEventListener('click', this.addListItem, false);

        const removeElementButtons = [...this.shadowRoot.querySelectorAll(".table-row-delete")];
        for (let button of removeElementButtons) {
            button.addEventListener("click", this.removeListItem, false);
        }
    }

    addListItem(event) {
        event.preventDefault();
    
        const tableBody = this.shadowRoot.querySelector("tbody");
        const newRow = document.createElement("tr");
        
        // Clone each template record element from the light DOM
        const templateElements = this.querySelectorAll('span[data-slot="template-record"]');
        
        for(const templateElement of templateElements) {
            const cell = document.createElement("td");
            const clonedContent = templateElement.cloneNode(true);
            
            // Clear any form values
            this.clearFormElement(clonedContent);
            
            cell.appendChild(clonedContent);
            newRow.appendChild(cell);
        }
        
        // Add delete button
        const deleteCell = document.createElement("td");
        deleteCell.className = "table-row-delete";
        const deleteButton = document.createElement("button");
        deleteButton.textContent = "⊟";
        deleteButton.addEventListener("click", this.removeListItem, false);
        deleteCell.appendChild(deleteButton);
        newRow.appendChild(deleteCell);
        
        tableBody.appendChild(newRow);
    }

    clearFormElement(element) {
        // Clear form elements to default state
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
        
        // Also clear any child form elements
        const childFormElements = element.querySelectorAll('input, select, textarea');
        childFormElements.forEach(child => this.clearFormElement(child));
    }

    removeListItem(event) {
        event.target.parentNode.parentNode.remove();
    }
}
