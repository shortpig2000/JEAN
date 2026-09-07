/**
 * db.js - 營運管理系統資料儲存與管理層 (多商品與早晚對帳接續版)
 * 使用瀏覽器的 localStorage 進行資料儲存，並支援 JSON 備份匯出與匯入。
 */

const DB_KEYS = {
    RECORDS: 'meimai_dimsum_records_multi_shift_items', // 美麥麵點資料庫 Key
    SETTINGS: 'meimai_dimsum_settings_multi_shift'
};

// 預設系統設定與美麥麵點品項清單
const DEFAULT_SETTINGS = {
    defaultBaseCash: 2000,      // 預設早上班開市底層金
    monthlyFixedCost: 15000,    // 每月固定成本
    monthlyStaffSalary: 0,      // 每月員工薪水
    warningLimit: 8,            // 預設單品低庫存警示 (8包)

    products: [
        { id: "fresh_meat_bao", name: "鮮肉包" },
        { id: "scallion_roll", name: "蔥花捲" },
        { id: "soymilk_mantou", name: "豆漿饅頭" },
        { id: "cheese_roll", name: "起司捲" },
        { id: "prod_1782824404786", name: "五穀雜糧饅頭" },
        { id: "brown_sugar_bao", name: "黑糖包" },
        { id: "brown_sugar_mantou", name: "黑糖饅頭" },
        { id: "prod_1782824431602", name: "芋泥包" },
        { id: "prod_1782824449670", name: "芋頭饅頭" },
        { id: "prod_1782824471350", name: "芋頭地瓜捲" },
        { id: "prod_1782824491305", name: "南瓜饅頭" },
        { id: "prod_1782824504642", name: "南瓜起司包" },
        { id: "prod_1782824522630", name: "芝麻紅豆捲" },
        { id: "prod_1782824533865", name: "芝麻饅頭" },
        { id: "prod_1782824569037", name: "巧克力起司捲" }
    ],
    expenseTemplates: [
        "麵粉進貨",
        "豬肉食材",
        "瓦斯更換",
        "包裝耗材",
        "糖與調味品",
        "水電雜支",
        "白米、糯米",
        "地瓜粉",
        "土司、漢堡",
        "冷凍品",
        "油條",
        "雞蛋"
    ],
    firebaseConfig: {
        apiKey: "AIzaSyDYrzOZ_m9wNxrLvZjt65oipQNCU5Yn3oU",
        authDomain: "jean-breakfast.firebaseapp.com",
        databaseURL: "https://jean-breakfast-default-rtdb.firebaseio.com",
        projectId: "jean-breakfast",
        storageBucket: "jean-breakfast.firebasestorage.app",
        messagingSenderId: "929025947124",
        appId: "1:929025947124:web:3c8e301ee599c78fd575a1",
        measurementId: "G-PYE61CQ3XY"
    },
    firebaseConfigRaw: `const firebaseConfig = {
  apiKey: "AIzaSyDYrzOZ_m9wNxrLvZjt65oipQNCU5Yn3oU",
  authDomain: "jean-breakfast.firebaseapp.com",
  databaseURL: "https://jean-breakfast-default-rtdb.firebaseio.com",
  projectId: "jean-breakfast",
  storageBucket: "jean-breakfast.firebasestorage.app",
  messagingSenderId: "929025947124",
  appId: "1:929025947124:web:3c8e301ee599c78fd575a1",
  measurementId: "G-PYE61CQ3XY"
};`
};

/**
 * 取得系統設定，若無則初始化為預設值
 */
function getSettings() {
    const data = localStorage.getItem(DB_KEYS.SETTINGS);
    if (!data) {
        saveSettings(DEFAULT_SETTINGS);
        return DEFAULT_SETTINGS;
    }
    try {
        const parsed = JSON.parse(data);
        return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
        console.error("讀取設定失敗，使用預設值", e);
        return DEFAULT_SETTINGS;
    }
}

/**
 * 儲存系統設定
 */
function saveSettings(settings) {
    localStorage.setItem(DB_KEYS.SETTINGS, JSON.stringify(settings));
    pushToCloud();
}

/**
 * 取得所有每日營運記錄
 */
