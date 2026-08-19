const https = require('https');

function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', c => data += c);
            res.on('end', () => {
                try { resolve(JSON.parse(data)); } catch(e) { reject(e); }
            });
        }).on('error', reject);
    });
}

async function searchTorrentio(query) {
    const encoded = encodeURIComponent(query.toLowerCase());
    const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/x/${encoded}.json`;
    let results = [];
    
    try {
        const imdbData = await fetchJson(imdbUrl);
        if (imdbData && imdbData.d) {
            const item = imdbData.d.find(i => i.q === 'feature' || i.q === 'TV series');
            if (item && item.id) {
                const imdbId = item.id;
                const isTv = item.q === 'TV series';
                const type = isTv ? 'series' : 'movie';
                const apiUrl = isTv 
                    ? `https://torrentio.strem.fun/stream/series/${imdbId}:1:1.json` 
                    : `https://torrentio.strem.fun/stream/movie/${imdbId}.json`;
                    
                console.log(`Found IMDb: ${item.l} (${imdbId}) - ${type}`);
                
                const torrentioData = await fetchJson(apiUrl);
                if (torrentioData && torrentioData.streams) {
                    // Sadece ilk 5 sonucu alalım
                    torrentioData.streams.slice(0, 5).forEach(stream => {
                        const magnet = `magnet:?xt=urn:btih:${stream.infoHash}&dn=${encodeURIComponent(item.l)}&tr=udp%3A%2F%2Ftracker.opentrackr.org%3A1337%2Fannounce`;
                        results.push({
                            type: isTv ? 'tv' : 'movie',
                            title: stream.title.split('\n')[0].substring(0, 50),
                            magnet: magnet,
                            image: item.i ? item.i.imageUrl : ''
                        });
                    });
                }
            }
        }
        console.log("Results:");
        console.log(results);
    } catch(e) {
        console.log("Hata:", e.message);
    }
}

searchTorrentio("Matrix");
