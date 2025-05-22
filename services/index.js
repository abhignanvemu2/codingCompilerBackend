const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const { v4: uuid } = require('uuid');

const tempDir = path.join(__dirname, '../temp');

if (!fs.existsSync(tempDir)) {
  fs.mkdirSync(tempDir);
}

const languageConfigs = {
  python: {
    extension: '.py',
    image: 'python:3.10',
    cmd: (filename) => `python ${filename}`
  },
  javascript: {
    extension: '.js',
    image: 'node:18',
    cmd: (filename) => `node ${filename}`
  },
  cpp: {
    extension: '.cpp',
    image: 'gcc:latest',
    cmd: (filename) => `g++ ${filename} -o /app/a.out && ./a.out`
  },
  java: {
    extension: '.java',
    image: 'openjdk:17',
    cmd: (filename) => `javac ${filename} && java ${path.basename(filename, '.java')}`
  }
};

module.exports = async function executeCode(language, code, input) {
  const config = languageConfigs[language];

  if (!config) {
    throw new Error(`Language ${language} not supported`);
  }

  const jobId = uuid();
  const filename = `${jobId}${config.extension}`;
  const filePath = path.join(tempDir, filename);
  fs.writeFileSync(filePath, code);

  const dockerCommand = `
    docker run --rm -m 256m --network none \
    -v ${filePath}:/app/${filename} \
    -w /app ${config.image} \
    sh -c "${config.cmd(filename)}"
  `;

  return new Promise((resolve, reject) => {
    exec(dockerCommand, { timeout: 5000 }, (err, stdout, stderr) => {
      fs.unlinkSync(filePath); // Clean up

      if (err) {
        return reject(stderr || err.message);
      }

      resolve({ output: stdout, error: stderr });
    });
  });
};
