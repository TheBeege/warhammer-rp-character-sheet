export class EditableTable extends HTMLElement {
  constructor() {
      super();
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
    // the slow is instead placed outside the table.
    // So we avoid the table entirely and just slot inside the table cells.
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
    
    const shadowRoot = this.attachShadow({ mode: "open"});
    const clonedNode = template.content.cloneNode(true);
    shadowRoot.appendChild(clonedNode);
  }
}
