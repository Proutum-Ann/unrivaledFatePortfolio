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
    methods: {
        // This method tries to find an image URL in the item object by checking common image-related keys
        getImageUrl(item) {
            const imageKeys = new Set(['image', 'img', 'picture', 'photo', 'imageurl', 'image_url', 'thumb', 'thumbnail', 'poster', 'avatar', 'profilepicture', 'profile_picture']);
            for (const [key, value] of Object.entries(item)) {
                if (!value || typeof value !== 'string') continue;
                const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
                if (imageKeys.has(normalizedKey)) {
                    return value;
                }
            }
            // Fallback: return first URL-like image string
            for (const value of Object.values(item)) {
                if (typeof value === 'string' && value.match(/https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
                    return value;
                }
            }
            return '';
        },
        getVideoUrl(item) {
            const videoKeys = new Set(['video', 'vid', 'animation', 'animationurl', 'animation_url', 'gifurl', 'gif_url', 'gif', 'vfx']);
            for (const [key, value] of Object.entries(item)) {
                if (!value || typeof value !== 'string') continue;
                const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
                if (videoKeys.has(normalizedKey)) {
                    return value;
                }
            }
            // Fallback: return first URL-like video string
            for (const value of Object.values(item)) {
                if (typeof value === 'string' && value.match(/https?:\/\/.*\.(mp4|webm|gif|mov)(\?.*)?$/i)) {
                    return value;
                }
            }
            return '';
        }
    },
    mounted() {
        // Fetch the CSV data from the Google Sheets URL and parse it into an array of objects for Vue to use
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