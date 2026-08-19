const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
puppeteer.use(StealthPlugin());

(async () => {
    console.log("Tarayıcı başlatılıyor...");
    const browser = await puppeteer.launch({ 
        headless: "new",
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    let foundStream = null;
    
    // İstekleri dinle
    page.on('request', request => {
        const url = request.url();
        if (url.includes('.m3u8') || (url.includes('.mp4') && !url.includes('blank.mp4'))) {
            if (!foundStream) {
                foundStream = url;
                console.log("\n[!!!] BAŞARILI! Stream URL Bulundu:");
                console.log(url);
            }
        }
    });

    console.log("Vidsrc açılıyor (Inception)...");
    await page.goto('https://vidsrc.net/embed/movie?imdb=tt1375666', { waitUntil: 'networkidle2', timeout: 30000 });
    
    console.log("Play butonuna tıklama simüle ediliyor...");
    try {
        // İframe içindeki play butonunu bulmamız lazım veya sayfadaki herhangi bir yere tıklayalım
        await page.mouse.click(500, 300);
        await new Promise(r => setTimeout(r, 2000));
        await page.mouse.click(500, 300);
        
        // Biraz daha bekle
        await new Promise(r => setTimeout(r, 5000));
    } catch (e) {
        console.log("Tıklama hatası:", e.message);
    }
    
    console.log("Tarayıcı kapatılıyor.");
    await browser.close();
})();
