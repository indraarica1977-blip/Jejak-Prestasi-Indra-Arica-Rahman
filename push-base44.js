#!/usr/bin/env node

/**
 * Auto-push Base44 Export to GitHub
 *
 * Usage:
 *   node push-base44.js
 *
 * This script checks for any local changes, stages them, commits, and pushes
 * the repository to GitHub. It is designed to work reliably from the repo root.
 */

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

const GIT_MESSAGE = `Update Base44 data export - ${new Date().toISOString()}`;

function runCommand(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        const details = stderr ? stderr.trim() : error.message;
        reject(new Error(details || error.message));
      } else {
        resolve((stdout || '').trim());
      }
    });
  });
}

async function ensureGitIdentity() {
  try {
    const email = await runCommand('git config --global user.email');
    const name = await runCommand('git config --global user.name');

    if (!email || !name) {
      console.log('⚠️ Git identity is not configured.');
      console.log('Run this once in PowerShell:');
      console.log('git config --global user.email "indraarica1977@gmail.com"');
      console.log('git config --global user.name "indra arica"');
      process.exit(1);
    }
  } catch (error) {
    console.log('⚠️ Could not read git config.');
    console.log('Run this once in PowerShell:');
    console.log('git config --global user.email "indraarica1977@gmail.com"');
    console.log('git config --global user.name "indra arica"');
    process.exit(1);
  }
}

async function main() {
  try {
    console.log('🔄 Starting auto-push to GitHub...\n');

    // Ensure repository exists and there is a data folder
    const repoRoot = process.cwd();
    if (!fs.existsSync(path.join(repoRoot, 'data'))) {
      console.error('❌ Error: data/ folder not found. Run export-base44.js first.');
      process.exit(1);
    }

    // Check for git repo
    try {
      await runCommand('git rev-parse --is-inside-work-tree');
    } catch (error) {
      console.error('❌ Error: this folder is not a git repository.');
      process.exit(1);
    }

    await ensureGitIdentity();

    console.log('📊 Checking git status...');
    const status = await runCommand('git status --porcelain');

    if (!status.trim()) {
      console.log('✅ No changes to commit');
      return;
    }

    console.log('📝 Adding files...');
    await runCommand('git add .');
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
    console.log('\nIf this is an identity issue, run:');
    console.log('git config --global user.email "indraarica1977@gmail.com"');
    console.log('git config --global user.name "indra arica"');
    process.exit(1);
  }
}

main();
