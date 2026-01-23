const { spawn } = require('child_process');
const path = require('path');

async function runTests() {
  console.log('🚀 Running tests with custom runner...\n');

  console.log('📋 Running Unit Tests...');
  try {
    await runCommand('node', ['node_modules/.bin/jest', 'tests/unit', '--passWithNoTests']);
    console.log('✅ Unit tests completed\n');
  } catch (error) {
    console.log('❌ Unit tests failed\n');
  }

  console.log('🔗 Running Integration Tests...');
  try {
    await runCommand('node', ['node_modules/.bin/jest', 'tests/integration/userRoutes.test.js', '--passWithNoTests']);
    console.log('✅ Integration tests completed\n');
  } catch (error) {
    console.log('❌ Integration tests failed\n');
  }

  console.log('🌐 Running API E2E Tests...');
  try {
    await runCommand('node', ['node_modules/.bin/jest', 'tests/integration/api-e2e.test.js', '--passWithNoTests']);
    console.log('✅ API E2E tests completed\n');
  } catch (error) {
    console.log('❌ API E2E tests failed\n');
  }

  console.log('🖥️  Running Browser E2E Tests...');
  try {
    await runCommand('npx', ['playwright', 'test', 'tests/playwright/browser-e2e.spec.js']);
    console.log('✅ Browser E2E tests completed\n');
  } catch (error) {
    console.log('❌ Browser E2E tests failed\n');
  }

  console.log('🎯 Test run completed!');
}

function runCommand(command, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', (error) => {
      reject(error);
    });
  });
}

if (require.main === module) {
  runTests().catch(console.error);
}

module.exports = { runTests };
