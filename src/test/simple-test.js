#!/usr/bin/env node

const { spawn } = require('child_process');
const path = require('path');

function runSimpleTest() {
  console.log('🧪 Running Payment Service Tests...\n');
  
  const mochaPath = path.join(__dirname, '../../node_modules/.bin/mocha');
  const isWindows = process.platform === 'win32';
  const mochaCommand = isWindows ? `${mochaPath}.cmd` : mochaPath;
  
  const fs = require('fs');
  if (!fs.existsSync(mochaCommand)) {
    console.error('❌ Mocha not found. Please install dependencies first:');
    console.error('   npm install');
    process.exit(1);
  }

  const testProcess = spawn(mochaCommand, [
    '--timeout', '10000',
    '--reporter', 'spec',
    path.join(__dirname, 'basic.test.js'),
    path.join(__dirname, 'working.test.js')
  ], {
    stdio: 'inherit',
    cwd: path.join(__dirname, '../..')
  });

  testProcess.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ All tests passed!');
    } else {
      console.log(`\n❌ Tests failed with code ${code}`);
      process.exit(code);
    }
  });

  testProcess.on('error', (error) => {
    console.error('❌ Failed to run tests:', error.message);
    process.exit(1);
  });
}

if (require.main === module) {
  runSimpleTest();
}

module.exports = { runSimpleTest };
