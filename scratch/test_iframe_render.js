const puppeteer = require('puppeteer');
const fs = require('fs');

const html = `
<!DOCTYPE html>
<html>
<head>
<meta name="referrer" content="no-referrer">
</head>
<body>
<iframe src="https://hdfilmcehennemi.mobi/video/embed/pxvp89NbhOV/?rapidrame_id=0v4koswo623p" width="800" height="600"></iframe>
</body>
</html>
`;
fs.writeFileSync('scratch/test_iframe.html', html);

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    
    page.on('console', msg => console.log('PAGE LOG:', msg.text()));
    page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
    page.on('response', response => {
        if (response.url().includes('hdfilmcehennemi.mobi')) {
            console.log("Response headers for mobi:", response.headers());
        }
    });

    console.log("Loading test HTML...");
    await page.goto('file://' + __dirname + '/scratch/test_iframe.html', { waitUntil: 'networkidle2' });
    
    await browser.close();
})();
