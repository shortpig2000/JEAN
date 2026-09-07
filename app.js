/**
 * app.js - 君仔包子饅頭早餐 營運管理系統核心前端邏輯 (多商品早晚班接續版)
 */

// 應用程式狀態
let state = {
    currentDate: "", 
    currentTab: "tab-inventory",
    settings: {},
    currentRecord: {},
    reportPeriod: "week",
    historyTab: "month", // "month" 或 "year"
    historyMonth: "",    // "YYYY-MM"
    historyYear: 2026,   // YYYY
    editingProductId: null,
    editingExpenseIndex: null
};

// DOM 元素引用
const DOM = {
    // 導覽切換 (手機底欄與電腦側欄同步)
    navTabs: document.querySelectorAll('.nav-tab'),
    sidebarTabs: document.querySelectorAll('.sidebar-tab'),
    tabContents: document.querySelectorAll('.tab-content'),
    
    // 日期選擇
    operationDate: document.getElementById('operation-date'),
    displayDate: document.getElementById('display-date'),
    btnPrevDay: document.getElementById('btn-prev-day'),
    btnNextDay: document.getElementById('btn-next-day'),
    dateInputWrapper: document.querySelector('.date-input-wrapper'),
    
    // 設定與備份按鈕
    btnSettingsMobile: document.getElementById('btn-settings'),
    btnSettingsDesktop: document.getElementById('sidebar-btn-settings'),
    btnBackupMobile: document.getElementById('btn-backup'),
    btnBackupDesktop: document.getElementById('sidebar-btn-backup'),
    
    modalSettings: document.getElementById('modal-settings'),
    modalBackup: document.getElementById('modal-backup'),
    modalCloses: document.querySelectorAll('.modal-close-btn'),
    toast: document.getElementById('toast-message'),
    
    // 多品項盤點容器
    desktopInventoryTbody: document.getElementById('desktop-inventory-tbody'),
    mobileInventoryList: document.getElementById('mobile-inventory-list'),
    
    // 庫存警示
    inventoryAlert: document.getElementById('inventory-alert'),
    alertThresholdVal: document.getElementById('alert-threshold-val'),
    alertLowStockList: document.getElementById('alert-low-stock-list'),
    
    // 今日總量計算
    calcSalesBags: document.getElementById('calc-sales-bags'),
    calcSalesPieces: document.getElementById('calc-sales-pieces'),
    
    // 收銀對帳 (早晚班接續版)
    inputMorningBaseCash: document.getElementById('input-morning-base-cash'),
    inputMorningGoodsExpense: document.getElementById('input-morning-goods-expense'),
    inputMorningClosingCash: document.getElementById('input-morning-closing-cash'),
    calcMorningRevenue: document.getElementById('calc-morning-revenue'),
    
    inputAfternoonBaseCash: document.getElementById('input-afternoon-base-cash'),
    inputAfternoonGoodsExpense: document.getElementById('input-afternoon-goods-expense'),
    inputAfternoonClosingCash: document.getElementById('input-afternoon-closing-cash'),
    calcAfternoonRevenue: document.getElementById('calc-afternoon-revenue'),
    
    calcRevenue: document.getElementById('calc-revenue'), // 總實際營業額
    
    // 成本記帳
    desktopExpenseTbody: document.getElementById('desktop-expense-tbody'),
    mobileExpenseList: document.getElementById('mobile-expense-list'),
    expenseEmptyMsg: document.getElementById('expense-empty-msg'),
    inputExpenseName: document.getElementById('input-expense-name'),
    inputExpenseAmount: document.getElementById('input-expense-amount'),
    btnAddExpense: document.getElementById('btn-add-expense'),
    displayTotalExpense: document.getElementById('display-total-expense'),
    inputCardMonthlyFixedCost: document.getElementById('input-card-monthly-fixed-cost'),
    inputCardMonthlyStaffSalary: document.getElementById('input-card-monthly-staff-salary'),
    displayDailyAmortizedCost: document.getElementById('display-daily-amortized-cost'),
    
    // 歷史明細查詢 DOM 元素
    btnHistoryMonthTab: document.getElementById('btn-history-month-tab'),
    btnHistoryYearTab: document.getElementById('btn-history-year-tab'),
    historyMonthBar: document.getElementById('history-month-bar'),
    historyYearBar: document.getElementById('history-year-bar'),
    historyMonthPicker: document.getElementById('history-month-picker'),
    displayHistoryMonth: document.getElementById('display-history-month'),
    btnPrevMonth: document.getElementById('btn-prev-month'),
    btnNextMonth: document.getElementById('btn-next-month'),
    btnPrevYear: document.getElementById('btn-prev-year'),
    btnNextYear: document.getElementById('btn-next-year'),
    displayHistoryYear: document.getElementById('display-history-year'),
    historyYearPicker: document.getElementById('history-year-picker'),
    
    historySummaryRevenue: document.getElementById('history-summary-revenue'),
    historySummaryCost: document.getElementById('history-summary-cost'),
    historySummaryProfit: document.getElementById('history-summary-profit'),
    historySummarySales: document.getElementById('history-summary-sales'),
    historySummaryRevLabel: document.getElementById('history-summary-rev-label'),
    historySummaryCostLabel: document.getElementById('history-summary-cost-label'),
    historySummaryProfitLabel: document.getElementById('history-summary-profit-label'),
    historySummarySalesLabel: document.getElementById('history-summary-sales-label'),
    
    historyTableTitle: document.getElementById('history-table-title'),
    historyTableThead: document.getElementById('history-table-thead'),
    historyTableTbody: document.getElementById('history-table-tbody'),
    historyMobileTitle: document.getElementById('history-mobile-title'),
    historyMobileList: document.getElementById('history-mobile-list'),
    
    // 報表
    reportPeriodBtns: document.querySelectorAll('.filter-btn'),
    reportTotalRevenue: document.getElementById('report-total-revenue'),
    reportTotalCost: document.getElementById('report-total-cost'),
    reportTotalProfit: document.getElementById('report-total-profit'),
    chartCanvasTrends: document.getElementById('chart-canvas-trends'),
    chartCanvasStructure: document.getElementById('chart-canvas-structure'),
    chartCanvasProductSales: document.getElementById('chart-canvas-product-sales'),
    chartCanvasExpenseBreakdown: document.getElementById('chart-canvas-expense-breakdown'),
    reportProductSalesTbody: document.getElementById('report-product-sales-tbody'),
    reportExpensesTbody: document.getElementById('report-expenses-tbody'),
    
    // 設定表單與品項管理
    formSettings: document.getElementById('form-settings'),
    settingsDefaultCash: document.getElementById('settings-default-cash'),
    settingsMonthlyCost: document.getElementById('settings-monthly-cost'),
    settingsStaffSalary: document.getElementById('settings-staff-salary'),
    settingsWarningLimit: document.getElementById('settings-warning-limit'),
    settingsFirebaseConfig: document.getElementById('settings-firebase-config'),
    settingsProductList: document.getElementById('settings-product-list'),
    inputNewProductName: document.getElementById('input-new-product-name'),
    btnAddProduct: document.getElementById('btn-add-product'),
    commonExpensesDatalist: document.getElementById('common-expenses'),
    settingsExpenseTemplateList: document.getElementById('settings-expense-template-list'),
    inputNewExpenseTemplateName: document.getElementById('input-new-expense-template-name'),
    btnAddExpenseTemplate: document.getElementById('btn-add-expense-template'),
    restockReminderCard: document.getElementById('restock-reminder-card'),
    restockWarningLimitLabel: document.getElementById('restock-warning-limit-label'),
    restockReminderList: document.getElementById('restock-reminder-list'),
    
    // 備份與同步
    btnExportFile: document.getElementById('btn-export-file'),
    inputImportFile: document.getElementById('input-import-file'),
    btnCloudSync: document.getElementById('btn-cloud-sync'),
    lastSyncTime: document.getElementById('last-sync-time'),
    btnClearAllData: document.getElementById('btn-clear-all-data')
};

// 系統初始化
document.addEventListener("DOMContentLoaded", () => {
    initApp();
});

function initApp() {
    // 1. 初始化日期為今日
    const today = new Date();
    state.currentDate = formatDateString(today);
    DOM.operationDate.value = state.currentDate;
    updateDateDisplay();
    
    // 初始化歷史查詢的年份與月份
    state.historyYear = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    state.historyMonth = `${state.historyYear}-${mm}`;
    if (DOM.historyMonthPicker) {
        DOM.historyMonthPicker.value = state.historyMonth;
    }
    if (DOM.historyYearPicker) {
        DOM.historyYearPicker.value = state.historyYear;
    }
    updateHistoryDateDisplay();
    
    // 2. 載入系統設定
    loadSystemSettings();
    
    // 3. 載入目前日期的營運記錄
    loadRecordForDate(state.currentDate);
    
    // 4. 註冊事件監聽
    registerEvents();
    
    // 5. 渲染報表並初始化分頁
    renderReports();
    switchTab('tab-inventory');
}

/**
 * 格式化 Date 為 YYYY-MM-DD
 */
function formatDateString(date) {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
}

/**
 * 更新頂部日期列的顯示
 */
function updateDateDisplay() {
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const parts = state.currentDate.split('-');
    const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    const dayOfWeek = days[dateObj.getDay()];
    DOM.displayDate.textContent = `${parts[0]}年${parts[1]}月${parts[2]}日 (${dayOfWeek})`;
}

/**
 * 更新歷史查詢分頁中的年月顯示文字
 */
function updateHistoryDateDisplay() {
    if (DOM.displayHistoryMonth) {
        const parts = state.historyMonth.split('-');
        DOM.displayHistoryMonth.textContent = `${parts[0]}年${parts[1]}月`;
    }
    if (DOM.displayHistoryYear) {
        DOM.displayHistoryYear.textContent = `${state.historyYear}年`;
    }
}





function loadSystemSettings() {
    state.settings = getSettings();
    if (state.settings.monthlyStaffSalary === undefined) {
        state.settings.monthlyStaffSalary = 0;
    }
    const monthlyCost = state.settings.monthlyFixedCost;
    const staffSalary = state.settings.monthlyStaffSalary;
    const dailyAmortized = Math.round((monthlyCost + staffSalary) / 30);
    DOM.inputCardMonthlyFixedCost.value = monthlyCost;
    if (DOM.inputCardMonthlyStaffSalary) {
        DOM.inputCardMonthlyStaffSalary.value = staffSalary;
    }
    DOM.displayDailyAmortizedCost.textContent = `$${dailyAmortized.toLocaleString()} 元`;
    if (DOM.alertThresholdVal) {
        DOM.alertThresholdVal.textContent = state.settings.warningLimit;
    }
    DOM.settingsDefaultCash.value = state.settings.defaultBaseCash;
    DOM.settingsMonthlyCost.value = state.settings.monthlyFixedCost;
    if (DOM.settingsStaffSalary) {
        DOM.settingsStaffSalary.value = staffSalary;
    }
    DOM.settingsWarningLimit.value = state.settings.warningLimit;
    if (DOM.settingsFirebaseConfig) {
        DOM.settingsFirebaseConfig.value = state.settings.firebaseConfigRaw || "";
    }
    if (DOM.settingsGoogleSheetsUrl) {
        DOM.settingsGoogleSheetsUrl.value = state.settings.googleSheetsUrl || "";
    }
    renderExpenseDatalist();
    renderSettingsProductList();
    renderSettingsExpenseTemplateList();
}

function loadRecordForDate(dateStr) {
    state.currentRecord = getRecord(dateStr);
    
    // 填充收銀欄位 (早晚班接續版)
    DOM.inputMorningBaseCash.value = state.currentRecord.morningBaseCash;
    DOM.inputMorningClosingCash.value = state.currentRecord.morningClosingCash || "";
    DOM.inputMorningGoodsExpense.value = state.currentRecord.morningGoodsExpense !== undefined ? state.currentRecord.morningGoodsExpense : "";
    DOM.inputAfternoonBaseCash.value = state.currentRecord.afternoonBaseCash || "";
    DOM.inputAfternoonGoodsExpense.value = state.currentRecord.afternoonGoodsExpense !== undefined ? state.currentRecord.afternoonGoodsExpense : "";
    DOM.inputAfternoonClosingCash.value = state.currentRecord.afternoonClosingCash || "";
    
    // 填充面額欄位
    fillCashDenominations(state.currentRecord);
    
    // 切換收銀輸入模式 (歷史紀錄 vs 新版面額)
    toggleCashInputMethod(dateStr);
    
    // 渲染支出細項明細
    renderExpenseItems();
    
    // 動態產生多商品盤點介面
    renderInventoryFields();
    
    // 執行即時計算
    calculateInventoryTotals();
    calculateCash();
}

/**
 * 動態產生商品盤點介面（手機版與電腦版）
 */