function getAllRecords() {
    const data = localStorage.getItem(DB_KEYS.RECORDS);
    if (!data) {
        return {};
    }
    try {
        return JSON.parse(data);
    } catch (e) {
        console.error("讀取營業記錄失敗，回傳空物件", e);
        return {};
    }
}

/**
 * 儲存所有每日營運記錄
 */
function saveAllRecords(records) {
    localStorage.setItem(DB_KEYS.RECORDS, JSON.stringify(records));
    pushToCloud();
}

/**
 * 判斷一個已儲存的記錄是否為實際營業日（工作日預設是，假日則需有實際人工輸入的商品數據）
 */
function isActualBusinessDay(dateStr, record) {
    if (!record) return false;
    
    // 如果不是六日與國定假日，預設就是營業日
    if (!isTaiwanHolidayStr(dateStr)) {
        return true;
    }
    
    // 如果是放假日，只有當有實際準備商品（入庫不為空且大於0）或有登打剩餘結存（結存不為空）時，才視為營業日
    if (record.inventory) {
        let hasInput = false;
        Object.keys(record.inventory).forEach(pid => {
            const item = record.inventory[pid];
            const incomingStr = item.incomingBags !== undefined ? String(item.incomingBags).trim() : "";
            const closingStr = item.closingBags !== undefined ? String(item.closingBags).trim() : "";
            
            if (incomingStr !== "" && parseInt(incomingStr) > 0) {
                hasInput = true;
            }
            if (closingStr !== "") {
                hasInput = true;
            }
        });
        if (hasInput) return true;
    }
    
    return false;
}

/**
 * 取得特定日期的營運記錄，若不存在則建立一個新結構，若有缺品項則自動補齊
 */
