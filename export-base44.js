#!/usr/bin/env node

/**
 * Export Base44 App Data to JSON and Markdown
 * 
 * Usage:
 *   BASE44_TOKEN=your_token node export-base44.js
 * 
 * This script fetches all data from Base44 entities and saves as JSON files.
 */

const fs = require('fs');
const path = require('path');

// Configuration
const BASE44_APP_ID = '6ab34ccd78772fbe289647be';
const BASE44_API_URL = 'https://indra-arica.base44.app/api';
const TOKEN = process.env.BASE44_TOKEN;

// Entities to export
const ENTITIES = [
  'SiteSetting',
  'Karya',
  'Catatan',
  'Timeline',
  'Penghargaan',
  'Sertifikasi',
  'User'
];

// Ensure token exists
if (!TOKEN) {
  console.error('❌ Error: BASE44_TOKEN environment variable not set');
  console.error('Usage: BASE44_TOKEN=your_token node export-base44.js');
  process.exit(1);
}

/**
 * Fetch data from Base44 API
 */
async function fetchEntity(entityName) {
  try {
    console.log(`📥 Fetching ${entityName}...`);
    
    const response = await fetch(`${BASE44_API_URL}/entities/${entityName}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`✅ ${entityName}: ${Array.isArray(data) ? data.length : 1} record(s)`);
    return data;
  } catch (error) {
    console.error(`❌ Error fetching ${entityName}:`, error.message);
    return null;
  }
}

/**
 * Save data to JSON file
 */
function saveJSON(entityName, data) {
  const dir = path.join(__dirname, 'data');
  
  // Create data directory if not exists
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  const filename = path.join(dir, `${entityName}.json`);
  fs.writeFileSync(filename, JSON.stringify(data, null, 2));
  console.log(`💾 Saved: data/${entityName}.json`);
}

/**
 * Convert entity data to Markdown
 */
function generateMarkdown(entityName, data) {
  let md = `# ${entityName}\n\n`;
  
  if (!Array.isArray(data)) {
    data = [data];
  }

  if (data.length === 0) {
    md += '*No records found*\n';
    return md;
  }

  // Create table from first record
  const firstRecord = data[0];
  const keys = Object.keys(firstRecord).filter(k => !['id', 'created_by_id'].includes(k));
  
  // Table header
  md += '| ' + keys.join(' | ') + ' |\n';
  md += '| ' + keys.map(() => '---').join(' | ') + ' |\n';
  
  // Table rows
  data.forEach(record => {
    const values = keys.map(key => {
      const val = record[key];
      if (val === null || val === undefined) return '';
      if (typeof val === 'object') return JSON.stringify(val).substring(0, 30);
      return String(val).substring(0, 50);
    });
    md += '| ' + values.join(' | ') + ' |\n';
  });

  md += '\n';
  return md;
}

/**
 * Main export function
 */
async function main() {
  console.log('🚀 Starting Base44 data export...\n');
  console.log(`📌 App ID: ${BASE44_APP_ID}`);
  console.log(`🔑 Using token: ${TOKEN.substring(0, 10)}...${TOKEN.substring(TOKEN.length - 5)}\n`);

  const allData = {};
  let markdown = '# Jejak Prestasi Indra Arica Rahman\n\n';
  markdown += 'Exported from Base44 App\n\n';
  markdown += '---\n\n';

  // Fetch all entities
  for (const entity of ENTITIES) {
    const data = await fetchEntity(entity);
    if (data !== null) {
      allData[entity] = data;
      saveJSON(entity, data);
      markdown += generateMarkdown(entity, data);
    }
  }

  // Save combined JSON
  const dataDir = path.join(__dirname, 'data');
  const allDataPath = path.join(dataDir, '_all.json');
  fs.writeFileSync(allDataPath, JSON.stringify(allData, null, 2));
  console.log(`💾 Saved: data/_all.json`);

  // Save markdown
  const markdownPath = path.join(dataDir, 'EXPORT.md');
  fs.writeFileSync(markdownPath, markdown);
  console.log(`💾 Saved: data/EXPORT.md`);

  console.log('\n✨ Export complete!');
  console.log('📂 Check the "data/" directory for exported files.\n');
}

// Run
main().catch(console.error);
