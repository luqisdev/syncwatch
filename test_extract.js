const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: "new", args: ['--no-sandbox'] });
    const page = await browser.newPage();
    
    // Test the setplay url we got earlier
    const url = "https://setplay.shop/player/?t=8eW_mQPl7Vu0dLdPBRdBwPJCHNyQYpmM7KDIxTI0KXIAUv40scnuC39ZyWUBmRxtTfCBj9MZADmCnMAGBDDrHC8zll3yvBmhvctvdtIabkw.3TJrg0EsUrV-DxNEQc_HM7ypCXcBhKTuaMacUi_sCE0";
    
    let mediaUrls = [];
    
    await page.setRequestInterception(true);
    page.on('request', request => {
        const reqUrl = request.url();
        if (reqUrl.includes('.m3u8') || reqUrl.includes('.mp4')) {
            mediaUrls.push(reqUrl);
        }
        request.continue();
    });

    console.log("Navigating to player url...");
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 15000 }).catch(e => console.log(e.message));
    
    console.log("Clicking play inside the iframe to trigger video load if needed...");
    try {
        await page.mouse.click(400, 300); // generic click in the middle to start video/dismiss ad
        await new Promise(r => setTimeout(r, 3000));
        await page.mouse.click(400, 300);
        await new Promise(r => setTimeout(r, 3000));
    } catch(e) {}
    
    console.log("Media URLs found:", mediaUrls);
    await browser.close();
})();