function renderInventoryFields() {
    DOM.desktopInventoryTbody.innerHTML = '';
    DOM.mobileInventoryList.innerHTML = '';
    
    const products = state.settings.products;
    const inventory = state.currentRecord.inventory;
    
    products.forEach(p => {
        const prodData = inventory[p.id] || { yesterdayBags: 0, incomingBags: "", closingBags: "", salesBags: 0 };
        const rawShelves = prodData.shelves || ["", "", "", "", ""];
        const shelves = rawShelves.map(s => (s === 0 || s === "0" || s === "") ? "" : s);
        const rawTable = prodData.table !== undefined ? prodData.table : "";
        const table = (rawTable === 0 || rawTable === "0" || rawTable === "") ? "" : rawTable;
        const rawIncoming = (prodData.incomingBags !== '' && prodData.incomingBags !== undefined && prodData.incomingBags !== null) ? prodData.incomingBags : '';
        const incoming = (rawIncoming === 0 || rawIncoming === "0" || rawIncoming === "") ? "" : rawIncoming;
        const closingBags = prodData.closingBags !== undefined ? prodData.closingBags : "";
        
        const hasClosing = closingBags !== "" && closingBags !== undefined && closingBags !== null;
        const salesText = hasClosing ? prodData.salesBags : "-";
        const piecesText = hasClosing ? (prodData.salesBags * 3) : "-";
        const unitTextBags = hasClosing ? "包" : "";
        const unitTextPieces = hasClosing ? "顆" : "";
        
        // --- A. 電腦版表格行 ---
        const tr = document.createElement('tr');
        tr.id = `desktop-row-${p.id}`;
        
        tr.innerHTML = `
            <td><strong>${p.name}</strong></td>
            <td>
                <div class="tbl-input-wrapper" style="max-width: 90px;">
                    <input type="number" id="dt-yesterday-${p.id}" value="${prodData.yesterdayBags}" readonly style="width: 100%; text-align: center;">
                </div>
            </td>
            <td><input type="number" id="dt-incoming-${p.id}" value="${incoming}" class="table-compact-input table-compact-input-blue" min="0" step="1" pattern="[0-9]*" inputmode="numeric"></td>
            <!-- 5個層架輸入框 (白色) -->
            <td><input type="number" id="dt-shelf1-${p.id}" value="${shelves[0]}" class="table-compact-input" min="0" step="1" pattern="[0-9]*" inputmode="numeric"></td>
            <td><input type="number" id="dt-shelf2-${p.id}" value="${shelves[1]}" class="table-compact-input" min="0" step="1" pattern="[0-9]*" inputmode="numeric"></td>
            <td><input type="number" id="dt-shelf3-${p.id}" value="${shelves[2]}" class="table-compact-input" min="0" step="1" pattern="[0-9]*" inputmode="numeric"></td>
            <td><input type="number" id="dt-shelf4-${p.id}" value="${shelves[3]}" class="table-compact-input" min="0" step="1" pattern="[0-9]*" inputmode="numeric"></td>
            <td><input type="number" id="dt-shelf5-${p.id}" value="${shelves[4]}" class="table-compact-input" min="0" step="1" pattern="[0-9]*" inputmode="numeric"></td>
            <!-- 桌面輸入框 (黃色) -->
            <td><input type="number" id="dt-table-${p.id}" value="${table}" class="table-compact-input table-compact-input-yellow" min="0" step="1" pattern="[0-9]*" inputmode="numeric"></td>
            <!-- 結業剩餘合計框 (紅色) -->
            <td>
                <input type="number" id="dt-closing-${p.id}" value="${(closingBags !== '' && closingBags !== undefined && closingBags !== null) ? closingBags : ''}" class="table-compact-input table-compact-input-green" readonly>
            </td>
            <td>
                <span id="dt-sales-bags-${p.id}" class="tbl-sales-val">${salesText}</span> <span id="dt-sales-bags-unit-${p.id}" class="val-unit">${unitTextBags}</span>
            </td>
            <td>
                <span id="dt-sales-pieces-${p.id}" class="tbl-pieces-val">${piecesText}</span> <span id="dt-sales-pieces-unit-${p.id}" class="val-unit">${unitTextPieces}</span>
            </td>
        `;
        DOM.desktopInventoryTbody.appendChild(tr);
        
        // --- B. 手機版品項卡片（緊湊版）---
        const card = document.createElement('div');
        card.className = 'mobile-inventory-card compact';
        card.id = `mobile-card-${p.id}`;
        
        card.innerHTML = `
            <!-- 標題列：品名 + 昨留 + 入庫 -->
            <div class="mc-header">
                <span class="mc-name">${p.name}</span>
                <div class="mc-meta">
                    <span class="mc-meta-label">昨留</span>
                    <input type="number" id="mb-yesterday-${p.id}" value="${prodData.yesterdayBags}" readonly class="mc-mini-input mc-readonly">
                    <span class="mc-meta-label" style="color:#0d47a1;">入庫</span>
                    <input type="number" id="mb-incoming-${p.id}" value="${incoming}" min="0" inputmode="numeric" class="mc-mini-input mc-blue">
                </div>
            </div>
            <!-- 架位列：架1~5 + 桌面，一行排完 -->
            <div class="mc-shelves">
                <div class="mc-shelf-item">
                    <span class="mc-shelf-label">架1</span>
                    <input type="number" id="mb-shelf1-${p.id}" value="${shelves[0]}" min="0" inputmode="numeric" class="mc-shelf-input">
                </div>
                <div class="mc-shelf-item">
                    <span class="mc-shelf-label">架2</span>
                    <input type="number" id="mb-shelf2-${p.id}" value="${shelves[1]}" min="0" inputmode="numeric" class="mc-shelf-input">
                </div>
                <div class="mc-shelf-item">
                    <span class="mc-shelf-label">架3</span>
                    <input type="number" id="mb-shelf3-${p.id}" value="${shelves[2]}" min="0" inputmode="numeric" class="mc-shelf-input">
                </div>
                <div class="mc-shelf-item">
                    <span class="mc-shelf-label">架4</span>
                    <input type="number" id="mb-shelf4-${p.id}" value="${shelves[3]}" min="0" inputmode="numeric" class="mc-shelf-input">
                </div>
                <div class="mc-shelf-item">
                    <span class="mc-shelf-label">架5</span>
                    <input type="number" id="mb-shelf5-${p.id}" value="${shelves[4]}" min="0" inputmode="numeric" class="mc-shelf-input">
                </div>
                <div class="mc-shelf-item mc-table-item">
                    <span class="mc-shelf-label" style="color:#b78103;">桌</span>
                    <input type="number" id="mb-table-${p.id}" value="${table}" min="0" inputmode="numeric" class="mc-shelf-input mc-shelf-table">
                </div>
            </div>
            <!-- 結果列：結業剩餘 + 銷量 -->
            <div class="mc-footer">
                <div class="mc-closing">
                    <span class="mc-closing-label">結業剩餘</span>
                    <input type="number" id="mb-closing-${p.id}" value="${(closingBags !== '' && closingBags !== undefined && closingBags !== null) ? closingBags : ''}" readonly class="mc-closing-input">
                    <span style="font-size:0.75rem;color:#2e7d32;">包</span>
                </div>
                <div class="mc-sales">
                    <span id="mb-sales-bags-${p.id}" class="mc-sales-val">${salesText}</span><span id="mb-sales-bags-unit-${p.id}" style="font-size:0.72rem;color:var(--text-sub);">${unitTextBags}</span>
                    <span style="font-size:0.72rem;color:var(--text-light);margin:0 2px;">·</span>
                    <span id="mb-sales-pieces-${p.id}" class="mc-sales-val">${piecesText}</span><span id="mb-sales-pieces-unit-${p.id}" style="font-size:0.72rem;color:var(--text-sub);">${unitTextPieces}</span>
                </div>
            </div>
        `;
        DOM.mobileInventoryList.appendChild(card);
        setupProductInputEvents(p.id);
        updateClosingInputColor(p.id, closingBags);
    });
}

function setupProductInputEvents(productId) {
    const dtIncoming = document.getElementById(`dt-incoming-${productId}`);
    const mbIncoming = document.getElementById(`mb-incoming-${productId}`);
    
    const dtShelves = [
        document.getElementById(`dt-shelf1-${productId}`),
        document.getElementById(`dt-shelf2-${productId}`),
        document.getElementById(`dt-shelf3-${productId}`),
        document.getElementById(`dt-shelf4-${productId}`),
        document.getElementById(`dt-shelf5-${productId}`)
    ];
    const dtTable = document.getElementById(`dt-table-${productId}`);
    
    const mbShelves = [
        document.getElementById(`mb-shelf1-${productId}`),
        document.getElementById(`mb-shelf2-${productId}`),
        document.getElementById(`mb-shelf3-${productId}`),
        document.getElementById(`mb-shelf4-${productId}`),
        document.getElementById(`mb-shelf5-${productId}`)
    ];
    const mbTable = document.getElementById(`mb-table-${productId}`);
    
    // 入庫對齊
    dtIncoming.addEventListener('input', (e) => {
        let val = e.target.value;
        if (val !== "") {
            if (parseInt(val) < 0) val = "0";
            if (val.includes('.')) val = Math.round(parseFloat(val)).toString();
        }
        mbIncoming.value = val;
        dtIncoming.value = val;
        recalculateClosingAndSales(productId);
    });
    
    mbIncoming.addEventListener('input', (e) => {
        let val = e.target.value;
        if (val !== "") {
            if (parseInt(val) < 0) val = "0";
            if (val.includes('.')) val = Math.round(parseFloat(val)).toString();
        }
        dtIncoming.value = val;
        mbIncoming.value = val;
        recalculateClosingAndSales(productId);
    });
    
    // 層架與桌面對齊及重算
    dtShelves.forEach((el, idx) => {
        el.addEventListener('input', (e) => {
            let val = e.target.value;
            if (val !== "") {
                if (parseInt(val) < 0) val = "0";
                if (val.includes('.')) val = Math.round(parseFloat(val)).toString();
            }
            el.value = val;
            mbShelves[idx].value = val;
            recalculateClosingAndSales(productId);
        });
    });
    
    mbShelves.forEach((el, idx) => {
        el.addEventListener('input', (e) => {
            let val = e.target.value;
            if (val !== "") {
                if (parseInt(val) < 0) val = "0";
                if (val.includes('.')) val = Math.round(parseFloat(val)).toString();
            }
            el.value = val;
            dtShelves[idx].value = val;
            recalculateClosingAndSales(productId);
        });
    });
    
    dtTable.addEventListener('input', (e) => {
        let val = e.target.value;
        if (val !== "") {
            if (parseInt(val) < 0) val = "0";
            if (val.includes('.')) val = Math.round(parseFloat(val)).toString();
        }
        dtTable.value = val;
        mbTable.value = val;
        recalculateClosingAndSales(productId);
    });
    
    mbTable.addEventListener('input', (e) => {
        let val = e.target.value;
        if (val !== "") {
            if (parseInt(val) < 0) val = "0";
            if (val.includes('.')) val = Math.round(parseFloat(val)).toString();
        }
        dtTable.value = val;
        mbTable.value = val;
        recalculateClosingAndSales(productId);
    });
}

function recalculateClosingAndSales(productId) {
    const dtIncoming = document.getElementById(`dt-incoming-${productId}`);
    const mbIncoming = document.getElementById(`mb-incoming-${productId}`);
    const dtClosing = document.getElementById(`dt-closing-${productId}`);
    const mbClosing = document.getElementById(`mb-closing-${productId}`);
    
    const incomingValStr = (mbIncoming && mbIncoming.value !== "") ? mbIncoming.value : (dtIncoming ? dtIncoming.value : "");

    const shelfVals = [];
    let hasAnyInput = false;
    
    for (let i = 1; i <= 5; i++) {
        const dtEl = document.getElementById(`dt-shelf${i}-${productId}`);
        const mbEl = document.getElementById(`mb-shelf${i}-${productId}`);
        let valStr = "";
        if (mbEl && mbEl.value !== "") {
            valStr = mbEl.value;
        } else if (dtEl && dtEl.value !== "") {
            valStr = dtEl.value;
        }

        if (valStr !== "") {
            let parsedVal = parseInt(valStr);
            if (isNaN(parsedVal)) parsedVal = 0;
            shelfVals.push(parsedVal);
            hasAnyInput = true;
        } else {
            shelfVals.push("");
        }
    }
    
    const dtTableEl = document.getElementById(`dt-table-${productId}`);
    const mbTableEl = document.getElementById(`mb-table-${productId}`);
    let tableStr = "";
    if (mbTableEl && mbTableEl.value !== "") {
        tableStr = mbTableEl.value;
    } else if (dtTableEl && dtTableEl.value !== "") {
        tableStr = dtTableEl.value;
    }

    let tableVal = "";
    if (tableStr !== "") {
        tableVal = parseInt(tableStr);
        if (isNaN(tableVal)) tableVal = 0;
        hasAnyInput = true;
    }
    
    if (!hasAnyInput) {
        if (dtClosing) dtClosing.value = "";
        if (mbClosing) mbClosing.value = "";
        updateClosingInputColor(productId, "");
        updateProductSales(productId, incomingValStr, "", [], "");
        return;
    }
    
    let sum = 0;
    shelfVals.forEach(v => {
        if (v !== "") sum += v;
    });
    if (tableVal !== "") sum += tableVal;
    
    dtClosing.value = sum;
    mbClosing.value = sum;
    
    updateClosingInputColor(productId, sum);
    updateProductSales(productId, dtIncoming.value, sum, shelfVals, tableVal);
}

function updateProductSales(productId, incoming, closing, shelves, table) {
    const yesterdayInput = document.getElementById(`dt-yesterday-${productId}`);
    const yesterday = parseInt(yesterdayInput.value) || 0;
    
    const incVal = incoming !== "" ? parseInt(incoming) : 0;
    const clsVal = closing !== "" ? parseInt(closing) : 0;
    
    let sales = (yesterday + incVal) - clsVal;
    if (sales < 0) sales = 0;
    
    const hasClosing = closing !== "";
    const salesText = hasClosing ? sales : "-";
    const piecesText = hasClosing ? (sales * 3) : "-";
    const unitTextBags = hasClosing ? "包" : "";
    const unitTextPieces = hasClosing ? "顆" : "";
    
    document.getElementById(`dt-sales-bags-${productId}`).textContent = salesText;
    document.getElementById(`dt-sales-bags-unit-${productId}`).textContent = unitTextBags;
    document.getElementById(`dt-sales-pieces-${productId}`).textContent = piecesText;
    document.getElementById(`dt-sales-pieces-unit-${productId}`).textContent = unitTextPieces;
    
    document.getElementById(`mb-sales-bags-${productId}`).textContent = salesText;
    document.getElementById(`mb-sales-bags-unit-${productId}`).textContent = unitTextBags;
    document.getElementById(`mb-sales-pieces-${productId}`).textContent = piecesText;
    document.getElementById(`mb-sales-pieces-unit-${productId}`).textContent = unitTextPieces;
    
    state.currentRecord.inventory[productId] = {
        yesterdayBags: yesterday,
        incomingBags: incoming,
        shelves: shelves || ["", "", "", "", ""],
        table: table !== undefined ? table : "",
        closingBags: closing,
        salesBags: sales
    };
    
    calculateInventoryTotals();
    saveCurrentData();
}

/**
 * 統計今日銷量總數，並更新警示看板
 */
