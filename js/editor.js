const dynamicFields = {
  experience: { label: "Experience", fields: [["role", "Job title", "e.g. Frontend Developer"], ["company", "Company / employer", "Company name"], ["location", "Work location", "Dhaka"], ["employmentType", "Employment type", "Full-time / Internship / Contract"], ["startDate", "Start date", "e.g. Jan 2023"], ["endDate", "End date", "e.g. Present"], ["description", "Responsibilities and achievements", "Describe your work, achievements and measurable results...", "textarea"]] },
  education: { label: "Education", fields: [["degree", "Degree / qualification", "BSc in Computer Science"], ["institution", "Institution", "University name"], ["department", "Department / major", "Computer Science"], ["result", "Result / GPA", "3.80 / 4.00"], ["startYear", "Start year", "2021"], ["endYear", "Graduation year", "2025"], ["details", "Relevant coursework / details", "Awards, coursework, activities...", "textarea"]] },
  projects: { label: "Project", fields: [["name", "Project name", "Portfolio website"], ["link", "Project URL", "https://"], ["technologies", "Technologies used", "HTML, CSS, JavaScript"], ["date", "Date / duration", "2025"], ["description", "Project description", "What did you build? What was your contribution?", "textarea"]] }
};

function escapeHTML(value = "") {
  return String(value).replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

function renderEntryForms(type, items) {
  const target = document.getElementById(type + "List");
  if (!target) return; // Safety check to prevent null error

  const config = dynamicFields[type];
  target.innerHTML = items.map((item, index) => `
    <div class="entry-card" data-entry="${type}" data-index="${index}">
      <div class="entry-head">
        <span>${config.label} ${index + 1}</span>
        <button type="button" class="remove-entry" data-remove="${type}" data-index="${index}">Remove</button>
      </div>
      <div class="entry-grid">
        ${config.fields.map(([key, label, placeholder, kind]) => `
          <label class="field ${kind === "textarea" ? "full" : ""}">
            ${label}
            ${kind === "textarea" 
              ? `<textarea rows="3" data-entry-field="${type}" data-index="${index}" data-key="${key}" placeholder="${placeholder}">${escapeHTML(item[key] || "")}</textarea>` 
              : `<input data-entry-field="${type}" data-index="${index}" data-key="${key}" value="${escapeHTML(item[key] || "")}" placeholder="${placeholder}">`}
          </label>
        `).join("")}
      </div>
    </div>
  `).join("");
}

function bindSingleEntryEvents(data, onChange) {
  const root = document.querySelector(".form-sections");
  if (!root || root.dataset.entryBound) return;
  root.dataset.entryBound = "true";

  // Handle typing in fields
  root.addEventListener("input", e => {
    const el = e.target.closest("[data-entry-field]");
    if (!el) return;
    const { entryField, index, key } = el.dataset;
    if (data[entryField] && data[entryField][Number(index)]) {
      data[entryField][Number(index)][key] = el.value;
      onChange();
    }
  });

  // Handle clicking Remove buttons
  root.addEventListener("click", e => {
    const btn = e.target.closest("[data-remove]");
    if (!btn) return;
    e.preventDefault();
    
    const type = btn.dataset.remove;
    const indexToRemove = Number(btn.dataset.index);
    
    if (data[type] && data[type][indexToRemove]) {
      data[type].splice(indexToRemove, 1);
      renderEntryForms(type, data[type]);
      onChange();
    }
  });
}

function addEntry(type, data, onChange) {
  if (!data[type]) data[type] = [];
  data[type].push({});
  renderEntryForms(type, data[type]);
  onChange();
}

function renderCustomFields(data, onChange) {
  const target = document.getElementById("customFieldsList");
  if (!target) return;

  target.innerHTML = (data.customFields || []).map((field, index) => `
    <div class="entry-card custom-entry" data-custom-index="${index}">
      <div class="entry-head">
        <span>Custom field ${index + 1}</span>
        <button type="button" class="remove-entry" data-custom-remove="${index}">Remove</button>
      </div>
      <div class="entry-grid">
        <label class="field">Field name<input data-custom-key="label" data-custom-index="${index}" value="${escapeHTML(field.label || "")}" placeholder="e.g. Publications"></label>
        <label class="field">CV section<input data-custom-key="section" data-custom-index="${index}" value="${escapeHTML(field.section || "Additional information")}" placeholder="e.g. Research"></label>
        <label class="field">Field type<select data-custom-key="type" data-custom-index="${index}"><option value="text" ${field.type === "text" ? "selected" : ""}>Short text</option><option value="textarea" ${field.type === "textarea" ? "selected" : ""}>Long text</option><option value="date" ${field.type === "date" ? "selected" : ""}>Date</option><option value="url" ${field.type === "url" ? "selected" : ""}>Website URL</option></select></label>
        <label class="field">Show in CV <select data-custom-key="visible" data-custom-index="${index}"><option value="true" ${field.visible !== false ? "selected" : ""}>Yes</option><option value="false" ${field.visible === false ? "selected" : ""}>No</option></select></label>
        <label class="field full">Value<textarea rows="3" data-custom-key="value" data-custom-index="${index}" placeholder="Enter your information">${escapeHTML(field.value || "")}</textarea></label>
      </div>
    </div>
  `).join("");

  target.querySelectorAll("[data-custom-key]").forEach(el => {
    const update = () => {
      const item = data.customFields[Number(el.dataset.customIndex)];
      if (!item) return;
      let value = el.value;
      if (el.dataset.customKey === "visible") value = value === "true";
      item[el.dataset.customKey] = value;
      onChange();
    };
    el.addEventListener("input", update);
    el.addEventListener("change", update);
  });

  target.querySelectorAll("[data-custom-remove]").forEach(btn => btn.addEventListener("click", e => {
    e.preventDefault();
    data.customFields.splice(Number(btn.dataset.customRemove), 1);
    renderCustomFields(data, onChange);
    onChange();
  }));
}

function addCustomField(data, onChange) {
  data.customFields = data.customFields || [];
  data.customFields.push({ label: "", section: "Additional information", type: "text", value: "", visible: true });
  renderCustomFields(data, onChange);
  onChange();
}