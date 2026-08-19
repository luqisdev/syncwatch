const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    let mp4Link = null;
    
    page.on('request', req => {
        const url = req.url();
        if(url.includes('.mp4') || url.includes('.m3u8')) {
            console.log("STREAM BULUNDU:", url);
            mp4Link = url;
        }
    });

    console.log("Dizigom'da aranıyor: breaking bad");
    await page.goto('https://www.dizigom.tv/?s=breaking+bad', { waitUntil: 'domcontentloaded' });
    
    const movieUrl = await page.$eval('.post-title a', el => el.href).catch(()=>null);
    if(movieUrl) {
        console.log("Dizi bulundu, bölüme gidiliyor:", movieUrl);
        await page.goto(movieUrl, { waitUntil: 'domcontentloaded' });
        
        // İlk bölüme git
        const firstEpisode = await page.$eval('.episodiotitle a', el => el.href).catch(()=>null);
        if(firstEpisode) {
            console.log("Bölüm sayfası açılıyor:", firstEpisode);
            await page.goto(firstEpisode, { waitUntil: 'networkidle2' });
            
            // Player içerisindeki iframeleri tara
            const iframes = await page.evaluate(() => Array.from(document.querySelectorAll('iframe')).map(f => f.src));
            for(let iframe of iframes) {
                if(iframe && iframe.includes('http')) {
                    console.log("İframe açılıyor:", iframe);
                    await page.goto(iframe, { waitUntil: 'networkidle2' });
                    await page.mouse.click(500, 300); // Play'e basmayı dene
                    await new Promise(r => setTimeout(r, 3000));
                }
            }
        }
    }
    
    console.log("İşlem bitti.");
    await browser.close();
})();
