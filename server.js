require('dotenv').config();
const express = require('express');
const fetch = require('node-fetch');
const bodyParser = require('body-parser');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.static('public'));
app.use(bodyParser.json());

app.post('/api/update-json', async (req, res) => {
  const { key, phones } = req.body;
  const token = process.env.GITHUB_TOKEN;
  const owner = 'Yudzxml';
  const repo = 'Runbot';
  const path = 'ngokkntlm.json';

  if (!token) return res.status(500).send('GITHUB_TOKEN belum disetel di .env');

  try {
    const headers = { Authorization: \`token \${token}\`, 'User-Agent': 'Node.js App' };
    const getRes = await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/contents/\${path}\`, { headers });
    const file = await getRes.json();

    if (!file.content || !file.sha) throw new Error('Gagal membaca file dari GitHub');

    const content = Buffer.from(file.content, 'base64').toString('utf-8');
    const json = JSON.parse(content);

    if (key && key.trim()) {
      json.key = key.trim();
    }

    json.number.phone = [...new Set([...json.number.phone, ...phones])];

    const updatedContent = Buffer.from(JSON.stringify(json, null, 2)).toString('base64');

    const updateRes = await fetch(\`https://api.github.com/repos/\${owner}/\${repo}/contents/\${path}\`, {
      method: 'PUT',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Update via simple web form',
        content: updatedContent,
        sha: file.sha
      })
    });

    if (!updateRes.ok) {
      const err = await updateRes.json();
      throw new Error(err.message || 'Gagal update file');
    }

    res.send('Berhasil diupdate!');
  } catch (err) {
    res.status(500).send('Error: ' + err.message);
  }
});

app.listen(PORT, () => console.log(\`Server running on http://localhost:\${PORT}\`));
