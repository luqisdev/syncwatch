const https = require('https');

async function searchAll(query) {
    const encodedQuery = encodeURIComponent(query);
    let results = [];

    // 1. YTS'de Film Ara
    try {
        const ytsData = await fetchJson(`https://yts.mx/api/v2/list_movies.json?query_term=${encodedQuery}&limit=5`);
        if (ytsData && ytsData.data && ytsData.data.movies) {
            ytsData.data.movies.forEach(m => {
                // En iyi kaliteyi bul
                const torrent = m.torrents.find(t => t.quality === '1080p') || m.torrents[0];
                if (torrent) {
                    // Magnet link oluştur
                    const magnet = `magnet:?xt=urn:btih:${torrent.hash}&dn=${encodeURIComponent(m.title)}&tr=udp://open.demonii.com:1337/announce&tr=udp://tracker.openbittorrent.com:80`;
                    results.push({
                        type: 'movie',
                        title: `${m.title} (${m.year}) - Film`,
                        magnet: magnet,
                        image: m.medium_cover_image
                    });
                }
            });
        }
    } catch(e) { console.error("YTS Hatası:", e.message); }

    // 2. IMDb üzerinden dizi kontrolü ve EZTV API'si
    try {
        const imdbData = await fetchJson(`https://v3.sg.media-imdb.com/suggestion/x/${encodedQuery}.json`);
        if (imdbData && imdbData.d) {
            const tvShow = imdbData.d.find(item => item.q === 'TV series' || item.q === 'TV mini-series');
            if (tvShow && tvShow.id) {
                const imdbIdNum = tvShow.id.replace('tt', '');
                const eztvData = await fetchJson(`https://eztvx.to/api/get-torrents?imdb_id=${imdbIdNum}`);
                if (eztvData && eztvData.torrents) {
                    // EZTV sonuçları çok fazla, sadece en güncel VEYA gruplanmış sonuçlar
                    // Bölümleri S01E01 şeklinde gruplayalım
                    eztvData.torrents.slice(0, 15).forEach(t => {
                        results.push({
                            type: 'tv',
                            title: `${tvShow.l} - S${t.season}E${t.episode}`,
                            magnet: t.magnet_url,
                            image: tvShow.i ? tvShow.i.imageUrl : ''
                        });
                    });
                }
            }
        }
    } catch(e) { console.error("EZTV Hatası:", e.message); }

    console.log("Bulunan Sonuçlar:", results.length);
    console.log(results.slice(0, 3));
}

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

searchAll("Breaking Bad");