function getRecord(dateStr) {
    const records = getAllRecords();
    const settings = getSettings();
    
    let record = records[dateStr];
    
    // 如果今天沒有資料，建立一個空的
    if (!record) {
        record = {
            date: dateStr,
            inventory: {},
            morningBaseCash: settings.defaultBaseCash,
            morningGoodsExpense: "",
            morningClosingCash: 0,
            afternoonBaseCash: 0, // 由前端即時連動，或儲存時設為 morningClosingCash
            afternoonGoodsExpense: "",
            afternoonClosingCash: 0,
            morningRevenue: 0,
            afternoonRevenue: 0,
            revenue: 0, // 今日實際總營業額
            expenseItems: [], // 支出細項明細
            variableCost: 0,
            notes: ""
        };
    }

    // 確保有貨款支出 (相容舊資料)
    if (record.morningGoodsExpense === undefined) {
        record.morningGoodsExpense = "";
    }
    if (record.afternoonGoodsExpense === undefined) {
        record.afternoonGoodsExpense = "";
    }

    // 確保有面額統計 (相容舊資料)
    if (!record.morningClosingDetails) {
        record.morningClosingDetails = { paper: "", c50: "", c10: "", c5: "", c1: "" };
    } else {
        if (record.morningClosingDetails.paper === undefined) {
            const p1000 = parseInt(record.morningClosingDetails.c1000) || 0;
            const p100 = parseInt(record.morningClosingDetails.c100) || 0;
            const sum = (p1000 * 1000) + (p100 * 100);
            record.morningClosingDetails.paper = sum > 0 ? sum : "";
        }
    }
    if (!record.afternoonClosingDetails) {
        record.afternoonClosingDetails = { paper: "", c50: "", c10: "", c5: "", c1: "" };
    } else {
        if (record.afternoonClosingDetails.paper === undefined) {
            const p1000 = parseInt(record.afternoonClosingDetails.c1000) || 0;
            const p100 = parseInt(record.afternoonClosingDetails.c100) || 0;
            const sum = (p1000 * 1000) + (p100 * 100);
            record.afternoonClosingDetails.paper = sum > 0 ? sum : "";
        }
    }

    // 確保有 expenseItems (相容舊資料)
    if (!record.expenseItems) {
        record.expenseItems = [];
        if (record.variableCost > 0) {
            record.expenseItems.push({ name: "未分類支出", amount: record.variableCost });
        }
    }

    // 確保記錄中有 settings.products 包含的所有商品
    const sortedDates = Object.keys(records).sort();
    const prevDates = sortedDates.filter(d => d < dateStr && isActualBusinessDay(d, records[d]));
    const lastDate = prevDates.length > 0 ? prevDates[prevDates.length - 1] : null;

    const isHoliday = isTaiwanHolidayStr(dateStr);

    settings.products.forEach(p => {
        // 推算該商品的昨日實際結存
        let yesterdayBags = 0;
        if (lastDate && records[lastDate].inventory && records[lastDate].inventory[p.id]) {
            yesterdayBags = parseInt(records[lastDate].inventory[p.id].closingBags) || 0;
        }
        
        if (!record.inventory[p.id]) {
            record.inventory[p.id] = {
                yesterdayBags: yesterdayBags,
                incomingBags: "",
                shelves: ["", "", "", "", ""],
                table: "",
                closingBags: isHoliday ? yesterdayBags : "",
                salesBags: 0
            };
        } else {
            // 如果已經有此品項，但昨留結存的值不對（例如後來補登了昨天的帳），動態更新它！
            record.inventory[p.id].yesterdayBags = yesterdayBags;
            if (!record.inventory[p.id].shelves) {
                record.inventory[p.id].shelves = ["", "", "", "", ""];
            }
            if (record.inventory[p.id].table === undefined) {
                record.inventory[p.id].table = "";
            }
            
            // 如果是六日或國定假日，且使用者沒有手動填寫「今日入庫」或「結業剩餘」
            // 則自動將「結業剩餘」設為「昨留結存」（因為放假，結存不變，銷量為0）
            if (isHoliday) {
                const incomingStr = record.inventory[p.id].incomingBags;
                const closingStr = record.inventory[p.id].closingBags;
                
                if ((incomingStr === "" || parseInt(incomingStr) === 0) && 
                    (closingStr === "" || parseInt(closingStr) === yesterdayBags || closingStr === undefined)) {
                    record.inventory[p.id].closingBags = yesterdayBags;
                    record.inventory[p.id].incomingBags = "";
                }
            }
            
            // 重新計算今天的銷量
            const incomingStr = record.inventory[p.id].incomingBags;
            const closingStr = record.inventory[p.id].closingBags;
            const incoming = parseInt(incomingStr) || 0;
            const closing = parseInt(closingStr) || 0;
            
            // 若未填寫結業剩餘，銷量為0
            if (closingStr === "" || closingStr === undefined || closingStr === null) {
                record.inventory[p.id].salesBags = 0;
            } else {
                const sales = (yesterdayBags + incoming) - closing;
                record.inventory[p.id].salesBags = sales >= 0 ? sales : 0;
            }
        }
    });

    return record;
}

/**
 * 儲存或更新特定日期的營運記錄
 */
