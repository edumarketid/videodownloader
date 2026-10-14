document.getElementById('fetchBtn').addEventListener('click', async () => {
  const urlInput = document.getElementById('videoUrl').value.trim();
  const loader = document.getElementById('loader');
  const resultCard = document.getElementById('resultCard');
  const errorMsg = document.getElementById('errorMsg');
  const downloadLink = document.getElementById('downloadLink');

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

  loader.classList.remove('hidden');

  // Daftar instance Cobalt untuk fallback jika utama gagal/CORS blocked
  const apiInstances = [
    'https://api.cobalt.tools/api/json',
    'https://cobalt-api.kwi.im/api/json'
  ];

  let success = false;

  for (const apiUrl of apiInstances) {
    try {
      const response = await fetch(apiUrl, {
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

      if (!response.ok) continue;

      const data = await response.json();

      if (data.status === 'stream' || data.status === 'redirect') {
        downloadLink.href = data.url;
        resultCard.classList.remove('hidden');
        success = true;
        break;
      } else if (data.status === 'picker') {
        downloadLink.href = data.picker[0].url;
        resultCard.classList.remove('hidden');
        success = true;
        break;
      }
    } catch (err) {
      console.warn(`Gagal terhubung ke ${apiUrl}:`, err);
    }
  }

  if (!success) {
    errorMsg.textContent = 'Gagal memproses video. Pastikan tautan valid atau coba beberapa saat lagi (CORS / Server Limit).';
    errorMsg.classList.remove('hidden');
  }

  loader.classList.add('hidden');
});
