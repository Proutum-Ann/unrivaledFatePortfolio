// Replace 'YOUR_SPREADSHEET_ID' with your actual Google Sheets ID
// To get the ID: Open your Google Sheet, the ID is in the URL between /d/ and /edit
// Publish the sheet to the web: File > Share > Publish to web > CSV
const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRLZ80ja400-a5IMHaHbOCsmL1l-OYMgxIXQfwQ3dWOdxFrRJXUK-uWTjZMyW_JS3HECkdj-POxaSuF/pub?output=csv';

const { createApp } = Vue;

createApp({
    data() {
        return {
            items: [],
            loading: true,
            error: null
        };
    },
    mounted() {
        fetch(sheetUrl)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch data from Google Sheets');
                }
                return response.text();
            })
            .then(csvText => {
                // Simple CSV parser (for basic CSV without quotes/commas in fields)
                const rows = csvText.trim().split('\n');
                if (rows.length < 2) {
                    throw new Error('No data found in the sheet');
                }
                const headers = rows[0].split(',').map(h => h.trim());
                const dataRows = rows.slice(1).map(row => row.split(',').map(cell => cell.trim()));
                
                // Assuming the sheet has columns, and we want each row as an object for Vue binding
                this.items = dataRows.map(row => {
                    let obj = {};
                    headers.forEach((header, index) => {
                        obj[header] = row[index] || '';
                    });
                    return obj;
                });
                
                this.loading = false;
            })
            .catch(err => {
                this.error = err.message;
                this.loading = false;
            });
    }
}).mount('#app');