function calculateInventoryTotals() {
    let totalSalesBags = 0;
    let hasAnyClosing = false;
    
    const restockItems = [];
    const limit = state.settings.warningLimit || 8;
    
    state.settings.products.forEach(p => {
        const prodData = state.currentRecord.inventory[p.id];
        if (prodData && prodData.closingBags !== "" && prodData.closingBags !== undefined && prodData.closingBags !== null) {
            const closing = parseInt(prodData.closingBags);
            const val = isNaN(closing) ? 0 : closing;
            totalSalesBags += prodData.salesBags || 0;
            hasAnyClosing = true;
            
            if (val < limit) {
                restockItems.push({
                    name: p.name,
                    closing: val
                });
            }
        }
    });
    
    DOM.calcSalesBags.textContent = hasAnyClosing ? totalSalesBags : "-";
    DOM.calcSalesPieces.textContent = hasAnyClosing ? (totalSalesBags * 3) : "-";
    
    if (DOM.restockReminderCard && DOM.restockReminderList) {
        if (restockItems.length > 0) {
            DOM.restockWarningLimitLabel.textContent = `(剩餘量 < ${limit} 包)`;
            DOM.restockReminderList.innerHTML = restockItems.map(item => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 10px 14px; background-color: #fff9f9; border: 1px solid #ffcdd2; border-radius: 8px; box-sizing: border-box;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #ef4444; font-size: 1.1rem;">🔴</span>
                        <strong style="color: var(--text-main); font-size: 1rem;">${item.name}</strong>
                    </div>
                    <div>
                        <span style="color: #c62828; font-weight: 800; font-size: 1.05rem;">剩餘 ${item.closing} 包</span>
                        <span style="color: var(--text-light); font-size: 0.8rem; margin-left: 6px;">(低於設定 ${limit} 包)</span>
                    </div>
                </div>
            `).join('');
            DOM.restockReminderCard.style.display = 'block';
        } else {
            if (hasAnyClosing) {
                DOM.restockWarningLimitLabel.textContent = `(剩餘量 < ${limit} 包)`;
                DOM.restockReminderList.innerHTML = `
                    <div style="display: flex; align-items: center; gap: 8px; padding: 10px 14px; background-color: #f4fbf7; border: 1px solid #c8e6c9; border-radius: 8px; color: #2e7d32; font-weight: bold; font-size: 0.95rem; box-sizing: border-box;">
                        <span>✨</span> 今日所有品項庫存充足，無須補貨。
                    </div>
                `;
                DOM.restockReminderCard.style.display = 'block';
            } else {
                DOM.restockReminderCard.style.display = 'none';
            }
        }
    }
}

/**
 * 即時連動計算早晚班接續營業額與今日實際總營業額
 */
function calculateCash() {
    const morningBase = parseFloat(DOM.inputMorningBaseCash.value) || 0;
    const morningGoodsExpense = parseFloat(DOM.inputMorningGoodsExpense.value) || 0;
    const morningClosing = parseFloat(DOM.inputMorningClosingCash.value) || 0;
    const hasMorningClosing = DOM.inputMorningClosingCash.value !== "";
    
    // 1. 早上營業額 = (早上結業 + 早上貨款支出) - 早上底層 (若未輸入早上結業，則早上營業額為0)
    const morningRevenue = hasMorningClosing ? ((morningClosing + morningGoodsExpense) - morningBase) : 0;
    DOM.calcMorningRevenue.textContent = `$${morningRevenue.toLocaleString()}`;
    
    // 2. 下午開市底層金自動滾動接續「早上結業現金」
    // 若早上還沒輸入結業現金，則下午底層金預設先帶入早上開市底層金以維持基礎數字
    const afternoonBase = hasMorningClosing ? morningClosing : morningBase;
    DOM.inputAfternoonBaseCash.value = afternoonBase;
    
    const afternoonGoodsExpense = parseFloat(DOM.inputAfternoonGoodsExpense.value) || 0;
    const afternoonClosing = parseFloat(DOM.inputAfternoonClosingCash.value) || 0;
    const hasAfternoonClosing = DOM.inputAfternoonClosingCash.value !== "";
    
    // 3. 下午營業額 = (下午結業 + 下午貨款支出) - 下午底層
    const afternoonRevenue = hasAfternoonClosing ? ((afternoonClosing + afternoonGoodsExpense) - afternoonBase) : 0;
    DOM.calcAfternoonRevenue.textContent = `$${afternoonRevenue.toLocaleString()}`;
    
    // 4. 今日實際總營業額計算邏輯 (避免未開業時產生大筆負值)
    let totalRevenue = 0;
    if (hasMorningClosing && hasAfternoonClosing) {
        totalRevenue = morningRevenue + afternoonRevenue;
    } else if (hasMorningClosing) {
        totalRevenue = morningRevenue;
    } else if (hasAfternoonClosing) {
        totalRevenue = afternoonRevenue;
    }
    
    DOM.calcRevenue.textContent = totalRevenue.toLocaleString();
}

function fillCashDenominations(record) {
    const morning = record.morningClosingDetails || { paper: "", c50: "", c10: "", c5: "", c1: "" };
    if (document.getElementById('morning-denom-paper')) {
        document.getElementById('morning-denom-paper').value = morning.paper !== undefined ? morning.paper : "";
        document.getElementById('morning-denom-50').value = morning.c50 !== undefined ? morning.c50 : "";
        document.getElementById('morning-denom-10').value = morning.c10 !== undefined ? morning.c10 : "";
        document.getElementById('morning-denom-5').value = morning.c5 !== undefined ? morning.c5 : "";
        document.getElementById('morning-denom-1').value = morning.c1 !== undefined ? morning.c1 : "";
    }

    const afternoon = record.afternoonClosingDetails || { paper: "", c50: "", c10: "", c5: "", c1: "" };
    if (document.getElementById('afternoon-denom-paper')) {
        document.getElementById('afternoon-denom-paper').value = afternoon.paper !== undefined ? afternoon.paper : "";
        document.getElementById('afternoon-denom-50').value = afternoon.c50 !== undefined ? afternoon.c50 : "";
        document.getElementById('afternoon-denom-10').value = afternoon.c10 !== undefined ? afternoon.c10 : "";
        document.getElementById('afternoon-denom-5').value = afternoon.c5 !== undefined ? afternoon.c5 : "";
        document.getElementById('afternoon-denom-1').value = afternoon.c1 !== undefined ? afternoon.c1 : "";
    }
}

function toggleCashInputMethod(dateStr) {
    const isHistorical = dateStr <= '2026-07-28';
    
    const morningGrids = document.querySelectorAll('#form-cash-morning .denomination-grid');
    const afternoonGrids = document.querySelectorAll('#form-cash-afternoon .denomination-grid');
    
    if (isHistorical) {
        morningGrids.forEach(g => g.style.display = 'none');
        afternoonGrids.forEach(g => g.style.display = 'none');
        
        DOM.inputMorningClosingCash.removeAttribute('readonly');
        DOM.inputMorningClosingCash.placeholder = "請輸入結業現金金額";
        DOM.inputMorningClosingCash.style.backgroundColor = "";
        
        DOM.inputAfternoonClosingCash.removeAttribute('readonly');
        DOM.inputAfternoonClosingCash.placeholder = "請輸入結業現金金額";
        DOM.inputAfternoonClosingCash.style.backgroundColor = "";
    } else {
        morningGrids.forEach(g => g.style.display = 'grid');
        afternoonGrids.forEach(g => g.style.display = 'grid');
        
        DOM.inputMorningClosingCash.setAttribute('readonly', 'true');
        DOM.inputMorningClosingCash.placeholder = "由下方分項加總計算";
        DOM.inputMorningClosingCash.style.backgroundColor = "var(--bg-card)";
        
        DOM.inputAfternoonClosingCash.setAttribute('readonly', 'true');
        DOM.inputAfternoonClosingCash.placeholder = "由下方分項加總計算";
        DOM.inputAfternoonClosingCash.style.backgroundColor = "var(--bg-card)";
    }
}

function recalculateClosingCashAndSave(shift) {
    const isMorning = shift === 'morning';
    const prefix = isMorning ? 'morning' : 'afternoon';
    
    const paper = parseInt(document.getElementById(`${prefix}-denom-paper`).value) || 0;
    // 硬幣各格現已直接輸入金額（非個數），直接加總即可
    const c50 = parseInt(document.getElementById(`${prefix}-denom-50`).value) || 0;
    const c10 = parseInt(document.getElementById(`${prefix}-denom-10`).value) || 0;
    const c5 = parseInt(document.getElementById(`${prefix}-denom-5`).value) || 0;
    const c1 = parseInt(document.getElementById(`${prefix}-denom-1`).value) || 0;
    
    const total = paper + c50 + c10 + c5 + c1;
    
    const allEmpty = 
        document.getElementById(`${prefix}-denom-paper`).value === "" &&
        document.getElementById(`${prefix}-denom-50`).value === "" &&
        document.getElementById(`${prefix}-denom-10`).value === "" &&
        document.getElementById(`${prefix}-denom-5`).value === "" &&
        document.getElementById(`${prefix}-denom-1`).value === "";
        
    const finalVal = allEmpty ? "" : total;
    if (isMorning) {
        DOM.inputMorningClosingCash.value = finalVal;
        state.currentRecord.morningClosingCash = finalVal === "" ? 0 : finalVal;
        state.currentRecord.morningClosingDetails = {
            paper: document.getElementById('morning-denom-paper').value,
            c50: document.getElementById('morning-denom-50').value,
            c10: document.getElementById('morning-denom-10').value,
            c5: document.getElementById('morning-denom-5').value,
            c1: document.getElementById('morning-denom-1').value
        };
    } else {
        DOM.inputAfternoonClosingCash.value = finalVal;
        state.currentRecord.afternoonClosingCash = finalVal === "" ? 0 : finalVal;
        state.currentRecord.afternoonClosingDetails = {
            paper: document.getElementById('afternoon-denom-paper').value,
            c50: document.getElementById('afternoon-denom-50').value,
            c10: document.getElementById('afternoon-denom-10').value,
            c5: document.getElementById('afternoon-denom-5').value,
            c1: document.getElementById('afternoon-denom-1').value
        };
    }
    
    calculateCash();
    saveCurrentData();
}

/**
 * 將目前資料儲存至 localStorage
 */
function saveCurrentData() {
    const inventoryData = {};
    state.settings.products.forEach(p => {
        const dtYesterday = document.getElementById(`dt-yesterday-${p.id}`);
        const dtIncoming = document.getElementById(`dt-incoming-${p.id}`);
        const dtClosing = document.getElementById(`dt-closing-${p.id}`);
        const mbIncoming = document.getElementById(`mb-incoming-${p.id}`);
        const mbClosing = document.getElementById(`mb-closing-${p.id}`);
        
        if (dtYesterday && dtIncoming && dtClosing) {
            // 讀取各架和桌面的值 (優先讀取有值的欄位，兼顧手機版 mb- 與電腦版 dt-)
            const shelves = [];
            for (let i = 1; i <= 5; i++) {
                const dtEl = document.getElementById(`dt-shelf${i}-${p.id}`);
                const mbEl = document.getElementById(`mb-shelf${i}-${p.id}`);
                let valStr = "";
                if (mbEl && mbEl.value !== "") {
                    valStr = mbEl.value;
                } else if (dtEl && dtEl.value !== "") {
                    valStr = dtEl.value;
                }
                shelves.push(valStr !== "" ? parseInt(valStr) : "");
            }
            
            const dtTableEl = document.getElementById(`dt-table-${p.id}`);
            const mbTableEl = document.getElementById(`mb-table-${p.id}`);
            let tableValStr = "";
            if (mbTableEl && mbTableEl.value !== "") {
                tableValStr = mbTableEl.value;
            } else if (dtTableEl && dtTableEl.value !== "") {
                tableValStr = dtTableEl.value;
            }
            const table = tableValStr !== "" ? parseInt(tableValStr) : "";
            
            // 直接使用 state 裡已由 updateProductSales() 正確算好的銷量
            const prevState = state.currentRecord?.inventory?.[p.id] || {};
            
            const incomingVal = (mbIncoming && mbIncoming.value !== "") ? mbIncoming.value : (dtIncoming && dtIncoming.value !== "" ? dtIncoming.value : "");
            const closingVal = (mbClosing && mbClosing.value !== "") ? mbClosing.value : (dtClosing && dtClosing.value !== "" ? dtClosing.value : "");

            inventoryData[p.id] = {
                yesterdayBags: parseInt(dtYesterday.value) || 0,
                incomingBags: incomingVal !== "" ? parseInt(incomingVal) : "",
                shelves: shelves,
                table: table,
                closingBags: closingVal !== "" ? parseInt(closingVal) : "",
                salesBags: prevState.salesBags !== undefined ? prevState.salesBags : 0
            };
        } else {
            // 預防 DOM 尚未渲染時的防呆機制
            const prevRecord = state.currentRecord?.inventory?.[p.id] || {};
            inventoryData[p.id] = {
                yesterdayBags: prevRecord.yesterdayBags || 0,
                incomingBags: prevRecord.incomingBags !== undefined ? prevRecord.incomingBags : "",
                shelves: prevRecord.shelves || ["", "", "", "", ""],
                table: prevRecord.table !== undefined ? prevRecord.table : "",
                closingBags: prevRecord.closingBags !== undefined ? prevRecord.closingBags : "",
                salesBags: prevRecord.salesBags || 0
            };
        }
    });
    
    // 取得收銀欄位
    const morningBaseCash = parseFloat(DOM.inputMorningBaseCash.value) || 0;
    const morningGoodsExpense = DOM.inputMorningGoodsExpense.value !== "" ? parseFloat(DOM.inputMorningGoodsExpense.value) : 0;
    const morningClosingCash = DOM.inputMorningClosingCash.value !== "" ? parseFloat(DOM.inputMorningClosingCash.value) : 0;
    const afternoonBaseCash = parseFloat(DOM.inputAfternoonBaseCash.value) || 0;
    const afternoonGoodsExpense = DOM.inputAfternoonGoodsExpense.value !== "" ? parseFloat(DOM.inputAfternoonGoodsExpense.value) : 0;
    const afternoonClosingCash = DOM.inputAfternoonClosingCash.value !== "" ? parseFloat(DOM.inputAfternoonClosingCash.value) : 0;
    
    const morningClosingDetails = {
        paper: document.getElementById('morning-denom-paper') ? document.getElementById('morning-denom-paper').value : "",
        c50: document.getElementById('morning-denom-50') ? document.getElementById('morning-denom-50').value : "",
        c10: document.getElementById('morning-denom-10') ? document.getElementById('morning-denom-10').value : "",
        c5: document.getElementById('morning-denom-5') ? document.getElementById('morning-denom-5').value : "",
        c1: document.getElementById('morning-denom-1') ? document.getElementById('morning-denom-1').value : ""
    };
    const afternoonClosingDetails = {
        paper: document.getElementById('afternoon-denom-paper') ? document.getElementById('afternoon-denom-paper').value : "",
        c50: document.getElementById('afternoon-denom-50') ? document.getElementById('afternoon-denom-50').value : "",
        c10: document.getElementById('afternoon-denom-10') ? document.getElementById('afternoon-denom-10').value : "",
        c5: document.getElementById('afternoon-denom-5') ? document.getElementById('afternoon-denom-5').value : "",
        c1: document.getElementById('afternoon-denom-1') ? document.getElementById('afternoon-denom-1').value : ""
    };

    const record = {
        inventory: inventoryData,
        morningBaseCash,
        morningGoodsExpense,
        morningClosingCash,
        morningClosingDetails,
        afternoonBaseCash,
        afternoonGoodsExpense,
        afternoonClosingCash,
        afternoonClosingDetails,
        expenseItems: state.currentRecord.expenseItems || [],
        notes: state.currentRecord.notes || ""
    };
    
    saveRecord(state.currentDate, record);
    
    // 更新記憶體快取中的加總營業額
    state.currentRecord = getRecord(state.currentDate);
    
    if (state.currentTab === "tab-reports") {
        renderReports();
    }
}

/**
 * 註冊 UI 事件監聽
 */
function registerEvents() {
    // 1. 導覽切換
    const allTabBtns = [];
    DOM.navTabs.forEach(tab => allTabBtns.push(tab));
    DOM.sidebarTabs.forEach(tab => allTabBtns.push(tab));
    
    allTabBtns.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabId = tab.dataset.tab;
            switchTab(tabId);
        });
    });
    
    // 2. 日期微調與選擇
    DOM.btnPrevDay.addEventListener('click', () => adjustDate(-1));
    DOM.btnNextDay.addEventListener('click', () => adjustDate(1));
    DOM.operationDate.addEventListener('change', (e) => {
        const selectedDate = e.target.value;
        if (selectedDate) {
            state.currentDate = selectedDate;
            updateDateDisplay();
            loadRecordForDate(state.currentDate);
            if (state.currentTab === "tab-reports") {
                renderReports();
            }
        }
    });
    
    // 解決部分行動裝置點擊隱藏 date input 無法觸發行事曆的問題
    if (DOM.dateInputWrapper && DOM.operationDate) {
        DOM.dateInputWrapper.addEventListener('click', () => {
            try {
                if (typeof DOM.operationDate.showPicker === 'function') {
                    DOM.operationDate.showPicker();
                } else {
                    DOM.operationDate.focus();
                    DOM.operationDate.click();
                }
            } catch (err) {
                console.warn("Failed to trigger showPicker, falling back to focus/click", err);
                DOM.operationDate.focus();
                DOM.operationDate.click();
            }
        });
    }

    
    // 3. 收銀輸入變更與接續 (早上底層、早上結業、下午結業)
    DOM.inputMorningBaseCash.addEventListener('input', () => {
        if (parseFloat(DOM.inputMorningBaseCash.value) < 0) DOM.inputMorningBaseCash.value = 0;
        calculateCash();
        saveCurrentData();
    });

    if (DOM.inputMorningGoodsExpense) {
        DOM.inputMorningGoodsExpense.addEventListener('input', () => {
            if (parseFloat(DOM.inputMorningGoodsExpense.value) < 0) DOM.inputMorningGoodsExpense.value = 0;
            calculateCash();
            saveCurrentData();
        });
    }

    if (DOM.inputAfternoonGoodsExpense) {
        DOM.inputAfternoonGoodsExpense.addEventListener('input', () => {
            if (parseFloat(DOM.inputAfternoonGoodsExpense.value) < 0) DOM.inputAfternoonGoodsExpense.value = 0;
            calculateCash();
            saveCurrentData();
        });
    }

    if (DOM.inputMorningClosingCash) {
        DOM.inputMorningClosingCash.addEventListener('input', () => {
            const isHistorical = state.currentDate <= '2026-07-28';
            if (isHistorical) {
                if (parseFloat(DOM.inputMorningClosingCash.value) < 0) DOM.inputMorningClosingCash.value = 0;
                calculateCash();
                saveCurrentData();
            }
        });
    }

    if (DOM.inputAfternoonClosingCash) {
        DOM.inputAfternoonClosingCash.addEventListener('input', () => {
            const isHistorical = state.currentDate <= '2026-07-28';
            if (isHistorical) {
                if (parseFloat(DOM.inputAfternoonClosingCash.value) < 0) DOM.inputAfternoonClosingCash.value = 0;
                calculateCash();
                saveCurrentData();
            }
        });
    }

    const morningDenomInputs = [
        'morning-denom-paper', 'morning-denom-50', 
        'morning-denom-10', 'morning-denom-5', 'morning-denom-1'
    ];
    morningDenomInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                let val = e.target.value;
                if (val !== "") {
                    if (parseInt(val) < 0) val = "0";
                    if (val.includes('.')) val = Math.round(parseFloat(val)).toString();
                }
                el.value = val;
                recalculateClosingCashAndSave('morning');
            });
        }
    });

    const afternoonDenomInputs = [
        'afternoon-denom-paper', 'afternoon-denom-50', 
        'afternoon-denom-10', 'afternoon-denom-5', 'afternoon-denom-1'
    ];
    afternoonDenomInputs.forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', (e) => {
                let val = e.target.value;
                if (val !== "") {
                    if (parseInt(val) < 0) val = "0";
                    if (val.includes('.')) val = Math.round(parseFloat(val)).toString();
                }
                el.value = val;
                recalculateClosingCashAndSave('afternoon');
            });
        }
    });
    
    // 4. 支出記帳新增與事件監聽
    function handleAddExpense() {
        const nameInput = document.getElementById('input-expense-name') || DOM.inputExpenseName;
        const amountInput = document.getElementById('input-expense-amount') || DOM.inputExpenseAmount;

        const name = nameInput ? nameInput.value.trim() : '';
        const amountVal = amountInput ? amountInput.value.trim() : '';
        
        if (!name) {
            showToast("請輸入或選擇項目名稱！");
            return;
        }
        
        const amount = parseFloat(amountVal);
        if (isNaN(amount) || amount <= 0) {
            showToast("請輸入有效的支出金額！");
            return;
        }
        
        const cleanAmount = amount.toString().includes('.') ? Math.round(amount) : amount;
        
        if (!state.currentRecord) {
            state.currentRecord = getRecord(state.currentDate);
        }
        if (!state.currentRecord.expenseItems) {
            state.currentRecord.expenseItems = [];
        }
        
        state.currentRecord.expenseItems.push({
            name: name,
            amount: cleanAmount
        });
        
        if (nameInput) nameInput.value = '';
        if (amountInput) amountInput.value = '';
        
        saveCurrentData();
        renderExpenseItems();
        showToast(`已新增支出項目「${name}」$${cleanAmount}元！`);
    }

    if (DOM.btnAddExpense) {
        DOM.btnAddExpense.addEventListener('click', handleAddExpense);
    }

    const formAddExpense = document.getElementById('form-add-expense');
    if (formAddExpense) {
        formAddExpense.addEventListener('submit', (e) => {
            e.preventDefault();
            handleAddExpense();
        });
    }

    if (DOM.inputExpenseName) {
        DOM.inputExpenseName.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                if (DOM.inputExpenseAmount) DOM.inputExpenseAmount.focus();
            }
        });
    }
    
    DOM.inputCardMonthlyFixedCost.addEventListener('input', () => {
        let val = parseFloat(DOM.inputCardMonthlyFixedCost.value);
        if (isNaN(val) || val < 0) val = 0;
        
        state.settings.monthlyFixedCost = val;
        saveSettings(state.settings);
        
        // 同步更動後台設定的值
        DOM.settingsMonthlyCost.value = val;
        
        const staffSalary = parseFloat(state.settings.monthlyStaffSalary) || 0;
        const dailyAmortized = Math.round((val + staffSalary) / 30);
        DOM.displayDailyAmortizedCost.textContent = `$${dailyAmortized.toLocaleString()} 元`;
        
        if (state.currentTab === "tab-reports") {
            renderReports();
        }
    });

    if (DOM.inputCardMonthlyStaffSalary) {
        DOM.inputCardMonthlyStaffSalary.addEventListener('input', () => {
            let val = parseFloat(DOM.inputCardMonthlyStaffSalary.value);
            if (isNaN(val) || val < 0) val = 0;
            
            state.settings.monthlyStaffSalary = val;
            saveSettings(state.settings);
            
            // 同步更動後台設定的值
            if (DOM.settingsStaffSalary) {
                DOM.settingsStaffSalary.value = val;
            }
            
            const fixedCost = parseFloat(state.settings.monthlyFixedCost) || 0;
            const dailyAmortized = Math.round((fixedCost + val) / 30);
            DOM.displayDailyAmortizedCost.textContent = `$${dailyAmortized.toLocaleString()} 元`;
            
            if (state.currentTab === "tab-reports") {
                renderReports();
            }
        });
    }
    
    // 5. 報表區間過濾
    DOM.reportPeriodBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            DOM.reportPeriodBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            state.reportPeriod = btn.dataset.period;
            renderReports();
        });
    });
    

    


    // 6. 設定視窗與參數提交
    [DOM.btnSettingsMobile, DOM.btnSettingsDesktop].forEach(btn => {
        btn.addEventListener('click', () => openModal(DOM.modalSettings));
    });

    DOM.formSettings.addEventListener('submit', (e) => {
        try {
            e.preventDefault();
            
            state.settings.defaultBaseCash = parseFloat(DOM.settingsDefaultCash.value) || 3000;
            state.settings.monthlyFixedCost = parseFloat(DOM.settingsMonthlyCost.value) || 0;
            if (DOM.settingsStaffSalary) {
                state.settings.monthlyStaffSalary = parseFloat(DOM.settingsStaffSalary.value) || 0;
            }
            state.settings.warningLimit = parseInt(DOM.settingsWarningLimit.value) || 8;
            
            const rawFirebaseConfig = DOM.settingsFirebaseConfig ? DOM.settingsFirebaseConfig.value.trim() : "";
            let firebaseConfigChanged = false;
            
            if (rawFirebaseConfig !== "") {
                const parsed = parseFirebaseConfig(rawFirebaseConfig);
                if (!parsed) {
                    showToast("⚠️ 金鑰格式解析失敗，請確認貼入的是包含 apiKey 的完整 SDK 設定！");
                    return; // 阻擋儲存
                }
                // 比較解析後的物件內容是否有變更
                if (JSON.stringify(parsed) !== JSON.stringify(state.settings.firebaseConfig)) {
                    firebaseConfigChanged = true;
                    state.settings.firebaseConfig = parsed;
                    state.settings.firebaseConfigRaw = rawFirebaseConfig;
                }
            } else {
                if (state.settings.firebaseConfig !== null) {
                    firebaseConfigChanged = true;
                    state.settings.firebaseConfig = null;
                    state.settings.firebaseConfigRaw = "";
                }
            }
            
            saveSettings(state.settings);
            loadSystemSettings(); 
            
            // 更新今日底層金並重算
            state.currentRecord.morningBaseCash = state.settings.defaultBaseCash;
            DOM.inputMorningBaseCash.value = state.settings.defaultBaseCash;
            calculateCash();
            saveCurrentData();
            
            closeModal(DOM.modalSettings);
            
            if (firebaseConfigChanged) {
                showToast("雲端連線設定已變更，正重新初始化載入...");
                setTimeout(() => {
                    window.location.reload();
                }, 1500);
            } else {
                showToast("系統設定儲存成功！");
                loadRecordForDate(state.currentDate);
            }
        } catch (err) {
            alert("儲存時發生錯誤，請截圖此訊息給我們：\n" + err.message + "\n" + err.stack);
        }
    });

    // 當 Firebase 設定框聚焦時，自動滾動到可視區域中央（防止手機鍵盤擋住）
    if (DOM.settingsFirebaseConfig) {
        DOM.settingsFirebaseConfig.addEventListener('focus', () => {
            setTimeout(() => {
                DOM.settingsFirebaseConfig.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 350);
        });
    }
    
    // 商品品項新增
    DOM.btnAddProduct.addEventListener('click', () => {
        const name = DOM.inputNewProductName.value.trim();
        if (!name) {
            showToast("商品名稱不能為空！");
            return;
        }
        
        const id = 'prod_' + Date.now();
        state.settings.products.push({ id, name });
        saveSettings(state.settings);
        
        DOM.inputNewProductName.value = '';
        renderSettingsProductList();
        loadRecordForDate(state.currentDate);
        showToast(`已成功新增商品「${name}」`);
    });
    
    // 常用支出項目新增
    DOM.btnAddExpenseTemplate.addEventListener('click', () => {
        const name = DOM.inputNewExpenseTemplateName.value.trim();
        if (!name) {
            showToast("項目名稱不能為空！");
            return;
        }
        
        if (!state.settings.expenseTemplates) {
            state.settings.expenseTemplates = [];
        }
        
        if (state.settings.expenseTemplates.includes(name)) {
            showToast("此項目已存在！");
            return;
        }
        
        state.settings.expenseTemplates.push(name);
        saveSettings(state.settings);
        
        DOM.inputNewExpenseTemplateName.value = '';
        renderSettingsExpenseTemplateList();
        renderExpenseDatalist();
        showToast(`已新增常用項目「${name}」`);
    });
    
    // 支援常用項目 Enter 新增
    DOM.inputNewExpenseTemplateName.addEventListener("keypress", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            DOM.btnAddExpenseTemplate.click();
        }
    });
    

    
    // 7. 備份與還原視窗
    [DOM.btnBackupMobile, DOM.btnBackupDesktop].forEach(btn => {
        btn.addEventListener("click", () => openModal(DOM.modalBackup));
    });

    // 匯出備份 JSON
    DOM.btnExportFile.addEventListener("click", () => {
        const jsonStr = exportBackupData();
        const blob = new Blob([jsonStr], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `君仔早餐營運接續備份_${state.currentDate}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        showToast("備份檔案已成功匯出！");
    });
    
    // 匯入還原
    DOM.inputImportFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = function(evt) {
            const result = importBackupData(evt.target.result);
            if (result.success) {
                showToast("資料還原成功！系統刷新中...");
                setTimeout(() => {
                    location.reload();
                }, 1000);
            } else {
                showToast("還原失敗：" + (result.error || "格式不符！"));
            }
        };
        reader.readAsText(file);
    });
    
    // 雲端同步
    DOM.btnCloudSync.addEventListener('click', () => {
        DOM.btnCloudSync.disabled = true;
        DOM.btnCloudSync.innerHTML = `☁️ 正在上傳至雲端...`;
        
        uploadToCloud().then(() => {
            DOM.btnCloudSync.disabled = false;
            DOM.btnCloudSync.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> 立即上傳雲端同步`;
            showToast("雲端資料同步成功！");
        }).catch(err => {
            DOM.btnCloudSync.disabled = false;
            DOM.btnCloudSync.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="btn-icon"><path d="M21.5 2v6h-6M21.34 15.57a10 10 0 1 1-.57-8.38l5.67-5.67"/></svg> 立即上傳雲端同步`;
            showToast("同步失敗，請檢查網路連線");
        });
    });
    // 初始化清空資料庫
    DOM.btnClearAllData.addEventListener('click', () => {
        if (confirm("⚠️ 警告：您即將清空所有營運資料，包含過去的所有盤點、收銀對帳和支出細項，此動作無法還原！\n\n您確定要繼續嗎？")) {
            if (confirm("第二次確認：請確認您已將重要資料匯出備份。點選確定將立刻清空資料。")) {
                localStorage.removeItem(DB_KEYS.RECORDS);
                // 同時設定一次性標記避免再次被舊 db.js 重點清除（雖然已經注釋掉了）
                localStorage.setItem('jean_demo_data_cleared_v4', 'true');
                showToast("資料已全部清空！系統刷新中...");
                setTimeout(() => {
                    location.reload();
                }, 1000);
            }
        }
    });
    
    // 8. 關閉彈出視窗
    DOM.modalCloses.forEach(btn => {
        btn.addEventListener('click', () => {
            closeModal(DOM.modalSettings);
            closeModal(DOM.modalBackup);
        });
    });
    
    [DOM.modalSettings, DOM.modalBackup].forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                closeModal(modal);
            }
        });
    });

    // 9. 歷史明細查詢子分頁切換 (月明細/年明細)
    if (DOM.btnHistoryMonthTab && DOM.btnHistoryYearTab) {
        DOM.btnHistoryMonthTab.addEventListener('click', () => {
            DOM.btnHistoryMonthTab.classList.add('active');
            DOM.btnHistoryYearTab.classList.remove('active');
            DOM.historyMonthBar.style.display = 'flex';
            DOM.historyYearBar.style.display = 'none';
            state.historyTab = 'month';
            renderHistoryQuery();
        });

        DOM.btnHistoryYearTab.addEventListener('click', () => {
            DOM.btnHistoryYearTab.classList.add('active');
            DOM.btnHistoryMonthTab.classList.remove('active');
            DOM.historyYearBar.style.display = 'flex';
            DOM.historyMonthBar.style.display = 'none';
            state.historyTab = 'year';
            renderHistoryQuery();
        });
    }

    // 10. 歷史月份與年份增減切換
    if (DOM.btnPrevMonth && DOM.btnNextMonth) {
        DOM.btnPrevMonth.addEventListener('click', () => adjustHistoryMonth(-1));
        DOM.btnNextMonth.addEventListener('click', () => adjustHistoryMonth(1));
    }
    if (DOM.historyMonthPicker) {
        DOM.historyMonthPicker.addEventListener('change', (e) => {
            if (e.target.value) {
                state.historyMonth = e.target.value;
                updateHistoryDateDisplay();
                renderHistoryQuery();
            }
        });
    }

    if (DOM.btnPrevYear && DOM.btnNextYear) {
        DOM.btnPrevYear.addEventListener('click', () => adjustHistoryYear(-1));
        DOM.btnNextYear.addEventListener('click', () => adjustHistoryYear(1));
    }

    // 點擊文字框觸發原生月份選擇器
    if (DOM.displayHistoryMonth && DOM.historyMonthPicker) {
        DOM.displayHistoryMonth.parentElement.addEventListener('click', (e) => {
            if (e.target === DOM.historyMonthPicker) return;
            try {
                if (typeof DOM.historyMonthPicker.showPicker === 'function') {
                    DOM.historyMonthPicker.showPicker();
                } else {
                    DOM.historyMonthPicker.focus();
                    DOM.historyMonthPicker.click();
                }
            } catch (err) {
                DOM.historyMonthPicker.focus();
                DOM.historyMonthPicker.click();
            }
        });
    }
}

