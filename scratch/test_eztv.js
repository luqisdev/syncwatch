const https = require('https');

https.get('https://eztvx.to/api/get-torrents?imdb_id=0903747', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
        try {
            const json = JSON.parse(data);
            console.log("EZTV Sonuç Sayısı:", json.torrents ? json.torrents.length : 0);
            if (json.torrents && json.torrents.length > 0) {
                console.log("Örnek:", {
                    title: json.torrents[0].title,
                    season: json.torrents[0].season,
                    episode: json.torrents[0].episode,
                    magnet: json.torrents[0].magnet_url.substring(0, 50) + "..."
                });
            }
        } catch (e) {
            console.log("Hata:", e.message);
        }
    });
});
