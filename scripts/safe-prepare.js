#!/usr/bin/env node

/**
 * Safe prepare script that handles missing dependencies gracefully during CI/CD
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Check if we're in a CI environment
const isCI = process.env.CI === 'true' || 
             process.env.GITHUB_ACTIONS === 'true' || 
             process.env.CONTINUOUS_INTEGRATION === 'true';

console.log('Running prepare script...');
console.log('Environment:', isCI ? 'CI/CD' : 'Local');

try {
  // Check if the demo/model.js file exists
  const modelPath = path.join(__dirname, '..', 'demo', 'model.js');
  if (!fs.existsSync(modelPath)) {
    console.log('⚠️  demo/model.js not found, skipping model generation');
    process.exit(0);
  }

  // Try to run the model generation
  console.log('Attempting to generate models...');
  execSync('node demo/model.js', { 
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });
  
  console.log('✅ Models generated successfully');
  
} catch (error) {
  console.warn('⚠️  Model generation failed:', error.message);
  
  if (isCI) {
    console.warn('🔄 This is expected during CI/CD publish process');
    console.warn('📦 Continuing with publish...');
    process.exit(0); // Exit successfully to not block the publish
  } else {
    console.error('❌ Model generation failed in local environment');
    console.error('💡 Try running: npm install');
    process.exit(1); // Fail in local environment so developer can fix it
  }
}
