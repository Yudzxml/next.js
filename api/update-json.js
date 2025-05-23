module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { key, phones, action } = req.body;
  const token = process.env.GITHUB_TOKEN;
  const owner = 'Yudzxml';
  const repo = 'Runbot';
  const path = 'ngokntlm.json';

  try {
    const headers = {
      Authorization: `token ${token}`,
      'User-Agent': 'Vercel Function'
    };

    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
    const file = await getRes.json();

    if (!file.content || !file.sha) throw new Error('Gagal membaca file dari GitHub');

    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const json = JSON.parse(content);

    if (key && key.trim()) json.key = key.trim();

    if (!json.number || !Array.isArray(json.number.phone)) {
      json.number = { phone: [] };
    }

    if (action === 'hapus') {
      json.number.phone = json.number.phone.filter(p => !phones.includes(p));
    } else {
      json.number.phone = [...new Set([...json.number.phone, ...phones])];
    }

    const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: action === 'hapus' ? 'Hapus nomor via Vercel API' : 'Update via Vercel API',
        content: updatedContent,
        sha: file.sha
      })
    });

    if (!updateRes.ok) throw new Error('Gagal update file');

    res.status(200).send(action === 'hapus' ? 'Nomor berhasil dihapus!' : 'Berhasil Menambahkan Nomor!');
  } catch (err) {
    console.error('Terjadi error:', err);
    res.status(500).send('Error: ' + err.message);
  }
}