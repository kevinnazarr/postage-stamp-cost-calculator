// =============================================
// RATE TABLE — Edit these values as needed.
// All amounts in USD. Rates are example/fixed
// values for demonstration purposes, NOT
// current USPS rates.
// =============================================

const RATE_TABLE = {
  "first-class-letter": {
    name: "First-Class Letter",
    baseRate: 0.73,      // up to 1 oz
    perOzRate: 0.24,     // per additional ounce
    freeOunces: 1,       // first ounce included in base rate
  },
  "first-class-large-envelope": {
    name: "First-Class Large Envelope",
    baseRate: 1.35,      // up to 1 oz
    perOzRate: 0.24,     // per additional ounce
    freeOunces: 1,
  },
  "priority-mail-flat-rate": {
    name: "Priority Mail Flat Rate",
    baseRate: 9.45,      // flat rate regardless of weight
    perOzRate: 0,        // no overage
    freeOunces: Infinity, // no weight overage applies
  },
};

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
const historySection = document.getElementById("historySection");
const historyList = document.getElementById("historyList");
const clearHistoryBtn = document.getElementById("clearHistoryBtn");
const weightError = document.getElementById("weight-error");

// =============================================
// CORE LOGIC
// =============================================

/**
 * Calculate postage cost for a given weight and mail type.
 * Returns { baseRate, overageFee, total } or null if invalid.
 */
function calculatePostage(weight, mailType) {
  const rate = RATE_TABLE[mailType];
  if (!rate) return null;

  if (typeof weight !== "number" || isNaN(weight) || weight <= 0) {
    return null;
  }

  const overageOunces = Math.max(0, weight - rate.freeOunces);
  const overageFee = parseFloat((overageOunces * rate.perOzRate).toFixed(2));
  const total = parseFloat((rate.baseRate + overageFee).toFixed(2));

  return {
    baseRate: rate.baseRate,
    overageFee: overageFee,
    total: total,
  };
}

// =============================================
// RENDERING
// =============================================

function formatCurrency(amount) {
  return "$" + amount.toFixed(2);
}

function renderResult(result) {
  baseRateEl.textContent = formatCurrency(result.baseRate);
  overageFeeEl.textContent = formatCurrency(result.overageFee);
  totalCostEl.textContent = formatCurrency(result.total);
  resultSection.hidden = false;
}

function renderEmptyResult() {
  baseRateEl.textContent = "—";
  overageFeeEl.textContent = "—";
  totalCostEl.textContent = "—";
  resultSection.hidden = true;
}

function renderHistory() {
  historyList.innerHTML = "";

  if (history.length === 0) {
    historySection.hidden = true;
    return;
  }

  historySection.hidden = false;

  history.forEach(function (item) {
    const li = document.createElement("li");
    li.textContent = item.weight + " oz \u2192 " + item.mailType + " \u2192 " + formatCurrency(item.cost);
    historyList.appendChild(li);
  });
}

function addToHistory(weight, mailType, cost) {
  const rate = RATE_TABLE[mailType];
  const displayName = rate ? rate.name : mailType;

  history.unshift({
    weight: weight,
    mailType: displayName,
    cost: cost,
  });

  // Keep only the last 5 items
  if (history.length > 5) {
    history = history.slice(0, 5);
  }

  renderHistory();
}

function clearHistory() {
  history = [];
  renderHistory();
}

// =============================================
// EVENT HANDLERS
// =============================================

function handleCalculate() {
  const weight = parseFloat(weightInput.value);

  // Validate weight
  if (weightInput.value.trim() === "" || isNaN(weight) || weight <= 0) {
    weightError.hidden = false;
    renderEmptyResult();
    return;
  }

  weightError.hidden = true;

  const mailType = mailTypeSelect.value;
  const result = calculatePostage(weight, mailType);

  if (result === null) {
    renderEmptyResult();
    return;
  }

  renderResult(result);
  addToHistory(weight, mailType, result.total);
}

// =============================================
// INITIALIZATION
// =============================================

calculateBtn.addEventListener("click", handleCalculate);

clearHistoryBtn.addEventListener("click", clearHistory);

// Allow pressing Enter in weight input to calculate
weightInput.addEventListener("keydown", function (e) {
  if (e.key === "Enter") {
    handleCalculate();
  }
});

// Clear error on input
weightInput.addEventListener("input", function () {
  if (weightError.hidden === false) {
    weightError.hidden = true;
  }
});