/**
 * 渲染設定商品管理清單
 */
function renderSettingsProductList() {
    DOM.settingsProductList.innerHTML = '';
    const products = state.settings.products;
    
    products.forEach((p, idx) => {
        const li = document.createElement('li');
        li.className = 'settings-prod-item draggable-item';
        li.dataset.id = p.id;
        li.dataset.index = idx;
        
        const isEditing = state.editingProductId === p.id;
        
        if (isEditing) {
            li.innerHTML = `
                <input type="text" class="prod-edit-input" value="${p.name}" style="flex: 1; font-weight: 700; padding: 4px 8px; border: 1.5px solid var(--primary); border-radius: 6px; outline: none; margin: 0 6px;">
                <button type="button" class="btn-save-prod" data-id="${p.id}">💾 儲存</button>
                <button type="button" class="btn-cancel-prod">❌ 取消</button>
            `;
        } else {
            li.innerHTML = `
                <div class="drag-handle" title="按住拖曳排序">☰</div>
                <span class="prod-name-label" style="flex: 1; font-weight: 700; user-select: none; padding-left: 8px; cursor: pointer;">${p.name}</span>
                <div class="order-actions" style="display: flex; gap: 4px; margin-right: 8px;">
                    <button type="button" class="btn-move-up" data-index="${idx}" title="上移">▲</button>
                    <button type="button" class="btn-move-down" data-index="${idx}" title="下移">▼</button>
                </div>
                <button type="button" class="btn-edit-prod" data-id="${p.id}">✏️ 編輯</button>
                <button type="button" class="btn-delete-prod" data-id="${p.id}">❌ 刪除</button>
            `;
        }
        DOM.settingsProductList.appendChild(li);
        
        // 編輯狀態下自動聚焦並綁定鍵盤事件
        if (isEditing) {
            const input = li.querySelector('.prod-edit-input');
            if (input) {
                input.focus();
                input.select();
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        li.querySelector('.btn-save-prod').click();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        li.querySelector('.btn-cancel-prod').click();
                    }
                });
            }
        }
    });
    
    // 綁定儲存與取消按鈕事件
    DOM.settingsProductList.querySelectorAll('.btn-save-prod').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const li = btn.closest('li');
            const input = li.querySelector('.prod-edit-input');
            const newName = input.value.trim();
            if (!newName) {
                showToast("商品名稱不能為空！");
                return;
            }
            const prod = state.settings.products.find(p => p.id === id);
            if (prod) {
                const oldName = prod.name;
                prod.name = newName;
                saveSettings(state.settings);
                state.editingProductId = null;
                renderSettingsProductList();
                loadRecordForDate(state.currentDate);
                showToast(`商品「${oldName}」已更名為「${newName}」`);
            }
        });
    });

    DOM.settingsProductList.querySelectorAll('.btn-cancel-prod').forEach(btn => {
        btn.addEventListener('click', () => {
            state.editingProductId = null;
            renderSettingsProductList();
        });
    });

    // 綁定編輯/刪除/移動按鈕事件
    DOM.settingsProductList.querySelectorAll('.btn-edit-prod').forEach(btn => {
        btn.addEventListener('click', () => {
            state.editingProductId = btn.dataset.id;
            renderSettingsProductList();
        });
    });
    
    // 雙擊名稱快速進入編輯狀態
    DOM.settingsProductList.querySelectorAll('.prod-name-label').forEach(span => {
        span.addEventListener('dblclick', () => {
            const li = span.closest('li');
            state.editingProductId = li.dataset.id;
            renderSettingsProductList();
        });
    });

    DOM.settingsProductList.querySelectorAll('.btn-delete-prod').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const id = btn.dataset.id;
            const prod = state.settings.products.find(p => p.id === id);
            
            if (confirm(`確定要刪除「${prod.name}」商品嗎？此商品的庫存輸入欄位將會隱藏。`)) {
                state.settings.products = state.settings.products.filter(p => p.id !== id);
                saveSettings(state.settings);
                renderSettingsProductList();
                loadRecordForDate(state.currentDate);
                showToast(`已刪除商品「${prod.name}」`);
            }
        });
    });

    setupDragAndDrop(DOM.settingsProductList, 'product');
}

