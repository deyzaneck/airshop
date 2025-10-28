/**
 * Upload catalog script
 * Reads table_update.csv and uploads to production API
 */
const fs = require('fs');
const path = require('path');
const https = require('https');

// Configuration
const API_BASE = 'airshop-production-b0f8.up.railway.app';
const CSV_FILE = path.join(__dirname, 'table_update.csv');
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'aircube1001';

function httpsRequest(options, postData) {
    return new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve(data);
                    }
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });
        req.on('error', reject);
        if (postData) {
            req.write(postData);
        }
        req.end();
    });
}

async function uploadCatalog() {
    try {
        console.log('[1/3] Reading CSV file...');
        const csvData = fs.readFileSync(CSV_FILE, 'utf-8');
        console.log(`[OK] Read ${csvData.length} bytes`);

        console.log('\n[2/3] Logging in as admin...');
        const loginData = JSON.stringify({
            username: ADMIN_USERNAME,
            password: ADMIN_PASSWORD
        });

        const loginOptions = {
            hostname: API_BASE,
            port: 443,
            path: '/api/auth/login',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(loginData)
            }
        };

        const loginResult = await httpsRequest(loginOptions, loginData);
        const token = loginResult.access_token;
        console.log('[OK] Logged in successfully');

        console.log('\n[3/3] Uploading catalog...');
        const importData = JSON.stringify({
            csv_data: csvData
        });

        const importOptions = {
            hostname: API_BASE,
            port: 443,
            path: '/api/admin/import-csv',
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                'Content-Length': Buffer.byteLength(importData)
            }
        };

        const result = await httpsRequest(importOptions, importData);
        console.log('[SUCCESS] Catalog uploaded!');
        console.log(`- Imported: ${result.imported} products`);
        if (result.errors && result.errors.length > 0) {
            console.log(`- Errors: ${result.errors.length}`);
            result.errors.forEach(err => {
                console.log(`  Row ${err.row}: ${err.error}`);
            });
        }

    } catch (error) {
        console.error('[ERROR]', error.message);
        process.exit(1);
    }
}

// Run
uploadCatalog();
