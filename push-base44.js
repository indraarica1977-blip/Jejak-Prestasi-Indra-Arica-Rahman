#!/usr/bin/env node

/**
 * Auto-push Base44 Export to GitHub
 * 
 * This script automatically commits and pushes exported data to GitHub.
 * Useful for CI/CD or automated updates.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const GIT_MESSAGE = `Update Base44 data export - ${new Date().toISOString()}`;

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject(error);
      } else {
        resolve(stdout);
      }
    });
  });
}

async function main() {
  try {
    console.log('🔄 Starting auto-push to GitHub...\n');

    // Check if data folder exists
    if (!fs.existsSync(path.join(__dirname, 'data'))) {
      console.error('❌ Error: data/ folder not found. Run export-base44.js first.');
      process.exit(1);
    }

    console.log('📊 Checking git status...');
    const status = await runCommand('git status --porcelain');
    
    if (!status.trim()) {
      console.log('✅ No changes to commit');
      return;
    }

    console.log('📝 Adding files...');
    await runCommand('git add data/');
    console.log('✅ Files added');

    console.log('💾 Committing...');
    await runCommand(`git commit -m "${GIT_MESSAGE}"`);
    console.log('✅ Commit successful');

    console.log('🚀 Pushing to GitHub...');
    await runCommand('git push origin main');
    console.log('✅ Push successful\n');

    console.log('✨ Auto-push complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