function renderSettingsExpenseTemplateList() {
    DOM.settingsExpenseTemplateList.innerHTML = '';
    const templates = state.settings.expenseTemplates || [];
    
    templates.forEach((t, idx) => {
        const li = document.createElement('li');
        li.className = 'settings-prod-item draggable-item';
        li.dataset.name = t;
        li.dataset.index = idx;
        
        const isEditing = state.editingExpenseIndex === idx;
        
        if (isEditing) {
            li.innerHTML = `
                <input type="text" class="expense-edit-input" value="${t}" style="flex: 1; font-weight: 700; padding: 4px 8px; border: 1.5px solid var(--primary); border-radius: 6px; outline: none; margin: 0 6px;">
                <button type="button" class="btn-save-expense-template" data-index="${idx}">💾 儲存</button>
                <button type="button" class="btn-cancel-expense-template">❌ 取消</button>
            `;
        } else {
            li.innerHTML = `
                <div class="drag-handle" title="按住拖曳排序">☰</div>
                <span class="expense-name-label" style="flex: 1; font-weight: 700; user-select: none; padding-left: 8px; cursor: pointer;">${t}</span>
                <div class="order-actions" style="display: flex; gap: 4px; margin-right: 8px;">
                    <button type="button" class="btn-move-up-expense" data-index="${idx}" title="上移">▲</button>
                    <button type="button" class="btn-move-down-expense" data-index="${idx}" title="下移">▼</button>
                </div>
                <button type="button" class="btn-edit-expense-template" data-index="${idx}">✏️ 編輯</button>
                <button type="button" class="btn-delete-expense-template" data-index="${idx}">❌ 刪除</button>
            `;
        }
        DOM.settingsExpenseTemplateList.appendChild(li);
        
        // 編輯狀態下自動聚焦並綁定鍵盤事件
        if (isEditing) {
            const input = li.querySelector('.expense-edit-input');
            if (input) {
                input.focus();
                input.select();
                input.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter') {
                        e.preventDefault();
                        li.querySelector('.btn-save-expense-template').click();
                    } else if (e.key === 'Escape') {
                        e.preventDefault();
                        li.querySelector('.btn-cancel-expense-template').click();
                    }
                });
            }
        }
    });
    
    // 綁定儲存與取消按鈕事件
    DOM.settingsExpenseTemplateList.querySelectorAll('.btn-save-expense-template').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            const li = btn.closest('li');
            const input = li.querySelector('.expense-edit-input');
            const newName = input.value.trim();
            if (!newName) {
                showToast("常用項目名稱不能為空！");
                return;
            }
            if (state.settings.expenseTemplates.includes(newName) && state.settings.expenseTemplates[idx] !== newName) {
                showToast("此項目名稱已存在！");
                return;
            }
            const oldName = state.settings.expenseTemplates[idx];
            state.settings.expenseTemplates[idx] = newName;
            saveSettings(state.settings);
            state.editingExpenseIndex = null;
            renderSettingsExpenseTemplateList();
            renderExpenseDatalist();
            showToast(`常用項目「${oldName}」已更名為「${newName}」`);
        });
    });

    DOM.settingsExpenseTemplateList.querySelectorAll('.btn-cancel-expense-template').forEach(btn => {
        btn.addEventListener('click', () => {
            state.editingExpenseIndex = null;
            renderSettingsExpenseTemplateList();
        });
    });

    // 綁定編輯/刪除/移動按鈕事件
    DOM.settingsExpenseTemplateList.querySelectorAll('.btn-edit-expense-template').forEach(btn => {
        btn.addEventListener('click', () => {
            state.editingExpenseIndex = parseInt(btn.dataset.index);
            renderSettingsExpenseTemplateList();
        });
    });
    
    // 雙擊名稱快速進入編輯狀態
    DOM.settingsExpenseTemplateList.querySelectorAll('.expense-name-label').forEach(span => {
        span.addEventListener('dblclick', () => {
            const li = span.closest('li');
            state.editingExpenseIndex = parseInt(li.dataset.index);
            renderSettingsExpenseTemplateList();
        });
    });

    DOM.settingsExpenseTemplateList.querySelectorAll('.btn-delete-expense-template').forEach(btn => {
        btn.addEventListener('click', (e) => {
            const idx = parseInt(btn.dataset.index);
            const name = templates[idx];
            
            if (confirm(`確定要刪除常用項目「${name}」嗎？`)) {
                state.settings.expenseTemplates.splice(idx, 1);
                saveSettings(state.settings);
                renderSettingsExpenseTemplateList();
                renderExpenseDatalist();
                showToast(`已刪除常用項目「${name}」`);
            }
        });
    });

    DOM.settingsExpenseTemplateList.querySelectorAll('.btn-move-up-expense').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            if (idx > 0) {
                const temp = state.settings.expenseTemplates[idx];
                state.settings.expenseTemplates[idx] = state.settings.expenseTemplates[idx - 1];
                state.settings.expenseTemplates[idx - 1] = temp;
                saveSettings(state.settings);
                renderSettingsExpenseTemplateList();
                renderExpenseDatalist();
            }
        });
    });

    DOM.settingsExpenseTemplateList.querySelectorAll('.btn-move-down-expense').forEach(btn => {
        btn.addEventListener('click', () => {
            const idx = parseInt(btn.dataset.index);
            if (idx < state.settings.expenseTemplates.length - 1) {
                const temp = state.settings.expenseTemplates[idx];
                state.settings.expenseTemplates[idx] = state.settings.expenseTemplates[idx + 1];
                state.settings.expenseTemplates[idx + 1] = temp;
                saveSettings(state.settings);
                renderSettingsExpenseTemplateList();
                renderExpenseDatalist();
            }
        });
    });

    setupDragAndDrop(DOM.settingsExpenseTemplateList, 'expense');
}

/**
 * 拖曳排序邏輯設定 (支援滑鼠與觸控裝置)
 */
