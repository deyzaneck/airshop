/**
 * Upload catalog script
 * Reads table_update.csv and uploads to production API
 */
const fs = require('fs');
const path = require('path');

// Configuration
const API_URL = 'https://airshop-production-b0f8.up.railway.app/api/admin/import-csv';
const CSV_FILE = path.join(__dirname, 'table_update.csv');
const ADMIN_USERNAME = 'admin';
const ADMIN_PASSWORD = 'aircube1001';

async function uploadCatalog() {
    try {
        console.log('[1/3] Reading CSV file...');
        const csvData = fs.readFileSync(CSV_FILE, 'utf-8');
        console.log(`[OK] Read ${csvData.length} bytes`);

        console.log('\n[2/3] Logging in as admin...');
        const loginResponse = await fetch(`${API_URL.replace('/import-csv', '').replace('/admin', '')}/auth/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                username: ADMIN_USERNAME,
                password: ADMIN_PASSWORD
            })
        });

        if (!loginResponse.ok) {
            throw new Error(`Login failed: ${loginResponse.status} ${await loginResponse.text()}`);
        }

        const { access_token } = await loginResponse.json();
        console.log('[OK] Logged in successfully');

        console.log('\n[3/3] Uploading catalog...');
        const importResponse = await fetch(API_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${access_token}`
            },
            body: JSON.stringify({
                csv_data: csvData
            })
        });

        if (!importResponse.ok) {
            const errorText = await importResponse.text();
            throw new Error(`Import failed: ${importResponse.status} ${errorText}`);
        }

        const result = await importResponse.json();
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
