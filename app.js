/* Mishbahah Logic - V2.1
  Updated: Added custom modal logic for reset confirmation.
*/

const STORAGE_KEY = "tasbeeh_v5_data";

// تعريف الأذكار
const MODES = {
  ya_hayy_energy: {
    id: "ya_hayy_energy",
    label: "يا حي يا قيوم",
    target: 184,
    purpose: "تنشيط الطاقة الداخلية وتعزيز الاستمرارية",
    theme: "amber"
  },
  ya_hayy_wealth: {
    id: "ya_hayy_wealth",
    label: "يا حي يا قيوم",
    target: 333,
    purpose: "مواءمة الوعي مع الوفرة المادية",
    theme: "gold"
  },
  kahayas: {
    id: "kahayas",
    label: "كهيعص",
    target: 195,
    purpose: "الحماية والتحصين الطاقي",
    theme: "purple"
  },
  ya_ghani: {
    id: "ya_ghani",
    label: "يا غني",
    target: 444,
    purpose: "ترسيخ الاكتفاء والاستقرار المادي",
    theme: "blue"
  },
  istighfar: {
    id: "istighfar",
    label: "أستغفر الله",
    target: 1111,
    purpose: "تنقية السلوك وإعادة الضبط الداخلي",
    theme: "green"
  }
};

// الحالة الافتراضية
const state = {
  currentModeId: "ya_hayy_energy",
  counts: {}
};

// DOM Elements
const ui = {
  modesList: document.getElementById("modesList"),
  dhikrText: document.getElementById("dhikrText"),
  dhikrPurpose: document.getElementById("dhikrPurpose"),
  dhikrTarget: document.getElementById("dhikrTarget"),
  countValue: document.getElementById("countValue"),
  remainingValue: document.getElementById("remainingValue"),
  tapBtn: document.getElementById("tapBtn"),
  resetBtn: document.getElementById("resetBtn"),
  app: document.querySelector(".app"),
  body: document.body,
  // Modal Elements
  modal: document.getElementById("confirmModal"),
  modalCancel: document.getElementById("modalCancel"),
  modalConfirm: document.getElementById("modalConfirm")
};

/* --- Initialization --- */
function init() {
  loadState();
  renderModeButtons();
  updateUI();
}

/* --- State Management --- */
function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (saved) {
      if (saved.counts) state.counts = saved.counts;
      if (saved.currentModeId && MODES[saved.currentModeId]) {
        state.currentModeId = saved.currentModeId;
      }
    }
  } catch (e) { console.error("Load error", e); }
}

function saveState() {
  const dataToSave = {
    counts: state.counts,
    currentModeId: state.currentModeId
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
}

function getCount(modeId) {
  return state.counts[modeId] || 0;
}

/* --- UI Logic --- */
function renderModeButtons() {
  ui.modesList.innerHTML = "";
  Object.values(MODES).forEach(mode => {
    const btn = document.createElement("div");
    btn.className = "mode-chip";
    btn.textContent = mode.label + ` (${mode.target})`;
    btn.dataset.id = mode.id;
    
    btn.addEventListener("click", () => switchMode(mode.id));
    ui.modesList.appendChild(btn);
  });
}

function switchMode(modeId) {
  if (state.currentModeId === modeId) return;
  ui.app.classList.add("switching");
  setTimeout(() => {
    state.currentModeId = modeId;
    saveState();
    updateUI();
    ui.app.classList.remove("switching");
  }, 200);
}

function updateUI() {
  const mode = MODES[state.currentModeId];
  const currentCount = getCount(mode.id);

  ui.dhikrText.textContent = mode.label;
  ui.dhikrPurpose.textContent = mode.purpose;
  ui.dhikrTarget.textContent = `الهدف: ${mode.target}`;
  
  ui.countValue.textContent = currentCount;
  const remain = Math.max(0, mode.target - currentCount);
  ui.remainingValue.textContent = remain;

  ui.body.setAttribute("data-theme", mode.theme);

  document.querySelectorAll(".mode-chip").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.id === mode.id);
  });
  
  const activeBtn = document.querySelector(".mode-chip.active");
  if (activeBtn) {
    activeBtn.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

/* --- Actions & Modal Logic --- */
function increment() {
  const mode = MODES[state.currentModeId];
  const currentCount = getCount(mode.id);

  if (currentCount < mode.target) {
    state.counts[mode.id] = currentCount + 1;
    saveState();
    
    ui.countValue.textContent = state.counts[mode.id];
    ui.remainingValue.textContent = mode.target - state.counts[mode.id];
    
    if (navigator.vibrate) navigator.vibrate(30);
    
    ui.countValue.classList.remove("animate-bounce");
    void ui.countValue.offsetWidth;
    ui.countValue.classList.add("animate-bounce");
  }
}

// فتح النافذة
function openResetModal() {
  ui.modal.classList.add("active");
}

// إغلاق النافذة
function closeResetModal() {
  ui.modal.classList.remove("active");
}

// تنفيذ التصفير
function confirmReset() {
  state.counts[state.currentModeId] = 0;
  saveState();
  updateUI();
  closeResetModal();
}

/* --- Event Listeners --- */
ui.tapBtn.addEventListener("click", increment);

// Reset Flow
ui.resetBtn.addEventListener("click", openResetModal);
ui.modalCancel.addEventListener("click", closeResetModal);
ui.modalConfirm.addEventListener("click", confirmReset);

// إغلاق المودال عند الضغط خارج الكارت
ui.modal.addEventListener("click", (e) => {
  if (e.target === ui.modal) closeResetModal();
});

// Start
init();