function setupDragAndDrop(container, type) {
    let dragEl = null;
    const items = container.querySelectorAll('.draggable-item');
    
    items.forEach(item => {
        const handle = item.querySelector('.drag-handle');
        item.draggable = true;
        
        // --- A. 電腦滑鼠拖曳事件 ---
        item.addEventListener('dragstart', (e) => {
            dragEl = item;
            item.classList.add('dragging');
            e.dataTransfer.effectAllowed = 'move';
        });
        
        item.addEventListener('dragend', () => {
            item.classList.remove('dragging');
            dragEl = null;
            saveNewOrder(container, type);
        });
        
        item.addEventListener('dragover', (e) => {
            e.preventDefault();
            e.dataTransfer.dropEffect = 'move';
            
            const target = e.target.closest('.draggable-item');
            if (target && target !== dragEl && target.parentNode === container) {
                const rect = target.getBoundingClientRect();
                const next = (e.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                container.insertBefore(dragEl, next ? target.nextSibling : target);
            }
        });
        
        // --- B. 手機觸控拖曳事件 ---
        handle.addEventListener('touchstart', (e) => {
            e.preventDefault(); // 避免拖曳時頁面跟著滾動
            dragEl = item;
            item.classList.add('dragging');
        }, { passive: false });
        
        handle.addEventListener('touchmove', (e) => {
            if (!dragEl) return;
            e.preventDefault();
            
            const touch = e.touches[0];
            const targetEl = document.elementFromPoint(touch.clientX, touch.clientY);
            if (!targetEl) return;
            
            const targetItem = targetEl.closest('.draggable-item');
            if (targetItem && targetItem !== dragEl && targetItem.parentNode === container) {
                const rect = targetItem.getBoundingClientRect();
                const next = (touch.clientY - rect.top) / (rect.bottom - rect.top) > 0.5;
                container.insertBefore(dragEl, next ? targetItem.nextSibling : targetItem);
            }
        }, { passive: false });
        
        handle.addEventListener('touchend', () => {
            if (dragEl) {
                dragEl.classList.remove('dragging');
                dragEl = null;
                saveNewOrder(container, type);
            }
        });
    });
}

/**
 * 拖曳結束後讀取新順序並儲存
 */
function saveNewOrder(container, type) {
    const listItems = container.querySelectorAll('.draggable-item');
    
    if (type === 'product') {
        const sortedProducts = [];
        listItems.forEach(item => {
            const id = item.dataset.id;
            const prod = state.settings.products.find(p => p.id === id);
            if (prod) sortedProducts.push(prod);
        });
        state.settings.products = sortedProducts;
        saveSettings(state.settings);
        loadRecordForDate(state.currentDate); // 即時連動更新盤點表格/卡片順序
    } else if (type === 'expense') {
        const sortedExpenses = [];
        listItems.forEach(item => {
            sortedExpenses.push(item.dataset.name);
        });
        state.settings.expenseTemplates = sortedExpenses;
        saveSettings(state.settings);
        renderExpenseDatalist(); // 即時連動更新支出下拉選單
    }
}

/**
 * 渲染支出項目下拉選單
 */
function renderExpenseDatalist() {
    DOM.commonExpensesDatalist.innerHTML = '';
    const templates = state.settings.expenseTemplates || [];
    templates.forEach(t => {
        const option = document.createElement('option');
        option.value = t;
        DOM.commonExpensesDatalist.appendChild(option);
    });
}

/**
 * 同步切換分頁
 */
// 單頁模式的分區 ID 清單（這三區始終顯示，只做捲動）
const SCROLL_TABS = new Set(['tab-inventory', 'tab-cash', 'tab-costs']);

function switchTab(tabId) {
    state.currentTab = tabId;
    
    DOM.navTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    DOM.sidebarTabs.forEach(tab => {
        tab.classList.toggle('active', tab.dataset.tab === tabId);
    });
    
    DOM.tabContents.forEach(content => {
        if (content.id === tabId) {
            content.classList.add('active');
            content.style.display = '';
        } else {
            content.classList.remove('active');
            content.style.display = 'none';
        }
    });
    
    if (tabId === 'tab-reports') renderReports();
    else if (tabId === 'tab-history-query') renderHistoryQuery();
}

/**
 * 調整營業日期
 */
function adjustDate(offset) {
    const parts = state.currentDate.split('-');
    const currentDateObj = new Date(parts[0], parts[1] - 1, parts[2]);
    currentDateObj.setDate(currentDateObj.getDate() + offset);
    
    state.currentDate = formatDateString(currentDateObj);
    DOM.operationDate.value = state.currentDate;
    updateDateDisplay();
    
    loadRecordForDate(state.currentDate);
    
    if (state.currentTab === "tab-reports") {
        renderReports();
    }
}

/**
 * 調整歷史查詢的月份
 */
function adjustHistoryMonth(offset) {
    const parts = state.historyMonth.split('-');
    const year = parseInt(parts[0]);
    const month = parseInt(parts[1]) - 1; // 0-indexed month
    
    const date = new Date(year, month + offset, 1);
    state.historyMonth = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    if (DOM.historyMonthPicker) {
        DOM.historyMonthPicker.value = state.historyMonth;
    }
    updateHistoryDateDisplay();
    renderHistoryQuery();
}

/**
 * 調整歷史查詢的年份
 */
function adjustHistoryYear(offset) {
    state.historyYear += offset;
    if (DOM.historyYearPicker) {
        DOM.historyYearPicker.value = state.historyYear;
    }
    updateHistoryDateDisplay();
    renderHistoryQuery();
}


/**
 * 彈出視窗
 */
function openModal(modal) {
    modal.classList.add('active');
}

function closeModal(modal) {
    modal.classList.remove('active');
}

/**
 * Toast
 */
function showToast(message) {
    DOM.toast.textContent = message;
    DOM.toast.classList.add('active');
    setTimeout(() => {
        DOM.toast.classList.remove('active');
    }, 2200);
}

/**
 * Chart.js 圓餅圖中間文字顯示外掛
 */
const centerTextPlugin = {
    id: 'centerText',
    afterDraw(chart) {
        const { ctx, chartArea: { top, bottom, left, right, width, height } } = chart;
        ctx.save();
        
        const text = chart.options.plugins.centerText?.text || '';
        const subtext = chart.options.plugins.centerText?.subtext || '';
        
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        // 繪製主要大字 (如 "淨利 15%")
        ctx.font = 'bold 16px Noto Sans TC, Outfit, sans-serif';
        ctx.fillStyle = '#2f3542';
        ctx.fillText(text, left + width / 2, top + height / 2 - 10);
        
        // 繪製次要小字 (如 "獲利 $12,500 元")
        ctx.font = '11px Noto Sans TC, Outfit, sans-serif';
        ctx.fillStyle = '#747d8c';
        ctx.fillText(subtext, left + width / 2, top + height / 2 + 10);
        
        ctx.restore();
    }
};

/**
 * 統計並渲染營運報表 (Chart.js 升級版，支援週、月、年篩選)
 */
function renderReports() {
    const records = getAllRecords();
    
    // 初始化或重置圖表快取物件
    if (!state.charts) {
        state.charts = { trends: null, structure: null, productSales: null, expenseBreakdown: null };
    }
    
    if (state.charts.productSales) {
        state.charts.productSales.destroy();
    }
    if (state.charts.expenseBreakdown) {
        state.charts.expenseBreakdown.destroy();
    }
    
    const parts = state.currentDate.split('-');
    const baseDate = new Date(parts[0], parts[1] - 1, parts[2]);
    const currentYear = baseDate.getFullYear();
    
    let totalRevenue = 0;
    let totalVarCost = 0;
    let totalFixedCost = 0;
    
    const dailyFixedCostVal = Math.round(((state.settings.monthlyFixedCost || 0) + (state.settings.monthlyStaffSalary || 0)) / 30);
    const monthlyFixedCostVal = (state.settings.monthlyFixedCost || 0) + (state.settings.monthlyStaffSalary || 0);
    
    let activePeriodDates = [];
    if (state.reportPeriod === 'year') {
        Object.keys(records).forEach(dateStr => {
            const [rYear] = dateStr.split('-');
            if (parseInt(rYear) === currentYear) {
                activePeriodDates.push(dateStr);
            }
        });
    } else {
        const rangeDays = state.reportPeriod === 'week' ? 7 : 30;
        for (let i = rangeDays - 1; i >= 0; i--) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() - i);
            activePeriodDates.push(formatDateString(d));
        }
    }
    
    let labels = [];
    let revenueData = [];
    let costData = [];
    let profitData = [];
    let titleText = "";
    
    if (state.reportPeriod === 'year') {
        // --- 年報表 (按月份統計) ---
        titleText = `${currentYear} 年營運走勢`;
        labels = ['1月', '2月', '3月', '4月', '5月', '6月', '7月', '8月', '9月', '10月', '11月', '12月'];
        
        const yearRevenue = Array(12).fill(0);
        const yearVarCost = Array(12).fill(0);
        const yearFixedCost = Array(12).fill(0);
        
        // 加總該年份各月份的每日營業額與食材成本
        Object.keys(records).forEach(dateStr => {
            const [rYear, rMonth, rDay] = dateStr.split('-');
            if (parseInt(rYear) === currentYear) {
                const mIdx = parseInt(rMonth) - 1;
                const record = records[dateStr];
                yearRevenue[mIdx] += record.revenue || 0;
                yearVarCost[mIdx] += record.variableCost || 0;
            }
        });
        
        // 只有有營業數據的月份才計入固定成本，避免未來的月份被扣固定成本呈現大幅虧損
        for (let m = 0; m < 12; m++) {
            const monthHasRecords = Object.keys(records).some(dateStr => {
                const [rYear, rMonth] = dateStr.split('-');
                return parseInt(rYear) === currentYear && parseInt(rMonth) === (m + 1);
            });
            
            if (monthHasRecords) {
                yearFixedCost[m] = monthlyFixedCostVal;
            } else {
                yearFixedCost[m] = 0;
            }
            
            const monthTotalCost = yearVarCost[m] + yearFixedCost[m];
            const monthProfit = yearRevenue[m] - monthTotalCost;
            
            revenueData.push(yearRevenue[m]);
            costData.push(monthTotalCost);
            profitData.push(monthProfit);
            
            totalRevenue += yearRevenue[m];
            totalVarCost += yearVarCost[m];
            totalFixedCost += yearFixedCost[m];
        }
    } else {
        // --- 週報表 或 月報表 (按日統計) ---
        const rangeDays = state.reportPeriod === 'week' ? 7 : 30;
        titleText = state.reportPeriod === 'week' ? '本週營運走勢 (7天)' : '本月營運走勢 (30天)';
        
        const filterDates = [];
        for (let i = rangeDays - 1; i >= 0; i--) {
            const d = new Date(baseDate);
            d.setDate(baseDate.getDate() - i);
            filterDates.push(formatDateString(d));
        }
        
        // 計算期間內有幾天有記錄
        const daysWithRecord = filterDates.filter(dateStr => !!records[dateStr]).length;
        
        // 固定成本彙總：
        // 月報 → 有任何記錄時直接用整月固定成本（不按天攤提）
        // 週報 → 按 7/30 比例計算
        if (daysWithRecord > 0) {
            if (state.reportPeriod === 'month') {
                totalFixedCost = monthlyFixedCostVal;
            } else {
                // 週報：用實際有記錄天數 × 每日攤提（讓未開店的日子不被計算）
                totalFixedCost = daysWithRecord * dailyFixedCostVal;
            }
        }
        
        filterDates.forEach(dateStr => {
            const record = records[dateStr];
            const hasRecord = !!record;
            
            const rev = hasRecord ? (record.revenue || 0) : 0;
            const vCost = hasRecord ? (record.variableCost || 0) : 0;
            // 圖表中每日仍用攤提值（讓圖表視覺上每天均等）
            const fCost = hasRecord ? dailyFixedCostVal : 0;
            
            totalRevenue += rev;
            totalVarCost += vCost;
            // totalFixedCost 已在上方統一算好，此處不重複累加
            
            const dayCost = vCost + fCost;
            const dayProfit = rev - dayCost;
            
            const dateParts = dateStr.split('-');
            labels.push(`${dateParts[1]}/${dateParts[2]}`);
            revenueData.push(rev);
            costData.push(dayCost);
            profitData.push(dayProfit);
        });
    }
    
    const totalCost = totalVarCost + totalFixedCost;
    const totalProfit = totalRevenue - totalCost;
    
    // 更新上方的三張彙總指標卡片
    DOM.reportTotalRevenue.textContent = `$${totalRevenue.toLocaleString()}`;
    DOM.reportTotalCost.textContent = `$${totalCost.toLocaleString()}`;
    
    const profitEl = DOM.reportTotalProfit;
    profitEl.textContent = `$${totalProfit.toLocaleString()}`;
    if (totalProfit >= 0) {
        profitEl.className = "tile-value positive";
    } else {
        profitEl.className = "tile-value negative";
    }
    
    // 動態修改趨勢圖的卡片標題
    const titleEl = document.getElementById('chart-trend-title');
    if (titleEl) titleEl.textContent = titleText;
    
    // --- 1. 渲染趨勢圖 (Chart.js 混合圖表) ---
    if (state.charts.trends) {
        state.charts.trends.destroy();
    }
    
    const trendsCtx = DOM.chartCanvasTrends.getContext('2d');
    const isMonth = state.reportPeriod === 'month';
    
    state.charts.trends = new Chart(trendsCtx, {
        type: isMonth ? 'line' : 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: '營業額',
                    type: isMonth ? 'line' : 'bar',
                    data: revenueData,
                    backgroundColor: isMonth ? 'rgba(6, 182, 212, 0.08)' : 'rgba(6, 182, 212, 0.85)',
                    borderColor: '#06b6d4',
                    borderWidth: 2,
                    fill: isMonth,
                    tension: 0.3,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.6
                },
                {
                    label: '總成本',
                    type: isMonth ? 'line' : 'bar',
                    data: costData,
                    backgroundColor: isMonth ? 'rgba(255, 159, 67, 0.06)' : 'rgba(255, 159, 67, 0.85)',
                    borderColor: '#ff9f43',
                    borderWidth: 2,
                    fill: isMonth,
                    tension: 0.3,
                    borderRadius: 4,
                    barPercentage: 0.7,
                    categoryPercentage: 0.6
                },
                {
                    label: '期間淨利',
                    type: 'line',
                    data: profitData,
                    backgroundColor: 'rgba(16, 185, 129, 0.08)',
                    borderColor: '#10b981',
                    borderWidth: 3,
                    pointBackgroundColor: '#10b981',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2,
                    pointRadius: isMonth ? 2 : 4,
                    fill: true,
                    tension: 0.35
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        font: { family: 'Noto Sans TC, Outfit, sans-serif', size: 12 },
                        boxWidth: 12,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    mode: 'index',
                    intersect: false,
                    titleFont: { family: 'Noto Sans TC, Outfit, sans-serif', size: 12 },
                    bodyFont: { family: 'Noto Sans TC, Outfit, sans-serif', size: 12 },
                    callbacks: {
                        label: function(context) {
                            let label = context.dataset.label || '';
                            if (label) label += ': ';
                            if (context.parsed.y !== null) label += '$' + Math.round(context.parsed.y).toLocaleString() + ' 元';
                            return label;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { display: false },
                    ticks: {
                        font: { family: 'Outfit, Noto Sans TC, sans-serif', size: 10 },
                        maxRotation: 0,
                        autoSkip: true,
                        autoSkipPadding: 15
                    }
                },
                y: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        font: { family: 'Outfit, Noto Sans TC, sans-serif', size: 10 },
                        callback: function(value) { return '$' + value; }
                    }
                }
            }
        }
    });
    
    // --- 2. 渲染結構圖 (Doughnut 甜甜圈圖) ---
    if (state.charts.structure) {
        state.charts.structure.destroy();
    }
    
    const structCtx = DOM.chartCanvasStructure.getContext('2d');
    
    let structLabels = [];
    let structValues = [];
    let structColors = [];
    let centerText = "";
    let centerSub = "";
    
    if (totalRevenue > 0) {
        if (totalProfit > 0) {
            structLabels = ['食材成本', '固定成本', '淨利'];
            structValues = [totalVarCost, totalFixedCost, totalProfit];
            structColors = ['#06b6d4', '#ff9f43', '#10b981'];
            
            const profitPct = Math.round((totalProfit / totalRevenue) * 100);
            centerText = `淨利 ${profitPct}%`;
            centerSub = `獲利 $${Math.round(totalProfit).toLocaleString()} 元`;
        } else {
            // 淨虧損狀態下，不畫淨利，改為食材與固定成本，中間醒目顯示虧損金額
            structLabels = ['食材成本', '固定成本'];
            structValues = [totalVarCost, totalFixedCost];
            structColors = ['#06b6d4', '#ff6b6b'];
            
            centerText = `淨虧損`;
            centerSub = `$${Math.round(Math.abs(totalProfit)).toLocaleString()} 元`;
        }
    } else {
        structLabels = ['無營業數據'];
        structValues = [1];
        structColors = ['#e2e8f0'];
        centerText = "無資料";
        centerSub = "請輸入營業資料";
    }
    
    state.charts.structure = new Chart(structCtx, {
        type: 'doughnut',
        data: {
            labels: structLabels,
            datasets: [{
                data: structValues,
                backgroundColor: structColors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Noto Sans TC, Outfit, sans-serif', size: 12 },
                        boxWidth: 10,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            if (totalRevenue <= 0) return ' 無數據';
                            const val = context.raw;
                            const pct = Math.round((val / totalRevenue) * 100);
                            return ` ${context.label}: $${Math.round(val).toLocaleString()} 元 (${pct}%)`;
                        }
                    }
                },
                centerText: {
                    text: centerText,
                    subtext: centerSub
                }
            }
        },
        plugins: [centerTextPlugin]
    });

    // ==========================================
    // 📊 新增功能：品項銷售數量統計與圖表
    // ==========================================
    
    // 1. 初始化品項銷售統計 Map
    const productSalesMap = {};
    state.settings.products.forEach(p => {
        productSalesMap[p.id] = 0;
    });
    
    // 2. 統計品項銷售量
    activePeriodDates.forEach(dateStr => {
        const record = records[dateStr];
        if (record && record.inventory) {
            state.settings.products.forEach(p => {
                const prodData = record.inventory[p.id];
                if (prodData) {
                    productSalesMap[p.id] += parseInt(prodData.salesBags) || 0;
                }
            });
        }
    });
    
    // 3. 將產品按照銷量由大到小排序
    const sortedProducts = [...state.settings.products].map(p => {
        const bags = productSalesMap[p.id] || 0;
        return {
            name: p.name,
            bags: bags,
            pieces: bags * 3
        };
    }).sort((a, b) => b.bags - a.bags);
    
    // 4. 渲染品項銷量圖表 (水平長條圖)
    state.charts.productSales = new Chart(DOM.chartCanvasProductSales.getContext('2d'), {
        type: 'bar',
        data: {
            labels: sortedProducts.map(x => x.name),
            datasets: [{
                label: '銷量 (包)',
                data: sortedProducts.map(x => x.bags),
                backgroundColor: 'rgba(6, 182, 212, 0.85)',
                borderColor: '#06b6d4',
                borderWidth: 1.5,
                borderRadius: 4,
                barPercentage: 0.7
            }]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = context.raw;
                            return ` 銷量: ${val} 包 (${val * 3} 顆)`;
                        }
                    }
                }
            },
            scales: {
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.05)' },
                    ticks: {
                        font: { family: 'Outfit, Noto Sans TC, sans-serif', size: 10 },
                        stepSize: 1
                    }
                },
                y: {
                    grid: { display: false },
                    ticks: {
                        autoSkip: false,
                        font: { family: 'Noto Sans TC, sans-serif', size: 10, weight: 'bold' }
                    }
                }
            }
        }
    });    // 5. 渲染品項銷量明細表格
    DOM.reportProductSalesTbody.innerHTML = sortedProducts.map(x => `
        <tr>
            <td><strong>${x.name}</strong></td>
            <td style="text-align: right; font-weight: 700; color: var(--primary);">${x.bags.toLocaleString()} 包</td>
            <td style="text-align: right; color: var(--text-sub);">${x.pieces.toLocaleString()} 顆</td>
        </tr>
    `).join('');
    
    // ==========================================
    // 🍩 新增功能：支出費用細項分析與圖表
    // ==========================================
    
    // 1. 初始化支出費用細項 Map
    const expensesMap = {};
    
    // 2. 累加費用支出細項
    activePeriodDates.forEach(dateStr => {
        const record = records[dateStr];
        if (record && record.expenseItems && record.expenseItems.length > 0) {
            record.expenseItems.forEach(item => {
                const cleanName = item.name.trim() || "未分類支出";
                expensesMap[cleanName] = (expensesMap[cleanName] || 0) + (parseFloat(item.amount) || 0);
            });
        }
    });
    
    // 3. 彙總固定成本與變動成本
    const costBreakdownList = [];
    if (totalFixedCost > 0) {
        costBreakdownList.push({
            name: "固定成本 (房租/薪資等)",
            amount: totalFixedCost
        });
    }
    Object.keys(expensesMap).forEach(name => {
        const amount = expensesMap[name];
        if (amount > 0) {
            costBreakdownList.push({
                name: name,
                amount: amount
            });
        }
    });
    
    // 4. 將費用按金額由大到小排序
    costBreakdownList.sort((a, b) => b.amount - a.amount);
    
    const calculatedTotalCost = costBreakdownList.reduce((sum, item) => sum + item.amount, 0);
    
    // 5. 渲染支出分析圖表 (甜甜圈圖)
    const sliceColors = ['#ff9f43', '#06b6d4', '#10b981', '#ff6b6b', '#9b59b6', '#34495e', '#f1c40f', '#e67e22', '#1abc9c'];
    const colors = costBreakdownList.map((_, i) => sliceColors[i % sliceColors.length]);
    
    state.charts.expenseBreakdown = new Chart(DOM.chartCanvasExpenseBreakdown.getContext('2d'), {
        type: 'doughnut',
        data: {
            labels: costBreakdownList.map(x => x.name),
            datasets: [{
                data: costBreakdownList.map(x => x.amount),
                backgroundColor: colors,
                borderWidth: 2,
                borderColor: '#ffffff',
                hoverOffset: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: {
                        font: { family: 'Noto Sans TC, Outfit, sans-serif', size: 10 },
                        boxWidth: 10,
                        usePointStyle: true,
                        pointStyle: 'circle'
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const val = context.raw;
                            const pct = calculatedTotalCost > 0 ? Math.round((val / calculatedTotalCost) * 100) : 0;
                            return ` ${context.label}: $${Math.round(val).toLocaleString()} 元 (${pct}%)`;
                        }
                    }
                },
                centerText: {
                    text: '總支出',
                    subtext: `$${Math.round(calculatedTotalCost).toLocaleString()}`
                }
            }
        },
        plugins: [centerTextPlugin]
    });
    
    // 6. 渲染支出明細表格
    DOM.reportExpensesTbody.innerHTML = costBreakdownList.length > 0 ? costBreakdownList.map(x => {
        const pct = calculatedTotalCost > 0 ? Math.round((x.amount / calculatedTotalCost) * 100) : 0;
        return `
            <tr>
                <td><strong>${x.name}</strong></td>
                <td style="text-align: right; font-weight: 700; color: #ff9f43;">$${x.amount.toLocaleString()}</td>
                <td style="text-align: right; color: var(--text-sub);">${pct}%</td>
            </tr>
        `;
    }).join('') : `<tr><td colspan="3" style="text-align: center; color: var(--text-light); padding: 20px;">本期間無支出資料</td></tr>`;
}

