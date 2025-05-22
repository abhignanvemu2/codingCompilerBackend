  const express = require('express');
  const axios = require('axios');
  require('dotenv').config();
  const { exec } = require('child_process');
  const { writeFile, mkdir } = require('fs/promises');
  const { join } = require('path');
  const { existsSync } = require('fs');
  const { v4: uuidv4 } = require('uuid');
  const cors = require('cors');


  const app = express();
  const PORT = process.env.PORT || 3001;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Ensure temp directory exists
  const tempDir = join(process.cwd(), 'temp');
  if (!existsSync(tempDir)) {
    mkdir(tempDir, { recursive: true });
  }

  
  
  // Language configurations
  const languageConfigs = {
    javascript: {
      extension: 'js',
      command: 'node',
      timeout: 5000
    },
    typescript: {
      extension: 'ts',
      command: 'npx ts-node',
      timeout: 5000
    },
    python: {
      extension: 'py',
      command: 'python',
      timeout: 5000
    },

    java: { 
      extension: 'java',
      command:  "Java",
      timeout: 1000
    },
    c: {
      extension: 'c',
      command:  "C",
      timeout: 1000
    },
    cpp: {
      extension: 'cpp',
      command:  "C++",
      timeout: 1000
    },
    csharp: {
      extension: 'cs',
      command:  "C#",
      timeout: 1000
    },
    php: {
      extension: 'php',
      command:  "PHP",
      timeout: 1000
    },
    ruby: {
      extension: 'rb',
      command:  "Ruby",
      timeout: 1000
    },
    go: {
      extension: 'go',
      command:  "Go",
      timeout: 1000
    },
    rust: {
      extension: 'rs',
      command:  "Rust",
      timeout: 1000
    }
  };

  // Execute code endpoint
  app.post('/api/execute', async (req, res) => {
    const { code, language } = req.body;
    
    if (!code || !language) {
      return res.status(400).json({ error: 'Code and language are required' });
    }
    
    const config = languageConfigs[language];
    
    if (!config) {
      return res.status(400).json({ error: 'Unsupported language' });
    }

    
    
    try {
      // Create a unique file for the code
      const fileId = uuidv4();
      const filename = `${fileId}.${config.extension}`;
      const filepath = join(tempDir, filename);
      
      // Write code to file
      await writeFile(filepath, code);
      
      const execCommand = typeof config.command === 'function'
    ? config.command(fileId, filename)
    : `${config.command} ${filename}`;
      // Execute the code
      exec(`cd ${tempDir} && ${execCommand} ${filename}`, { timeout: config.timeout }, (error, stdout, stderr) => {
        console.log("error:----", error);

        console.log('stdout:', stdout);
        // Return the result
        res.json({
          output: stdout || '',
          error: stderr || (error ? error.message : null)
        });
      });
    } catch (error) {
      console.error('Error executing code:', error);
      res.status(500).json({ error: 'Failed to execute code' });
    }
  });

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok' });
  });

  // Start the server
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });