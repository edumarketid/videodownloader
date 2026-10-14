// GANTI DENGAN URL WEB APP GOOGLE APPS SCRIPT MILIKMU
const GAS_WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbwLY-Ku0d-PBfDLoU_7xpoQ4JBg5gMpsYHgIZtQFQlUPpS8uUU_b813dyp2wJwEECvS/exec';

// Register Service Worker
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('./sw.js')
    .then(() => console.log('Service Worker Registered'))
    .catch(err => console.error('SW Registration Failed:', err));
}

// Deferred Install Prompt
let deferredPrompt;
const installBtn = document.getElementById('installBtn');

window.addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault();
  deferredPrompt = e;
  if (installBtn) installBtn.classList.remove('hidden');
});

if (installBtn) {
  installBtn.addEventListener('click', async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        installBtn.classList.add('hidden');
      }
      deferredPrompt = null;
    }
  });
}

// Paste Clipboard Function
const pasteBtn = document.getElementById('pasteBtn');
if (pasteBtn) {
  pasteBtn.addEventListener('click', async () => {
    try {
      const text = await navigator.clipboard.readText();
      document.getElementById('videoUrl').value = text;
    } catch (err) {
      alert('Izin clipboard ditolak atau tidak didukung.');
    }
  });
}

// Main Fetch Logic via Google Apps Script Backend
document.getElementById('fetchBtn').addEventListener('click', async () => {
  const urlInput = document.getElementById('videoUrl').value.trim();
  const loader = document.getElementById('loader');
  const resultCard = document.getElementById('resultCard');
  const errorMsg = document.getElementById('errorMsg');
  const downloadLink = document.getElementById('downloadLink');

  // Reset UI
  resultCard.classList.add('hidden');
  errorMsg.classList.add('hidden');

  if (!urlInput) {
    errorMsg.textContent = 'Masukkan URL video terlebih dahulu!';
    errorMsg.classList.remove('hidden');
    return;
  }

  // Cek koneksi internet
  if (!navigator.onLine) {
    errorMsg.textContent = 'Kamu sedang offline. Periksa koneksi internetmu!';
    errorMsg.classList.remove('hidden');
    return;
  }

  if (GAS_WEB_APP_URL.includes('AKfycbx...')) {
    errorMsg.textContent = 'Ganti GAS_WEB_APP_URL dengan URL Web App milikmu terlebih dahulu!';
    errorMsg.classList.remove('hidden');
    return;
  }

  loader.classList.remove('hidden');

  try {
    // Menggunakan text/plain agar tidak memicu Preflight CORS (OPTIONS request) di browser
    const response = await fetch(GAS_WEB_APP_URL, {
      method: 'POST',
      mode: 'cors',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8'
      },
      body: JSON.stringify({ url: urlInput })
    });

    if (!response.ok) {
      throw new Error(`Server Error: ${response.status}`);
    }

    const data = await response.json();

    if (data.status === 'stream' || data.status === 'redirect') {
      downloadLink.href = data.url;
      resultCard.classList.remove('hidden');
    } else if (data.status === 'picker' && data.picker && data.picker.length > 0) {
      downloadLink.href = data.picker[0].url;
      resultCard.classList.remove('hidden');
    } else if (data.status === 'error') {
      throw new Error(data.text || 'Gagal memproses video.');
    } else {
      throw new Error('Respons dari server tidak dapat dikenali.');
    }

  } catch (err) {
    console.error('Fetch Error:', err);
    errorMsg.textContent = err.message || 'Terjadi kesalahan saat memproses permintaan.';
    errorMsg.classList.remove('hidden');
  } finally {
    loader.classList.add('hidden');
  }
});