function saveRecord(dateStr, recordData) {
    const records = getAllRecords();
    const settings = getSettings();
    
    // 1. 計算每一項商品的銷售量
    const updatedInventory = {};
    settings.products.forEach(p => {
        const prodData = recordData.inventory[p.id] || { yesterdayBags: 0, incomingBags: "", closingBags: "" };
        const yesterdayBags = parseInt(prodData.yesterdayBags) || 0;
        const incomingBags = prodData.incomingBags !== "" && prodData.incomingBags !== null && prodData.incomingBags !== undefined ? parseInt(prodData.incomingBags) : "";
        const closingBags = prodData.closingBags !== "" && prodData.closingBags !== null && prodData.closingBags !== undefined ? parseInt(prodData.closingBags) : "";
        const incVal = incomingBags !== "" ? incomingBags : 0;
        const clsVal = closingBags !== "" ? closingBags : 0;
        const salesBags = closingBags !== "" ? ((yesterdayBags + incVal) - clsVal) : 0;
        
        updatedInventory[p.id] = {
            yesterdayBags,
            incomingBags,
            shelves: prodData.shelves || ["", "", "", "", ""],
            table: prodData.table !== undefined ? prodData.table : "",
            closingBags,
            salesBags: salesBags >= 0 ? salesBags : 0
        };
    });

    // 2. 早晚班對帳與營業額接續計算
    const morningBaseCash = parseFloat(recordData.morningBaseCash) || 0;
    const morningClosingCash = parseFloat(recordData.morningClosingCash) || 0;
    const hasMorningClosing = recordData.morningClosingCash !== "" && recordData.morningClosingCash !== 0;
    
    // 早上營業額 = (早上結業 + 早上貨款支出) - 早上底層
    const morningGoodsExpense = parseFloat(recordData.morningGoodsExpense) || 0;
    const morningRevenue = hasMorningClosing ? ((morningClosingCash + morningGoodsExpense) - morningBaseCash) : 0;
    
    // 下午開市底層金自動接續早上結業現金。若早上未結業，則預設等於早上底層金
    const afternoonBaseCash = hasMorningClosing ? morningClosingCash : morningBaseCash;
    
    const afternoonClosingCash = parseFloat(recordData.afternoonClosingCash) || 0;
    const hasAfternoonClosing = recordData.afternoonClosingCash !== "" && recordData.afternoonClosingCash !== 0;
    
    // 下午營業額 = (下午結業 + 下午貨款支出) - 下午底層
    const afternoonGoodsExpense = parseFloat(recordData.afternoonGoodsExpense) || 0;
    const afternoonRevenue = hasAfternoonClosing ? ((afternoonClosingCash + afternoonGoodsExpense) - afternoonBaseCash) : 0;
    
    // 今日實際總營業額
    let revenue = 0;
    if (hasMorningClosing && hasAfternoonClosing) {
        revenue = morningRevenue + afternoonRevenue;
    } else if (hasMorningClosing) {
        revenue = morningRevenue;
    } else if (hasAfternoonClosing) {
        // 若早上未輸入但下午輸入了，則以下午營業額為今日營業額
        revenue = afternoonRevenue;
    }

    const expenseItems = recordData.expenseItems || [];
    const variableCost = expenseItems.reduce((sum, item) => sum + (parseFloat(item.amount) || 0), 0);

    records[dateStr] = {
        date: dateStr,
        inventory: updatedInventory,
        morningBaseCash,
        morningGoodsExpense: parseFloat(recordData.morningGoodsExpense) || 0,
        morningClosingCash,
        afternoonBaseCash,
        afternoonGoodsExpense: parseFloat(recordData.afternoonGoodsExpense) || 0,
        afternoonClosingCash,
        morningRevenue,
        afternoonRevenue,
        revenue,
        expenseItems,
        variableCost,
        morningClosingDetails: recordData.morningClosingDetails || { paper: "", c50: "", c10: "", c5: "", c1: "" },
        afternoonClosingDetails: recordData.afternoonClosingDetails || { paper: "", c50: "", c10: "", c5: "", c1: "" },
        notes: recordData.notes || ""
    };

    saveAllRecords(records);
    
    // 連動更新後續日期中所有商品的「昨留包數」
    updateSubsequentYesterdayBags(dateStr);
}

/**
 * 遞迴更新後續所有日期之商品的昨留包數
 */
function updateSubsequentYesterdayBags(startDateStr) {
    const records = getAllRecords();
    const settings = getSettings();
    const sortedDates = Object.keys(records).sort();
    const startIndex = sortedDates.indexOf(startDateStr);
    
    if (startIndex !== -1 && startIndex < sortedDates.length - 1) {
        const currentRecord = records[startDateStr];
        const nextDateStr = sortedDates[startIndex + 1];
        const nextRecord = records[nextDateStr];
        
        let changed = false;
        
        settings.products.forEach(p => {
            const currentClosing = (currentRecord.inventory && currentRecord.inventory[p.id] ? currentRecord.inventory[p.id].closingBags : 0) || 0;
            
            if (!nextRecord.inventory) {
                nextRecord.inventory = {};
            }
            if (!nextRecord.inventory[p.id]) {
                nextRecord.inventory[p.id] = { yesterdayBags: 0, incomingBags: "", closingBags: "", salesBags: 0 };
            }
            
            const oldYesterday = nextRecord.inventory[p.id].yesterdayBags;
            
            if (oldYesterday !== currentClosing) {
                nextRecord.inventory[p.id].yesterdayBags = currentClosing;
                
                const isNextHoliday = isTaiwanHolidayStr(nextDateStr);
                if (isNextHoliday) {
                    const incoming = nextRecord.inventory[p.id].incomingBags;
                    const closing = nextRecord.inventory[p.id].closingBags;
                    
                    // 判斷是否為放假未營業狀態（無入庫，且剩餘為空、為0、或等於舊的昨日結存）
                    const isClosed = (incoming === "" || parseInt(incoming) === 0) &&
                        (closing === "" || parseInt(closing) === 0 || parseInt(closing) === oldYesterday || closing === undefined);
                    
                    if (isClosed) {
                        nextRecord.inventory[p.id].closingBags = currentClosing;
                        nextRecord.inventory[p.id].incomingBags = "";
                    }
                }
                
                const yesterday = nextRecord.inventory[p.id].yesterdayBags;
                const incoming = parseInt(nextRecord.inventory[p.id].incomingBags) || 0;
                const closing = parseInt(nextRecord.inventory[p.id].closingBags) || 0;
                const sales = (yesterday + incoming) - closing;
                
                nextRecord.inventory[p.id].salesBags = sales >= 0 ? sales : 0;
                changed = true;
            }
        });
        
        if (changed) {
            records[nextDateStr] = nextRecord;
            saveAllRecords(records);
            updateSubsequentYesterdayBags(nextDateStr);
        }
    }
}