/**
 * 渲染今日支出細項明細
 */
function renderExpenseItems() {
    DOM.desktopExpenseTbody.innerHTML = '';
    DOM.mobileExpenseList.innerHTML = '';
    
    const items = state.currentRecord.expenseItems || [];
    
    if (items.length === 0) {
        DOM.expenseEmptyMsg.style.display = 'block';
    } else {
        DOM.expenseEmptyMsg.style.display = 'none';
        
        items.forEach((item, index) => {
            // --- A. 電腦版表格行 ---
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${item.name}</strong></td>
                <td>$${item.amount.toLocaleString()} 元</td>
                <td style="text-align: center;">
                    <button type="button" class="btn-delete-expense" data-index="${index}">❌ 刪除</button>
                </td>
            `;
            DOM.desktopExpenseTbody.appendChild(tr);
            
            // --- B. 手機版卡片 ---
            const card = document.createElement('div');
            card.className = 'mobile-expense-card';
            card.innerHTML = `
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-amount">$${item.amount.toLocaleString()} 元</span>
                </div>
                <button type="button" class="btn-delete-expense" data-index="${index}">❌ 刪除</button>
            `;
            DOM.mobileExpenseList.appendChild(card);
        });
        
        // 綁定刪除事件
        const deleteButtons = document.querySelectorAll('.btn-delete-expense');
        deleteButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const index = parseInt(btn.dataset.index);
                deleteExpenseItem(index);
            });
        });
    }
    
    // 更新今日總支出顯示
    const total = items.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);
    DOM.displayTotalExpense.textContent = `$${total.toLocaleString()} 元`;
}

/**
 * 刪除單筆支出項目
 */
function deleteExpenseItem(index) {
    const items = state.currentRecord.expenseItems || [];
    const removedItem = items[index];
    if (confirm(`確定要刪除「${removedItem.name} $${removedItem.amount}」此筆支出嗎？`)) {
        items.splice(index, 1);
        state.currentRecord.expenseItems = items;
        saveCurrentData();
        renderExpenseItems();
        showToast("已成功刪除支出項目！");
    }
}

/**
 * 依據數量動態調整「結業剩餘」輸入框的文字顏色 (小於8為警示紅字，其餘為藍字)
 */
function updateClosingInputColor(productId, value) {
    const dtClosing = document.getElementById(`dt-closing-${productId}`);
    const mbClosing = document.getElementById(`mb-closing-${productId}`);
    
    // 如果輸入為空，不判定為小於8（避免尚未輸入時就顯示紅色警示）
    if (value === "" || value === null || value === undefined) {
        if (dtClosing) {
            dtClosing.classList.remove('input-closing-red');
            dtClosing.classList.add('input-closing-blue');
        }
        if (mbClosing) {
            mbClosing.classList.remove('input-closing-red');
            mbClosing.classList.add('input-closing-blue');
        }
        return;
    }
    
    const val = parseInt(value);
    const isWarning = !isNaN(val) && val < (state.settings.warningLimit || 8);
    
    if (dtClosing) {
        if (isWarning) {
            dtClosing.classList.remove('input-closing-blue');
            dtClosing.classList.add('input-closing-red');
        } else {
            dtClosing.classList.remove('input-closing-red');
            dtClosing.classList.add('input-closing-blue');
        }
    }
    
    if (mbClosing) {
        if (isWarning) {
            mbClosing.classList.remove('input-closing-blue');
            mbClosing.classList.add('input-closing-red');
        } else {
            mbClosing.classList.remove('input-closing-red');
            mbClosing.classList.add('input-closing-blue');
        }
    }
}

window.addEventListener('resize', () => {
    if (state.currentTab === "tab-reports") {
        renderReports();
    } else if (state.currentTab === "tab-history-query") {
        renderHistoryQuery();
    }
});

/**
 * 統計並渲染歷史查詢明細 (月明細/年明細)
 */
function renderHistoryQuery() {
    const records = getAllRecords();
    const settings = getSettings();
    
    // 確保有 monthlyStaffSalary
    const staffSalary = settings.monthlyStaffSalary || 0;
    const dailyFixedCostVal = Math.round(((settings.monthlyFixedCost || 0) + staffSalary) / 30);
    
    if (state.historyTab === "month") {
        // --- 渲染月明細 (每日 rows) ---
        DOM.historySummaryRevLabel.textContent = "該月總營業額";
        DOM.historySummaryCostLabel.textContent = "該月總支出 (食材+固定)";
        DOM.historySummaryProfitLabel.textContent = "該月總淨利";
        DOM.historySummarySalesLabel.textContent = "該月銷售總量";
        
        DOM.historyTableTitle.textContent = `${state.historyMonth.split('-')[0]}年${state.historyMonth.split('-')[1]}月 營業明細表格`;
        DOM.historyMobileTitle.textContent = `${state.historyMonth.split('-')[0]}年${state.historyMonth.split('-')[1]}月 營業明細卡片`;
        
        // 1. 計算該月所有的天數
        const parts = state.historyMonth.split('-');
        const year = parseInt(parts[0]);
        const monthIndex = parseInt(parts[1]) - 1; // 0-indexed month
        
        const firstDay = new Date(year, monthIndex, 1);
        const lastDay = new Date(year, monthIndex + 1, 0); // Day 0 of next month is the last day of this month
        const totalDays = lastDay.getDate();
        
        // 2. 搜集該月的資料並計算累計值
        let monthTotalRevenue = 0;
        let monthTotalCost = 0;
        let monthTotalProfit = 0;
        let monthTotalSalesBags = 0;
        
        const monthDaysData = [];
        
        for (let day = 1; day <= totalDays; day++) {
            const dateStr = `${year}-${String(monthIndex + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const record = records[dateStr];
            const hasData = !!record;
            
            // 判斷是否為六日或國定假日，若無營業資料則去除不顯示
            const dateObj = new Date(year, monthIndex, day);
            if (isTaiwanHoliday(dateObj) && !hasData) {
                continue;
            }
            
            let revenue = 0;
            let varCost = 0;
            let fixedCost = 0;
            let salesBags = 0;
            let notes = "";
            
            if (hasData) {
                revenue = record.revenue || 0;
                varCost = record.variableCost || 0;
                fixedCost = dailyFixedCostVal;
                notes = record.notes || "";
                
                // 計算銷售袋數
                if (record.inventory) {
                    Object.keys(record.inventory).forEach(pid => {
                        salesBags += record.inventory[pid].salesBags || 0;
                    });
                }
                
                monthTotalRevenue += revenue;
                monthTotalCost += (varCost + fixedCost);
                monthTotalSalesBags += salesBags;
            }
            
            const totalCost = varCost + fixedCost;
            const profit = revenue - totalCost;
            
            monthDaysData.push({
                dateStr,
                day,
                hasData,
                revenue,
                totalCost,
                profit,
                salesBags,
                notes
            });
        }
        
        monthTotalProfit = monthTotalRevenue - monthTotalCost;
        
        // 3. 填入頂部累計統計值
        DOM.historySummaryRevenue.textContent = `$${monthTotalRevenue.toLocaleString()}`;
        DOM.historySummaryCost.textContent = `$${monthTotalCost.toLocaleString()}`;
        
        DOM.historySummaryProfit.textContent = `$${monthTotalProfit.toLocaleString()}`;
        if (monthTotalProfit >= 0) {
            DOM.historySummaryProfit.parentElement.className = "summary-tile total-profit positive";
        } else {
            DOM.historySummaryProfit.parentElement.className = "summary-tile total-profit negative";
        }
        
        DOM.historySummarySales.textContent = `${monthTotalSalesBags.toLocaleString()} 包 / ${(monthTotalSalesBags * 3).toLocaleString()} 顆`;
        
        // 4. 渲染電腦版表格
        DOM.historyTableThead.innerHTML = `
            <tr>
                <th width="15%">日期</th>
                <th width="15%">銷售總量</th>
                <th width="15%">營業額</th>
                <th width="15%">總成本 (食材+固定)</th>
                <th width="15%">當日淨利</th>
                <th width="20%">備註</th>
                <th width="10%">操作</th>
            </tr>
        `;
        
        DOM.historyTableTbody.innerHTML = '';
        DOM.historyMobileList.innerHTML = '';
        
        const daysOfWeek = ['日', '一', '二', '三', '四', '五', '六'];
        
        let weekRev = 0;
        let weekCost = 0;
        let weekProfit = 0;
        let weekSales = 0;
        let weekDaysCount = 0;
        let weekStartDateStr = null;
        let weekIndex = 1;

        monthDaysData.forEach((dayData, idx) => {
            const dateParts = dayData.dateStr.split('-');
            const dateObj = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]);
            const dayOfWeek = dateObj.getDay();
            const dayName = daysOfWeek[dayOfWeek];
            const shortDateStr = `${dateParts[1]}/${dateParts[2]} (${dayName})`;
            
            if (!weekStartDateStr) {
                weekStartDateStr = `${dateParts[1]}/${dateParts[2]}`;
            }
            weekDaysCount++;
            weekRev += dayData.revenue;
            weekCost += dayData.totalCost;
            weekProfit += dayData.profit;
            weekSales += dayData.salesBags;

            // 電腦版行
            const tr = document.createElement('tr');
            if (!dayData.hasData) {
                tr.innerHTML = `
                    <td class="history-empty-row">${shortDateStr}</td>
                    <td class="history-empty-row">-</td>
                    <td class="history-empty-row">-</td>
                    <td class="history-empty-row">-</td>
                    <td class="history-empty-row">-</td>
                    <td class="history-empty-row" style="text-align: left;">(無營運資料)</td>
                    <td>
                        <button type="button" class="m-history-action-btn" data-date="${dayData.dateStr}">新增</button>
                    </td>
                `;
            } else {
                const profitClass = dayData.profit >= 0 ? "positive" : "negative";
                tr.innerHTML = `
                    <td><strong>${shortDateStr}</strong></td>
                    <td>${dayData.salesBags} 包 <span class="val-unit">(${(dayData.salesBags * 3)} 顆)</span></td>
                    <td class="val-revenue">$${dayData.revenue.toLocaleString()}</td>
                    <td class="val-cost">$${dayData.totalCost.toLocaleString()}</td>
                    <td class="val-profit ${profitClass}">$${dayData.profit.toLocaleString()}</td>
                    <td style="text-align: left; font-size: 0.78rem; max-width: 150px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;" title="${dayData.notes}">${dayData.notes}</td>
                    <td>
                        <button type="button" class="m-history-action-btn" data-date="${dayData.dateStr}">查看</button>
                    </td>
                `;
            }
            DOM.historyTableTbody.appendChild(tr);
            
            // 手機版卡片
            const card = document.createElement('div');
            if (!dayData.hasData) {
                card.className = "mobile-history-card no-data";
                card.innerHTML = `
                    <div class="m-history-header">
                        <span class="m-history-date">${shortDateStr}</span>
                        <button type="button" class="m-history-action-btn" data-date="${dayData.dateStr}">新增盤點</button>
                    </div>
                    <div style="font-size: 0.78rem; color: var(--text-light); text-align: center; padding: 6px;">
                        📅 本日尚無營運對帳紀錄
                    </div>
                `;
            } else {
                card.className = "mobile-history-card has-data";
                const profitClass = dayData.profit >= 0 ? "positive" : "negative";
                
                card.innerHTML = `
                    <div class="m-history-header">
                        <span class="m-history-date">${shortDateStr}</span>
                        <button type="button" class="m-history-action-btn" data-date="${dayData.dateStr}">查看編輯</button>
                    </div>
                    <div class="m-history-grid">
                        <div class="m-history-grid-item">
                            <span class="m-history-grid-label">銷售量</span>
                            <span class="m-history-grid-val" style="color: var(--primary);">${dayData.salesBags} 包</span>
                        </div>
                        <div class="m-history-grid-item">
                            <span class="m-history-grid-label">總營業額</span>
                            <span class="m-history-grid-val" style="color: var(--text-main);">$${dayData.revenue.toLocaleString()}</span>
                        </div>
                        <div class="m-history-grid-item">
                            <span class="m-history-grid-label">今日淨利</span>
                            <span class="m-history-grid-val val-profit ${profitClass}">$${dayData.profit.toLocaleString()}</span>
                        </div>
                    </div>
                    ${dayData.notes ? `<div class="m-history-notes">📝 備註：${dayData.notes}</div>` : ''}
                `;
            }
            DOM.historyMobileList.appendChild(card);

            // 判斷是否為週日 (Sunday) 或該月最後一天 ➔ 插入「週小計」
            const isSunday = dayOfWeek === 0;
            const isLastDay = idx === monthDaysData.length - 1;

            if (isSunday || isLastDay) {
                const weekEndDateStr = `${dateParts[1]}/${dateParts[2]}`;
                const weekRangeLabel = `📌 ${weekStartDateStr} ~ ${weekEndDateStr} (第 ${weekIndex} 週小計)`;
                const profitClass = weekProfit >= 0 ? "positive" : "negative";

                // --- 1. 電腦版週小計行 ---
                const weekTr = document.createElement('tr');
                weekTr.className = 'history-week-summary-row';
                weekTr.style.backgroundColor = '#fff8f0';
                weekTr.style.borderTop = '2px dashed #ffa726';
                weekTr.style.borderBottom = '2px dashed #ffa726';
                weekTr.style.fontWeight = 'bold';
                
                weekTr.innerHTML = `
                    <td style="color: #e65100; font-weight: 800;">${weekRangeLabel}</td>
                    <td style="color: #e65100;">${weekSales.toLocaleString()} 包 <span class="val-unit">(${(weekSales * 3).toLocaleString()} 顆)</span></td>
                    <td class="val-revenue" style="font-weight: 800; color: #2e7d32;">$${weekRev.toLocaleString()}</td>
                    <td class="val-cost" style="color: #c62828;">$${weekCost.toLocaleString()}</td>
                    <td class="val-profit ${profitClass}" style="font-weight: 800;">$${weekProfit.toLocaleString()}</td>
                    <td colspan="2" style="font-size: 0.78rem; color: #f57c00; text-align: left;">週營業額與淨利小計 (${weekDaysCount}天)</td>
                `;
                DOM.historyTableTbody.appendChild(weekTr);

                // --- 2. 手機版週小計卡片 ---
                const weekCard = document.createElement('div');
                weekCard.className = 'mobile-history-card week-summary-card';
                weekCard.style.background = 'linear-gradient(135deg, #fff8f0 0%, #ffe0b2 100%)';
                weekCard.style.border = '1.5px solid #ffa726';
                weekCard.style.borderRadius = '12px';
                weekCard.style.margin = '14px 0 18px 0';
                weekCard.style.padding = '12px 14px';
                weekCard.style.boxShadow = '0 2px 8px rgba(230,81,0,0.12)';

                weekCard.innerHTML = `
                    <div style="font-size: 0.9rem; font-weight: 800; color: #e65100; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                        <span>${weekRangeLabel}</span>
                        <span style="font-size: 0.75rem; background: #ffe0b2; color: #e65100; padding: 2px 6px; border-radius: 6px; font-weight: 800;">週小計</span>
                    </div>
                    <div class="m-history-grid" style="grid-template-columns: repeat(3, 1fr); gap: 6px;">
                        <div class="m-history-grid-item" style="background: rgba(255,255,255,0.85); padding: 6px 4px; border-radius: 6px; text-align: center;">
                            <span class="m-history-grid-label" style="font-size: 0.68rem; color: #e65100;">週營業額</span>
                            <span class="m-history-grid-val" style="color: #2e7d32; font-size: 0.9rem; font-weight: 800;">$${weekRev.toLocaleString()}</span>
                        </div>
                        <div class="m-history-grid-item" style="background: rgba(255,255,255,0.85); padding: 6px 4px; border-radius: 6px; text-align: center;">
                            <span class="m-history-grid-label" style="font-size: 0.68rem; color: #c62828;">週總支出</span>
                            <span class="m-history-grid-val" style="color: #c62828; font-size: 0.88rem; font-weight: 700;">$${weekCost.toLocaleString()}</span>
                        </div>
                        <div class="m-history-grid-item" style="background: rgba(255,255,255,0.85); padding: 6px 4px; border-radius: 6px; text-align: center;">
                            <span class="m-history-grid-label" style="font-size: 0.68rem; color: #e65100;">週淨利</span>
                            <span class="m-history-grid-val val-profit ${profitClass}" style="font-size: 0.9rem; font-weight: 800;">$${weekProfit.toLocaleString()}</span>
                        </div>
                    </div>
                    <div style="font-size: 0.78rem; font-weight: 700; color: #d84315; text-align: right; margin-top: 8px;">
                        📦 本週銷售總量：${weekSales.toLocaleString()} 包 (${(weekSales * 3).toLocaleString()} 顆)
                    </div>
                `;
                DOM.historyMobileList.appendChild(weekCard);

                // 重置週累計
                weekRev = 0;
                weekCost = 0;
                weekProfit = 0;
                weekSales = 0;
                weekDaysCount = 0;
                weekStartDateStr = null;
                weekIndex++;
            }
        });
        
    } else {
        // --- 渲染年明細 (12個月份 rows) ---
        DOM.historySummaryRevLabel.textContent = "該年總營業額";
        DOM.historySummaryCostLabel.textContent = "該年總支出 (食材+固定)";
        DOM.historySummaryProfitLabel.textContent = "該年總淨利";
        DOM.historySummarySalesLabel.textContent = "該年銷售總量";
        
        DOM.historyTableTitle.textContent = `${state.historyYear}年度 營業明細表格`;
        DOM.historyMobileTitle.textContent = `${state.historyYear}年度 營業明細卡片`;
        
        let yearTotalRevenue = 0;
        let yearTotalCost = 0;
        let yearTotalProfit = 0;
        let yearTotalSalesBags = 0;
        
        const yearMonthsData = [];
        
        // 1. 遍歷 1 到 12 月
        for (let m = 1; m <= 12; m++) {
            const monthStr = `${state.historyYear}-${String(m).padStart(2, '0')}`;
            
            // 計算該月有資料的天數與累計值
            let monthRev = 0;
            let monthVarCost = 0;
            let monthFixedCost = 0;
            let monthSales = 0;
            let hasAnyData = false;
            let activeDaysCount = 0;
            
            // 計算該月有多少天
            const daysInMonth = new Date(state.historyYear, m, 0).getDate();
            
            for (let d = 1; d <= daysInMonth; d++) {
                const dateStr = `${monthStr}-${String(d).padStart(2, '0')}`;
                const record = records[dateStr];
                
                if (record) {
                    hasAnyData = true;
                    activeDaysCount++;
                    monthRev += record.revenue || 0;
                    monthVarCost += record.variableCost || 0;
                    
                    // 該日銷售量
                    if (record.inventory) {
                        Object.keys(record.inventory).forEach(pid => {
                            monthSales += record.inventory[pid].salesBags || 0;
                        });
                    }
                }
            }
            
            // 每月固定成本攤提 = 該月有資料的天數 * 每日攤提成本
            monthFixedCost = activeDaysCount * dailyFixedCostVal;
            const monthTotalCost = monthVarCost + monthFixedCost;
            const monthProfit = monthRev - monthTotalCost;
            
            if (hasAnyData) {
                yearTotalRevenue += monthRev;
                yearTotalCost += monthTotalCost;
                yearTotalSalesBags += monthSales;
            }
            
            yearMonthsData.push({
                monthStr,
                monthName: `${m}月`,
                hasData: hasAnyData,
                revenue: monthRev,
                totalCost: monthTotalCost,
                profit: monthProfit,
                salesBags: monthSales,
                activeDaysCount
            });
        }
        
        yearTotalProfit = yearTotalRevenue - yearTotalCost;
        
        // 2. 填入頂部累計統計值
        DOM.historySummaryRevenue.textContent = `$${yearTotalRevenue.toLocaleString()}`;
        DOM.historySummaryCost.textContent = `$${yearTotalCost.toLocaleString()}`;
        
        DOM.historySummaryProfit.textContent = `$${yearTotalProfit.toLocaleString()}`;
        if (yearTotalProfit >= 0) {
            DOM.historySummaryProfit.parentElement.className = "summary-tile total-profit positive";
        } else {
            DOM.historySummaryProfit.parentElement.className = "summary-tile total-profit negative";
        }
        
        DOM.historySummarySales.textContent = `${yearTotalSalesBags.toLocaleString()} 包 / ${(yearTotalSalesBags * 3).toLocaleString()} 顆`;
        
        // 3. 渲染電腦版表格頭
        DOM.historyTableThead.innerHTML = `
            <tr>
                <th width="15%">月份</th>
                <th width="15%">營業天數</th>
                <th width="15%">銷售總量</th>
                <th width="15%">累計營業額</th>
                <th width="15%">累計總支出</th>
                <th width="15%">期間淨利</th>
                <th width="10%">操作</th>
            </tr>
        `;
        
        DOM.historyTableTbody.innerHTML = '';
        DOM.historyMobileList.innerHTML = '';
        
        yearMonthsData.forEach(mData => {
            const tr = document.createElement('tr');
            if (!mData.hasData) {
                tr.innerHTML = `
                    <td class="history-empty-row">${state.historyYear}年${mData.monthName}</td>
                    <td class="history-empty-row">0 天</td>
                    <td class="history-empty-row">-</td>
                    <td class="history-empty-row">-</td>
                    <td class="history-empty-row">-</td>
                    <td class="history-empty-row">-</td>
                    <td class="history-empty-row" style="text-align: left;">(無營運資料)</td>
                `;
            } else {
                const profitClass = mData.profit >= 0 ? "positive" : "negative";
                tr.innerHTML = `
                    <td><strong>${state.historyYear}年${mData.monthName}</strong></td>
                    <td><span class="badge badge-secondary">${mData.activeDaysCount} 天</span></td>
                    <td>${mData.salesBags} 包 <span class="val-unit">(${(mData.salesBags * 3)} 顆)</span></td>
                    <td class="val-revenue">$${mData.revenue.toLocaleString()}</td>
                    <td class="val-cost">$${mData.totalCost.toLocaleString()}</td>
                    <td class="val-profit ${profitClass}">$${mData.profit.toLocaleString()}</td>
                    <td>
                        <button type="button" class="m-history-action-btn btn-view-month" data-month="${mData.monthStr}">檢視明細</button>
                    </td>
                `;
            }
            DOM.historyTableTbody.appendChild(tr);
            
            // 手機版卡片
            const card = document.createElement('div');
            if (!mData.hasData) {
                card.className = "mobile-history-card no-data";
                card.innerHTML = `
                    <div class="m-history-header">
                        <span class="m-history-date">${state.historyYear}年${mData.monthName}</span>
                        <span style="font-size:0.68rem; color:var(--text-light);">(無營運資料)</span>
                    </div>
                `;
            } else {
                card.className = "mobile-history-card has-data";
                const profitClass = mData.profit >= 0 ? "positive" : "negative";
                
                card.innerHTML = `
                    <div class="m-history-header">
                        <span class="m-history-date">${state.historyYear}年${mData.monthName} <span class="badge badge-secondary" style="font-size:0.6rem; padding: 2px 4px; margin-left:4px;">${mData.activeDaysCount}天</span></span>
                        <button type="button" class="m-history-action-btn btn-view-month" data-month="${mData.monthStr}">檢視月明細</button>
                    </div>
                    <div class="m-history-grid">
                        <div class="m-history-grid-item">
                            <span class="m-history-grid-label">累計銷量</span>
                            <span class="m-history-grid-val" style="color: var(--primary);">${mData.salesBags} 包</span>
                        </div>
                        <div class="m-history-grid-item">
                            <span class="m-history-grid-label">累計營業額</span>
                            <span class="m-history-grid-val" style="color: var(--text-main);">$${mData.revenue.toLocaleString()}</span>
                        </div>
                        <div class="m-history-grid-item">
                            <span class="m-history-grid-label">累計淨利</span>
                            <span class="m-history-grid-val val-profit ${profitClass}">$${mData.profit.toLocaleString()}</span>
                        </div>
                    </div>
                `;
            }
            DOM.historyMobileList.appendChild(card);
        });
        
        // 綁定檢視月明細按鈕
        const viewMonthButtons = document.querySelectorAll('.btn-view-month');
        viewMonthButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const month = btn.dataset.month;
                state.historyMonth = month;
                if (DOM.historyMonthPicker) {
                    DOM.historyMonthPicker.value = month;
                }
                updateHistoryDateDisplay();
                
                // 切換子分頁為月明細
                DOM.btnHistoryMonthTab.click();
            });
        });
    }
    
    // 綁定跳轉至具體日期的按鈕事件 (適用於月明細中的查看/編輯與新增)
    const viewButtons = document.querySelectorAll('.m-history-action-btn[data-date]');
    viewButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const dateStr = btn.dataset.date;
            state.currentDate = dateStr;
            DOM.operationDate.value = dateStr;
            updateDateDisplay();
            loadRecordForDate(dateStr);
            
            // 跳轉到盤點分頁
            switchTab("tab-inventory");
            showToast(`已切換至 ${dateStr} 營業記錄！`);
        });
    });
}

