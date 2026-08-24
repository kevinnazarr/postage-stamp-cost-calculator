// =============================================
// RATE TABLE — Fixed example rates (USD).
// NOT live USPS rates. Edit this object to
// change rates. Rates are intentionally easy
// to replace.
// =============================================

const RATE_TABLE = {
  "first-class-letter": {
    name: "Surat Biasa First-Class",
    baseRate: 0.73,      // up to 1 oz
    freeOunces: 1,       // first ounce included in base rate
    perOzRate: 0.24,     // per additional ounce
  },
  "first-class-large-envelope": {
    name: "Amplop Besar First-Class",
    baseRate: 1.35,      // up to 1 oz
    freeOunces: 1,
    perOzRate: 0.24,
  },
  "priority-mail-flat-rate": {
    name: "Priority Mail Flat Rate",
    baseRate: 9.45,      // flat rate regardless of weight
    freeOunces: Infinity, // no weight overage applies
    perOzRate: 0,
  },
};

const MAX_HISTORY = 5;

// =============================================
// STATE
// =============================================

let history = [];

// =============================================
// DOM ELEMENTS
// =============================================

const weightInput = document.getElementById("weight");
const mailTypeSelect = document.getElementById("mailType");
const calculateBtn = document.getElementById("calculateBtn");

const resultSection = document.getElementById("resultSection");
const baseRateEl = document.getElementById("baseRate");
const overageFeeEl = document.getElementById("overageFee");
const totalCostEl = document.getElementById("totalCost");
const totalCostDisplay = document.getElementById("totalCostDisplay");
const weightInfoEl = document.getElementById("weightInfo");
const serviceInfoEl = document.getElementById("serviceInfo");

const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const historyCountEl = document.getElementById("historyCount");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");

const weightError = document.getElementById("weight-error");
const rateTableBody = document.querySelector("#rateTable tbody");

// =============================================
// UTILITIES
// =============================================

function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}

// =============================================
// CALCULATION LOGIC
// =============================================

/**
 * Calculate postage cost for a given weight and mail type.
 * Returns { baseRate, overageFee, total } or null if invalid.
 */
function calculatePostage(weight, mailType) {
  var rate = RATE_TABLE[mailType];
  if (!rate) return null;
  if (typeof weight !== "number" || isNaN(weight) || weight <= 0) return null;

  var baseRate = rate.baseRate;

  var overageOunces = Math.max(0, weight - rate.freeOunces);
  var overageFee = parseFloat((overageOunces * rate.perOzRate).toFixed(2));

  var total = parseFloat((baseRate + overageFee).toFixed(2));

  return {
    baseRate: baseRate,
    overageFee: overageFee,
    total: total,
    weight: weight,
    mailType: mailType,
    mailTypeName: rate.name,
  };
}

// =============================================
// RENDERING
// =============================================

function renderResult(result) {
  baseRateEl.textContent = formatCurrency(result.baseRate);
  overageFeeEl.textContent = formatCurrency(result.overageFee);
  totalCostEl.textContent = formatCurrency(result.total);
  totalCostDisplay.textContent = formatCurrency(result.total);

  weightInfoEl.textContent = result.weight + " oz";
  serviceInfoEl.textContent = result.mailTypeName;

  resultSection.hidden = false;
  resultSection.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function renderEmptyResult() {
  baseRateEl.textContent = "\u2014";
  overageFeeEl.textContent = "\u2014";
  totalCostEl.textContent = "\u2014";
  totalCostDisplay.textContent = "$0.00";
  resultSection.hidden = true;
}

function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    historySection.hidden = true;
    historyCountEl.textContent = "0";
    return;
  }

  historySection.hidden = false;
  historyCountEl.textContent = history.length;

  history.forEach(function (item, index) {
    var li = document.createElement("li");
    li.className = "history-item";

    var meta = document.createElement("span");
    meta.className = "history-meta";
    meta.innerHTML =
      '<span class="history-number">#' + (index + 1) + "</span> " +
      "<strong>" + item.weight + " oz</strong> \u2192 " +
      item.mailType;

    var cost = document.createElement("span");
    cost.className = "history-cost";
    cost.textContent = formatCurrency(item.cost);

    li.appendChild(meta);
    li.appendChild(cost);
    historyList.appendChild(li);
  });
}

function addToHistory(result) {
  history.unshift({
    weight: result.weight,
    mailType: result.mailTypeName,
    cost: result.total,
  });

  if (history.length > MAX_HISTORY) {
    history = history.slice(0, MAX_HISTORY);
  }

  renderHistory();
}

function clearHistory() {
  history = [];
  renderHistory();
}

// =============================================
// REFERENCE TABLE
// =============================================

function renderReferenceTable() {
  rateTableBody.innerHTML = "";
  var keys = Object.keys(RATE_TABLE);
  for (var i = 0; i < keys.length; i++) {
    var key = keys[i];
    var r = RATE_TABLE[key];
    var tr = document.createElement("tr");
    tr.innerHTML =
      "<td>" + r.name + "</td>" +
      "<td>" + formatCurrency(r.baseRate) + "</td>" +
      "<td>" + (r.freeOunces === Infinity ? "Semua" : r.freeOunces + " oz") + "</td>" +
      "<td>" + formatCurrency(r.perOzRate) + "/oz</td>";
    rateTableBody.appendChild(tr);
  }
}

// =============================================
// EVENT HANDLERS
// =============================================

function handleCalculate() {
  var weight = parseFloat(weightInput.value);

  if (weightInput.value.trim() === "" || isNaN(weight) || weight <= 0) {
    weightError.hidden = false;
    renderEmptyResult();
    return;
  }

  weightError.hidden = true;

  var result = calculatePostage(weight, mailTypeSelect.value);

  if (result === null) {
    renderEmptyResult();
    return;
  }

  renderResult(result);
  addToHistory(result);
}

// =============================================
// INITIALIZATION
// =============================================

calculateBtn.addEventListener("click", handleCalculate);
clearHistoryBtn.addEventListener("click", clearHistory);

weightInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    handleCalculate();
  }
});

weightInput.addEventListener("input", function () {
  if (!weightError.hidden) {
    weightError.hidden = true;
  }
});

// Initial render
renderReferenceTable();
