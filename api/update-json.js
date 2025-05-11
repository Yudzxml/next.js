module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { key, phones } = req.body;
  const token = process.env.GITHUB_TOKEN;
  const owner = 'Yudzxml';
  const repo = 'Runbot';
  const path = 'ngokntlm.json';

  try {
    console.log('Token valid:', token ? 'YA' : 'TIDAK'); // Debug token
    const headers = {
      Authorization: `token ${token}`,
      'User-Agent': 'Vercel Function'
    };

    const getRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, { headers });
    const file = await getRes.json();
    console.log('GitHub response:', file);

    if (!file.content || !file.sha) throw new Error('Gagal membaca file dari GitHub');

    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const json = JSON.parse(content);

    if (key && key.trim()) json.key = key.trim();

    json.number.phone = [...new Set([...json.number.phone, ...phones])];

    const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

    const updateRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Update via Vercel API',
        content: updatedContent,
        sha: file.sha
      })
    });

    if (!updateRes.ok) throw new Error('Gagal update file');

    res.status(200).send('Berhasil diupdate!');
  } catch (err) {
    console.error('Terjadi error:', err);
    res.status(500).send('Error: ' + err.message);
  }
}
