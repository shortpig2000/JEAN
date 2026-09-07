/**
 * sync.js — Firebase Realtime Database 雲端同步模組
 * 使用 REST API，不需要 SDK，只需資料庫 URL
 */

const FIREBASE_DB_URL = 'https://jean-breakfast-default-rtdb.firebaseio.com';
const FIREBASE_PATH   = '/baozi-data';
const FIREBASE_SECRET = 'W0IDCTDBafaAIhvQEyUyH5qIZLD06tFqfShPXCbi';

function getDbEndpoint() {
    return `${FIREBASE_DB_URL}${FIREBASE_PATH}.json?auth=${FIREBASE_SECRET}`;
}

let isSyncing    = false;
let syncTimeout  = null;

/* ─────────────────────────────
   上傳到雲端
───────────────────────────── */
async function uploadToCloud() {
    if (isSyncing) return;
    isSyncing = true;
    setSyncUI('syncing');

    try {
        const payload = {
            records:     getAllRecords(),
            settings:    getSettings(),
            lastUpdated: new Date().toISOString()
        };

        const res = await fetch(getDbEndpoint(), {
            method:  'PUT',
            headers: { 'Content-Type': 'application/json' },
            body:    JSON.stringify(payload)
        });

        if (res.ok) {
            const now = new Date().toISOString();
            localStorage.setItem('lastSyncTime', now);
            setSyncUI('success', now);
            if (typeof updateSyncStatus === 'function') updateSyncStatus('connected');
        } else {
            const errText = await res.text().catch(() => '');
            console.error('[Sync] 上傳失敗 HTTP:', res.status, errText);
            setSyncUI('error', null, `HTTP ${res.status}`);
            if (typeof updateSyncStatus === 'function') updateSyncStatus('error');
        }
    } catch (e) {
        console.error('[Sync] 上傳失敗:', e);
        setSyncUI('error', null, e.message || '網路失敗');
        if (typeof updateSyncStatus === 'function') updateSyncStatus('error');
    } finally {
        isSyncing = false;
    }
}

/* ─────────────────────────────
   從雲端下載（開啟時同步）
───────────────────────────── */
async function downloadFromCloud() {
    setSyncUI('syncing');
    if (typeof updateSyncStatus === 'function') updateSyncStatus('connecting');
    try {
        const res = await fetch(getDbEndpoint());
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            throw new Error(`HTTP ${res.status} ${errText}`);
        }

        const data = await res.json();
        if (!data) {
            setSyncUI('success', new Date().toISOString());
            if (typeof updateSyncStatus === 'function') updateSyncStatus('connected');
            return null;
        }

        // 以雲端資料為準更新本地 (比對是否有異動，避免無謂重繪)
        let hasChanges = false;
        if (data.records && typeof data.records === 'object') {
            const key = typeof DB_KEYS !== 'undefined' ? DB_KEYS.RECORDS : 'jean_breakfast_records_multi_shift_items';
            const localStr = localStorage.getItem(key) || '';
            const cloudStr = JSON.stringify(data.records);
            if (localStr !== cloudStr) {
                localStorage.setItem(key, cloudStr);
                hasChanges = true;
            }
        }
        if (data.settings && typeof data.settings === 'object') {
            const key = typeof DB_KEYS !== 'undefined' ? DB_KEYS.SETTINGS : 'jean_breakfast_settings_multi_shift';
            const localStr = localStorage.getItem(key) || '';
            const cloudStr = JSON.stringify(data.settings);
            if (localStr !== cloudStr) {
                localStorage.setItem(key, cloudStr);
                hasChanges = true;
            }
        }

        const now = new Date().toISOString();
        localStorage.setItem('lastSyncTime', now);
        setSyncUI('success', data.lastUpdated || now);
        if (typeof updateSyncStatus === 'function') updateSyncStatus('connected');
        if (hasChanges && typeof refreshAppState === 'function') refreshAppState();
        return data;
    } catch (e) {
        console.error('[Sync] 下載失敗:', e);
        setSyncUI('error', null, e.message || '網路失敗');
        if (typeof updateSyncStatus === 'function') updateSyncStatus('error');
        return null;
    }
}

/* ─────────────────────────────
   延遲上傳（每次存檔後 2 秒再同步，避免頻繁請求）
───────────────────────────── */
function scheduleCloudUpload() {
    if (syncTimeout) clearTimeout(syncTimeout);
    syncTimeout = setTimeout(() => uploadToCloud(), 1500);
}

/* ─────────────────────────────
   更新 UI 狀態顯示
───────────────────────────── */
function setSyncUI(status, timeIso, errorMsg) {
    const dot  = document.getElementById('cloud-sync-indicator');
    const text = document.getElementById('cloud-sync-text');
    const time = document.getElementById('last-sync-time');

    if (!dot || !text) return;

    if (status === 'syncing') {
        dot.className  = 'status-indicator syncing';
        text.textContent = '同步中…';
    } else if (status === 'success') {
        dot.className  = 'status-indicator online';
        text.textContent = '雲端已同步';
        if (time && timeIso) {
            const d = new Date(timeIso);
            time.textContent = d.toLocaleString('zh-TW', {
                month: '2-digit', day: '2-digit',
                hour: '2-digit', minute: '2-digit'
            });
        }
    } else {
        dot.className  = 'status-indicator offline';
        text.textContent = errorMsg ? `同步失敗 (${errorMsg})` : '同步失敗（請確認網路）';
    }
}

/* ─────────────────────────────
   初始化：顯示上次同步時間
───────────────────────────── */
function initSyncUI() {
    const saved = localStorage.getItem('lastSyncTime');
    if (saved) {
        const d = new Date(saved);
        setSyncUI('success', saved);
    } else {
        const dot  = document.getElementById('cloud-sync-indicator');
        const text = document.getElementById('cloud-sync-text');
        if (dot)  dot.className  = 'status-indicator offline';
        if (text) text.textContent = '尚未同步';
    }
}

/* ─────────────────────────────
   自動背景同步 (電腦與手機雙向即時對接)
───────────────────────────── */
function startAutoSync() {
    // 1. 每 10 秒自動檢查一次雲端資料
    setInterval(() => {
        if (!document.hidden && !isSyncing) {
            downloadFromCloud();
        }
    }, 10000);

    // 2. 切換回網頁分頁或解鎖手機螢幕時，立刻自動同步
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !isSyncing) {
            downloadFromCloud();
        }
    });
    window.addEventListener('focus', () => {
        if (!isSyncing) {
            downloadFromCloud();
        }
    });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startAutoSync);
} else {
    startAutoSync();
}
