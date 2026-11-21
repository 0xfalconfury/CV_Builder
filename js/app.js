let cvData = loadCV();
let currentTemplate = localStorage.getItem("formacv.template") || "minimal";
let zoom = 85;

const $ = s => document.querySelector(s);
const $$ = s => document.querySelectorAll(s);

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(showToast.timer);
  showToast.timer = setTimeout(() => toast.classList.remove("show"), 2400);
}

function updateCompletion() {
  const checks = [
    !!cvData.name, 
    !!cvData.email, 
    !!cvData.phone, 
    !!(cvData.summary || cvData.careerObjective), 
    cvData.experience.length > 0, 
    cvData.education.length > 0, 
    !!(cvData.technicalSkills || cvData.skills)
  ];
  const percent = Math.round(checks.filter(Boolean).length / checks.length * 100);
  $("#completionText").textContent = percent + "%";
  $("#completionBar").style.width = percent + "%";
}

function refresh() {
  renderResume(cvData, currentTemplate);
  updateCompletion();
  $("#saveStatus").textContent = "Saving…";
  const ok = saveCV(cvData);
  $("#saveStatus").textContent = ok ? "Saved locally" : "Could not save";
}

function hydrateFields() {
  $$("[data-field]").forEach(el => {
    el.value = cvData[el.dataset.field] || "";
    el.addEventListener("input", () => {
      cvData[el.dataset.field] = el.value;
      refresh();
    });
  });
}

function setupNavigation() {
  $$(".section-tab").forEach(btn => btn.addEventListener("click", () => {
    $$(".section-tab").forEach(x => x.classList.toggle("active", x === btn));
    $$(".form-section").forEach(x => x.classList.toggle("active", x.id === btn.dataset.target));
  }));
}

function setupPhoto() {
  const input = $("#photoInput");
  input.addEventListener("change", () => {
    const file = input.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { showToast("Please choose an image file."); return; }
    if (file.size > 2 * 1024 * 1024) { showToast("Please choose an image smaller than 2 MB."); return; }
    const reader = new FileReader();
    reader.onload = () => { cvData.photo = reader.result; updateAvatar(); refresh(); };
    reader.readAsDataURL(file);
  });
  $("#removePhotoBtn").addEventListener("click", () => { cvData.photo = ""; input.value = ""; updateAvatar(); refresh(); });
}

function updateAvatar() {
  const el = $("#avatarPreview");
  el.style.backgroundImage = cvData.photo ? `url("${cvData.photo}")` : "";
  el.textContent = cvData.photo ? "" : "👤";
}

function setupTemplate() {
  $("#templateSelect").value = currentTemplate;
  $("#templateSelect").addEventListener("change", e => {
    currentTemplate = e.target.value;
    localStorage.setItem("formacv.template", currentTemplate);
    refresh();
  });
}

function setupZoom() {
  function apply() {
    const page = $("#resumePage");
    page.style.zoom = (zoom / 100);
    $("#zoomValue").textContent = zoom + "%";
  }
  $("#zoomIn").addEventListener("click", () => { zoom = Math.min(110, zoom + 5); apply(); });
  $("#zoomOut").addEventListener("click", () => { zoom = Math.max(55, zoom - 5); apply(); });
  apply();
}

function setupMobile() {
  $$(".mobile-switcher button").forEach(btn => btn.addEventListener("click", () => {
    const view = btn.dataset.view;
    $(".workspace").classList.toggle("view-editor", view === "editor");
    $(".workspace").classList.toggle("view-preview", view === "preview");
    $$(".mobile-switcher button").forEach(b => b.classList.toggle("active", b === btn));
  }));
}

function setupActions() {
  $("#addExperienceBtn").addEventListener("click", () => addEntry("experience", cvData, refresh));
  $("#addEducationBtn").addEventListener("click", () => addEntry("education", cvData, refresh));
  $("#addProjectBtn").addEventListener("click", () => addEntry("projects", cvData, refresh));
  $("#addCustomFieldBtn").addEventListener("click", () => addCustomField(cvData, refresh));
  
  $("#downloadBtn").addEventListener("click", downloadPDF);

  const fab = $("#fabDownload");
  if (fab) {
    fab.addEventListener("click", () => {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setTimeout(downloadPDF, 250);
    });
  }

  $("#resetBtn").addEventListener("click", () => {
    if (!confirm("Start over? This will clear the CV saved in this browser.")) return;
    localStorage.removeItem(STORAGE_KEY);
    cvData = structuredClone(defaultData);
    hydrateReset();
    refresh();
    showToast("Your CV has been cleared.");
  });
}

function hydrateReset() {
  cvData.customFields = [];
  $$("[data-field]").forEach(el => el.value = "");
  ["experience", "education", "projects"].forEach(type => renderEntryForms(type, cvData[type]));
  updateAvatar();
  $("#photoInput").value = "";
}

function init() {
  hydrateFields();
  setupNavigation();
  setupPhoto();
  setupTemplate();
  setupZoom();
  setupMobile();
  setupActions();
  
  // Render entry forms and bind their events
  ["experience", "education", "projects"].forEach(type => renderEntryForms(type, cvData[type]));
  bindSingleEntryEvents(cvData, refresh);
  
  // Render custom fields
  renderCustomFields(cvData, refresh);
  
  updateAvatar();
  refresh();
}

document.addEventListener("DOMContentLoaded", init);