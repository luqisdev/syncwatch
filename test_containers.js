const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto('https://www.fullhdfilmizle.mom/saplanti-izle/', { waitUntil: 'networkidle2' });
    
    // Find anything that looks like a player container
    const containers = await page.evaluate(() => {
        const els = document.querySelectorAll('.player, #player, .video-container, .play-icon, .play-btn, .btn-play, .video-cover, .movie-player, .keremiya_part');
        return Array.from(els).map(el => el.outerHTML);
    });
    
    fs.writeFileSync('containers.json', JSON.stringify(containers, null, 2));
    await browser.close();
})();
