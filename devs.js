const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRLZ80ja400-a5IMHaHbOCsmL1l-OYMgxIXQfwQ3dWOdxFrRJXUK-uWTjZMyW_JS3HECkdj-POxaSuF/pub?output=csv&gid=1839330620';

const { createApp } = Vue;

createApp({
    data() {
        return {
            items: [],
            loading: true,
            error: null,
            selectedIndex: 0
        };
    },
    computed: {
        selectedItem() {
            return this.selectedIndex !== null && this.items[this.selectedIndex] ? this.items[this.selectedIndex] : null;
        },
        profileImage() {
            return this.getProfileImageUrl(this.selectedItem);
        }
    },
    methods: {
        selectDeveloper(index) {
            this.selectedIndex = index;
        },
        getImageUrl(item) {
            const imageKeys = new Set(['image', 'img', 'picture', 'photo', 'imageurl', 'image_url', 'thumb', 'thumbnail', 'poster', 'avatar', 'profilepicture', 'profile_picture']);
            for (const [key, value] of Object.entries(item)) {
                if (!value || typeof value !== 'string') continue;
                const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
                if (imageKeys.has(normalizedKey)) {
                    return value;
                }
            }
            for (const value of Object.values(item)) {
                if (typeof value === 'string' && value.match(/https?:\/\/.*\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
                    return value;
                }
            }
            return '';
        },
        getProfileImageUrl(item) {
            if (!item) return '';
            const profileKeys = new Set(['profilepicture', 'profile_picture', 'profileimage', 'profile_image', 'picture', 'avatar', 'photo']);
            for (const [key, value] of Object.entries(item)) {
                if (!value || typeof value !== 'string') continue;
                const normalizedKey = key.toLowerCase().replace(/[-_\s]/g, '');
                if (profileKeys.has(normalizedKey)) {
                    return value;
                }
            }
            return this.getImageUrl(item);
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
                        let key = header || `column_${index}`;
                        if (key in obj) {
                            let suffix = 1;
                            while (`${key}_${suffix}` in obj) {
                                suffix += 1;
                            }
                            key = `${key}_${suffix}`;
                        }
                        obj[key] = row[index] || '';
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