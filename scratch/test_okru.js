const https = require('https');

const query = encodeURIComponent("Inception türkçe dublaj");
const url = `https://ok.ru/video/search?st.search=${query}`;

https.get(url, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        // Find video links: /video/123456789
        const regex = /href="\/video\/(\d+)"/g;
        let match;
        const ids = new Set();
        while ((match = regex.exec(data)) !== null) {
            ids.add(match[1]);
        }
        console.log("Found OK.ru Video IDs:", Array.from(ids));
    });
}).on('error', (e) => {
    console.error(e);
});
