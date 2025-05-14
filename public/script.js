const hardcodedUsername = "Yudzxml";
const hardcodedPassword = "@Yudzxml1122";

window.onload = function () {
  const isLoggedIn = localStorage.getItem("loggedIn");
  if (isLoggedIn === "true") {
    showMain();
  } else {
    showLogin();
  }
};

function login() {
  const username = document.getElementById("username").value.trim();
  const password = document.getElementById("password").value.trim();

  if (username === hardcodedUsername && password === hardcodedPassword) {
    localStorage.setItem("loggedIn", "true");
    showMain();
  } else {
    document.getElementById("loginStatus").textContent = "Username atau password salah!";
  }
}

function showMain() {
  document.getElementById("loginContainer").style.display = "none";
  document.getElementById("mainContent").style.display = "block";
}

function showLogin() {
  document.getElementById("loginContainer").style.display = "block";
  document.getElementById("mainContent").style.display = "none";
}

// Tambah nomor
document.getElementById('updateForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const key = document.getElementById('key').value.trim();
  const phones = document.getElementById('phones').value.trim();
  const status = document.getElementById('status');
  status.textContent = 'Memproses...';

  const body = {
    phones: phones.split(',').map(p => p.trim()).filter(p => p)
  };
  if (key) body.key = key;

  try {
    const res = await fetch('/api/update-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const text = await res.text();
    status.textContent = text;
  } catch (err) {
    status.textContent = 'Terjadi kesalahan: ' + err.message;
  }
});

// Hapus nomor
document.getElementById('hapusForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  const phones = document.getElementById('hapusPhones').value.trim();
  const status = document.getElementById('status');
  status.textContent = 'Memproses penghapusan...';

  try {
    const res = await fetch('/api/update-json', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'hapus',
        phones: phones.split(',').map(p => p.trim()).filter(p => p)
      })
    });

    const text = await res.text();
    status.textContent = text;
  } catch (err) {
    status.textContent = 'Terjadi kesalahan: ' + err.message;
  }
});