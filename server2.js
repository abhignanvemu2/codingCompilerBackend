const express = require('express');
const axios = require('axios');
require('dotenv').config();

const router = express.Router();

router.post('/', async (req, res) => {
  const { code, language, input } = req.body;

  const jdoodleLanguages = {
    javascript: { language: 'nodejs', versionIndex: '4' },
    python: { language: 'python3', versionIndex: '4' },
    cpp: { language: 'cpp17', versionIndex: '0' },
    java: { language: 'java', versionIndex: '4' },
    c: { language: 'c', versionIndex: '5' },
    php: { language: 'php', versionIndex: '3' },
    ruby: { language: 'ruby', versionIndex: '3' },
    go: { language: 'go', versionIndex: '3' },
    swift: { language: 'swift', versionIndex: '4' },
    rust: { language: 'rust', versionIndex: '4' }
  };

  const config = jdoodleLanguages[language.toLowerCase()];
  if (!config) {
    return res.status(400).json({ error: 'Unsupported language' });
  }

  try {
    const response = await axios.post(process.env.JDOODLE_API, {
      script: code,
      stdin: input || '',
      language: config.language,
      versionIndex: config.versionIndex,
      clientId: process.env.JDOODLE_CLIENT_ID,
      clientSecret: process.env.JDOODLE_CLIENT_SECRET
    });

    res.json({ output: response.data.output, error: '' });
  } catch (err) {
    res.status(500).json({ output: '', error: err.message });
  }
});

module.exports = router;
