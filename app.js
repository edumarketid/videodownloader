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
  installBtn.classList.remove('hidden');
});

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

// Paste Clipboard Function
document.getElementById('pasteBtn').addEventListener('click', async () => {
  try {
    const text = await navigator.clipboard.readText();
    document.getElementById('videoUrl').value = text;
  } catch (err) {
    alert('Izin clipboard ditolak atau tidak didukung.');
  }
});

// Fetch Video Logic (Menggunakan Public Cobalt Instance)
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

  loader.classList.remove('hidden');

  try {
    // Menggunakan Endpoint Public API Cobalt
    const response = await fetch('https://api.cobalt.tools/api/json', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url: urlInput,
        vCodec: 'h264',
        vQuality: '720'
      })
    });

    const data = await response.json();

    if (data.status === 'stream' || data.status === 'redirect') {
      downloadLink.href = data.url;
      resultCard.classList.remove('hidden');
    } else if (data.status === 'picker') {
      // Jika ada beberapa opsi (misal playlist/carousel)
      downloadLink.href = data.picker[0].url;
      resultCard.classList.remove('hidden');
    } else {
      throw new Error(data.text || 'Gagal memproses video.');
    }
  } catch (err) {
    errorMsg.textContent = err.message || 'Terjadi kesalahan saat menghubungi server.';
    errorMsg.classList.remove('hidden');
  } finally {
    loader.classList.add('hidden');
  }
});