/**
 * 匯出備份資料
 */
function exportBackupData() {
    const data = {
        records: getAllRecords(),
        settings: getSettings(),
        exportedAt: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
}

/**
 * 匯入備份資料
 */
function importBackupData(jsonStr) {
    try {
        const parsed = JSON.parse(jsonStr);
        if (parsed.records && typeof parsed.records === 'object') {
            saveAllRecords(parsed.records);
        }
        if (parsed.settings && typeof parsed.settings === 'object') {
            saveSettings(parsed.settings);
        }
        return { success: true };
    } catch (e) {
        console.error("匯入資料失敗", e);
        return { success: false, error: e.message };
    }
}

// 產生早晚對帳與多品項營運測試數據 (若為空時)
function checkAndGenerateDemoData() {
    const records = getAllRecords();
    if (Object.keys(records).length > 0) return;

    console.log("初始化接續收銀與多品項模擬數據...");
    const demoRecords = {};
    const settings = getSettings();
    const today = new Date();
    
    // 初始化前一天的結存
    const lastClosingBags = {};
    settings.products.forEach(p => {
        lastClosingBags[p.id] = 10; // 最初結業餘 10 包
    });
    
    // 產生過去 14 天的資料
    for (let i = 14; i >= 1; i--) {
        const date = new Date(today);
        date.setDate(today.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        
        const inventory = {};
        let totalDaySales = 0;
        let incomingBagsTotal = 0;
        
        settings.products.forEach(p => {
            const yesterday = lastClosingBags[p.id];
            let incoming = 0;
            if (i % 3 === 0) {
                incoming = 15;
            } else if (i % 5 === 0) {
                incoming = 20;
            }
            const available = yesterday + incoming;
            const closing = Math.max(3, Math.floor(available * (0.25 + Math.random() * 0.35)));
            const sales = available - closing;
            
            inventory[p.id] = {
                yesterdayBags: yesterday,
                incomingBags: incoming,
                closingBags: closing,
                salesBags: sales >= 0 ? sales : 0
            };
            
            totalDaySales += (sales >= 0 ? sales : 0);
            incomingBagsTotal += incoming;
            lastClosingBags[p.id] = closing;
        });
        
        // 分割早晚班對帳
        const morningBaseCash = settings.defaultBaseCash; // 3000
        
        // 假設早班大約佔當天銷量的 60%，晚班佔 40%
        const morningSalesShare = Math.round(totalDaySales * 0.6);
        const afternoonSalesShare = totalDaySales - morningSalesShare;
        
        // 早班營業額
        const morningRev = morningSalesShare * 60 + (Math.floor(Math.random() * 4) * 20);
        const morningClosingCash = morningBaseCash + morningRev;
        
        // 下午開市底層金 = 早上結業現金
        const afternoonBaseCash = morningClosingCash;
        
        // 下午班營業額
        const afternoonRev = afternoonSalesShare * 60 + (Math.floor(Math.random() * 4) * 20);
        const afternoonClosingCash = afternoonBaseCash + afternoonRev;
        
        // 今日總實際營業額 = 下午結業現金 - 早上底層金
        const totalRevenue = afternoonClosingCash - morningBaseCash;
        
        // 變動成本細項模擬
        const expenseItems = [];
        if (incomingBagsTotal > 0) {
            expenseItems.push({ name: "麵粉進貨", amount: Math.round(incomingBagsTotal * 15 + Math.random() * 50) });
            expenseItems.push({ name: "豬肉食材", amount: Math.round(incomingBagsTotal * 12 + Math.random() * 50) });
            if (i % 4 === 0) {
                expenseItems.push({ name: "瓦斯更換", amount: 800 });
            }
            if (i % 3 === 0) {
                expenseItems.push({ name: "包裝耗材", amount: 200 });
            }
        }
        
        const variableCost = expenseItems.reduce((sum, item) => sum + item.amount, 0);
        
        demoRecords[dateStr] = {
            date: dateStr,
            inventory,
            morningBaseCash,
            morningClosingCash,
            afternoonBaseCash,
            afternoonClosingCash,
            morningRevenue: morningRev,
            afternoonRevenue: afternoonRev,
            revenue: totalRevenue,
            expenseItems,
            variableCost,
            notes: i === 7 ? "週末人手充足，銷量佳" : ""
        };
    }
    
    saveAllRecords(demoRecords);
}

// 移除自動產生測試數據，避免每次空資料庫時又長出示範數字
// checkAndGenerateDemoData();

// 一次性自動清空舊有的示範數字，讓使用者重新整理頁面後即可開始使用全新空白資料庫
if (!localStorage.getItem('jean_demo_data_cleared_v4')) {
    localStorage.removeItem(DB_KEYS.RECORDS);
    localStorage.setItem('jean_demo_data_cleared_v4', 'true');
}

// 一次性強制將使用者本地的預設開市底層金更新為 2000 元，並連動更新未對帳日期的底層金
if (!localStorage.getItem('jean_base_cash_updated_2000_v1')) {
    const settings = getSettings();
    settings.defaultBaseCash = 2000;
    saveSettings(settings);
    
    const records = getAllRecords();
    Object.keys(records).forEach(dateStr => {
        if (!records[dateStr].morningClosingCash || records[dateStr].morningClosingCash === 0) {
            records[dateStr].morningBaseCash = 2000;
            // 重新計算連動下午底層金
            records[dateStr].afternoonBaseCash = 2000;
        }
    });
    saveAllRecords(records);
    
    localStorage.setItem('jean_base_cash_updated_2000_v1', 'true');
}

/**
 * 判斷是否為台灣國定假日或六日 (週六、週日與國定假日)
 */
function isTaiwanHoliday(dateObj) {
    const y = dateObj.getFullYear();
    const m = dateObj.getMonth() + 1; // 1-indexed month
    const d = dateObj.getDate();
    const w = dateObj.getDay(); // 0 = Sunday, 6 = Saturday

    // 1. 週六與週日
    if (w === 0 || w === 6) {
        return true;
    }

    // 2. 固定日期國定假日
    if (m === 1 && d === 1) return true; // 元旦
    if (m === 2 && d === 28) return true; // 二二八和平紀念日
    if (m === 4 && d === 4) return true; // 兒童節
    if (m === 4 && d === 5) return true; // 清明節
    if (m === 5 && d === 1) return true; // 勞動節
    if (m === 10 && d === 10) return true; // 國慶日

    // 3. 移動國定假日與補假調整 (2025, 2026, 2027 年)
    if (y === 2026) {
        // 春節連假 (Lunar New Year) - 2/16 to 2/20 (2/14, 2/15, 2/21, 2/22 為六日已排除)
        if (m === 2 && d >= 16 && d <= 20) return true;
        // 清明連假調整放假 (4/3, 4/6) (4/4 Sat, 4/5 Sun)
        if (m === 4 && (d === 3 || d === 6)) return true;
        // 端午連假調整放假 - 6/19 (Fri) (6/20 Sat, 6/21 Sun)
        if (m === 6 && d === 19) return true;
        // 中秋連假調整放假 - 9/25 (Fri), 9/28 (Mon) (9/26 Sat, 9/27 Sun)
        if (m === 9 && (d === 25 || d === 28)) return true;
        // 國慶連假調整放假 - 10/9 (Fri) (10/10 Sat, 10/11 Sun)
        if (m === 10 && d === 9) return true;
    }
    
    if (y === 2025) {
        // 春節連假 (1/27 to 1/31)
        if (m === 1 && d >= 27 && d <= 31) return true;
        // 清明連假調整放假 (4/3)
        if (m === 4 && d === 3) return true;
        // 端午節 (5/30 Fri)
        if (m === 5 && d === 30) return true;
        // 中秋節 (10/6 Mon)
        if (m === 10 && d === 6) return true;
    }

    if (y === 2027) {
        // 春節連假 (2/5 to 2/12)
        if (m === 2 && d >= 5 && d <= 12) return true;
        // 端午節 (6/9 Wed)
        if (m === 6 && d === 9) return true;
        // 中秋節 (9/15 Wed)
        if (m === 9 && d === 15) return true;
    }

    return false;
}

/**
 * 依據 YYYY-MM-DD 字串判斷是否為台灣國定假日或六日
 */
function isTaiwanHolidayStr(dateStr) {
    const parts = dateStr.split('-');
    if (parts.length !== 3) return false;
    const dateObj = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
    return isTaiwanHoliday(dateObj);
}

/**
 * 智慧解析從 Firebase 控制台複製的 Web Config (相容標準 JSON 與非標準 JS 鍵值對)
 */
function parseFirebaseConfig(inputStr) {
    if (!inputStr || !inputStr.trim()) return null;
    
    // 將所有可能的手機「智慧型引號」取代為標準雙引號
    inputStr = inputStr.replace(/[\u201c\u201d\u2018\u2019]/g, '"');
    
    try {
        return JSON.parse(inputStr.trim());
    } catch(e) {
        // 如果不是標準 JSON，使用正則提取 Web App 關鍵參數
        const config = {};
        const keys = ['apiKey', 'authDomain', 'databaseURL', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
        keys.forEach(key => {
            const regex = new RegExp(`['"]?${key}['"]?\\s*:\\s*['"]([^'"]+)['"]`);
            const match = inputStr.match(regex);
            if (match && match[1]) {
                config[key] = match[1];
            }
        });
        
        if (config.apiKey && config.projectId) {
            return config;
        }
    }
    return null;
}

var firebaseSyncEnabled = false;
var firebaseDbRef = null;
var isSyncingFromCloud = false;
var isLocalPushing = false;
var localPushTimeout = null;

/**
 * 更新頂部狀態列的雲端同步狀態標籤
 */
function updateSyncStatus(status) {
    const badges = [
        document.getElementById('sync-status-badge'),
        document.getElementById('sync-status-badge-desktop')
    ];
    
    badges.forEach(badge => {
        if (!badge) return;
        if (status === 'connected') {
            badge.textContent = '雲端已連線';
            badge.className = 'sync-badge-green';
        } else if (status === 'error') {
            badge.textContent = '連線失敗';
            badge.className = 'sync-badge-red';
        } else if (status === 'connecting') {
            badge.textContent = '連線中...';
            badge.className = 'sync-badge-yellow';
        } else {
            badge.textContent = '本機儲存';
            badge.className = 'sync-badge-gray';
        }
    });
}

/**
 * 初始化 Firebase 雲端對接同步 (使用 REST API + Database Secret)
 */
function initFirebaseSync() {
    updateSyncStatus('connecting');
    if (typeof downloadFromCloud === 'function') {
        downloadFromCloud().then(data => {
            console.log("Firebase 雲端 REST API 同步成功！");
            updateSyncStatus('connected');
        }).catch(err => {
            console.error("雲端載入數據失敗:", err);
            updateSyncStatus('error');
        });
    } else {
        updateSyncStatus('connected');
    }
}

/**
 * 主動推送至雲端資料庫 (Local -> Cloud)
 */
function pushToCloud() {
    if (typeof scheduleCloudUpload === 'function') {
        scheduleCloudUpload();
    } else if (typeof uploadToCloud === 'function') {
        uploadToCloud();
    }
}

// 啟動時自動初始化雲端同步
function startFirebaseSyncWithRetry() {
    initFirebaseSync();
}

startFirebaseSyncWithRetry();