// isTaiwanHoliday(dateObj) 已移至 db.js 全域定義，供 db.js 與 app.js 共用。

/**
 * 當背景雲端同步完成時，供 db.js 呼叫以動態重新整理 App UI 狀態
 */
function refreshAppState() {
    console.log("背景資料已更新，正在動態對齊盤點與對帳介面...");
    
    // 重新載入今日數據與設定
    state.settings = getSettings();
    state.currentRecord = getRecord(state.currentDate);
    
    const activeEl = document.activeElement;
    const isUserTyping = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

    if (!isUserTyping) {
        // 使用者未在輸入狀態，完整重建盤點表 (確保昨留結存、各層架、桌面、入庫與銷量 100% 精確同步)
        renderInventoryFields();
    } else {
        // 使用者正在輸入中，動態對齊其他欄位值 (不影響使用者正焦點輸入的欄位)
        const products = state.settings.products || [];
        const inventory = state.currentRecord.inventory || {};

        products.forEach(p => {
            const prodData = inventory[p.id] || {};
            const shelves = prodData.shelves || ["", "", "", "", ""];
            const table = prodData.table !== undefined ? prodData.table : "";
            const closing = prodData.closingBags !== undefined ? prodData.closingBags : "";
            const incoming = prodData.incomingBags !== undefined ? prodData.incomingBags : "";
            const yesterday = prodData.yesterdayBags !== undefined ? prodData.yesterdayBags : 0;

            const updateVal = (id, newVal) => {
                const el = document.getElementById(id);
                if (el && el !== activeEl) {
                    const displayVal = (newVal === 0 || newVal === "0" || newVal === undefined || newVal === null) ? "" : newVal;
                    el.value = displayVal;
                }
            };

            updateVal(`dt-yesterday-${p.id}`, yesterday);
            updateVal(`mb-yesterday-${p.id}`, yesterday);
            updateVal(`dt-incoming-${p.id}`, incoming);
            updateVal(`mb-incoming-${p.id}`, incoming);

            for (let i = 1; i <= 5; i++) {
                updateVal(`dt-shelf${i}-${p.id}`, shelves[i - 1]);
                updateVal(`mb-shelf${i}-${p.id}`, shelves[i - 1]);
            }

            updateVal(`dt-table-${p.id}`, table);
            updateVal(`mb-table-${p.id}`, table);

            updateVal(`dt-closing-${p.id}`, closing);
            updateVal(`mb-closing-${p.id}`, closing);

            const hasClosing = closing !== "" && closing !== undefined && closing !== null;
            const salesText = hasClosing ? prodData.salesBags : "-";
            const piecesText = hasClosing ? (prodData.salesBags * 3) : "-";
            const unitBags = hasClosing ? "包" : "";
            const unitPieces = hasClosing ? "顆" : "";

            const setText = (id, txt) => {
                const el = document.getElementById(id);
                if (el) el.textContent = txt;
            };

            setText(`dt-sales-bags-${p.id}`, salesText);
            setText(`dt-sales-bags-unit-${p.id}`, unitBags);
            setText(`dt-sales-pieces-${p.id}`, piecesText);
            setText(`dt-sales-pieces-unit-${p.id}`, unitPieces);

            setText(`mb-sales-bags-${p.id}`, salesText);
            setText(`mb-sales-bags-unit-${p.id}`, unitBags);
            setText(`mb-sales-pieces-${p.id}`, piecesText);
            setText(`mb-sales-pieces-unit-${p.id}`, unitPieces);
        });
    }
    
    // 填充底層金與收銀欄位
    const updateCashVal = (el, val) => {
        if (el && el !== activeEl) {
            el.value = (val !== undefined && val !== null) ? val : "";
        }
    };
    updateCashVal(DOM.inputMorningBaseCash, state.currentRecord.morningBaseCash);
    updateCashVal(DOM.inputMorningGoodsExpense, state.currentRecord.morningGoodsExpense !== undefined ? state.currentRecord.morningGoodsExpense : "");
    updateCashVal(DOM.inputMorningClosingCash, state.currentRecord.morningClosingCash || "");
    updateCashVal(DOM.inputAfternoonBaseCash, state.currentRecord.afternoonBaseCash || "");
    updateCashVal(DOM.inputAfternoonGoodsExpense, state.currentRecord.afternoonGoodsExpense !== undefined ? state.currentRecord.afternoonGoodsExpense : "");
    updateCashVal(DOM.inputAfternoonClosingCash, state.currentRecord.afternoonClosingCash || "");
    
    // 填充面額欄位
    fillCashDenominations(state.currentRecord);
    toggleCashInputMethod(state.currentDate);
    
    // 重繪支出明細與報表計算 (如果使用者不在輸入支出名稱或金額時才刷新列表)
    const isEditingExpense = activeEl && (activeEl === DOM.inputExpenseName || activeEl === DOM.inputExpenseAmount);
    if (!isEditingExpense) {
        renderExpenseItems();
    }
    calculateInventoryTotals();
    calculateCash();
    
    if (state.currentTab === "tab-reports") {
        renderReports();
    }

    showToast("盤點與營運資料已完全對齊雲端！");
}
