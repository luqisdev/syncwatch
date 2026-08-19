const https = require('https');

function searchIMDb(query) {
    const q = encodeURIComponent(query.toLowerCase());
    const url = `https://v3.sg.media-imdb.com/suggestion/x/${q}.json`;
    
    https.get(url, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
            const json = JSON.parse(data);
            if (json.d && json.d.length > 0) {
                const firstResult = json.d.find(item => item.q && (item.q === 'feature' || item.q === 'TV series' || item.q === 'video'));
                if (firstResult) {
                    console.log("IMDb ID:", firstResult.id);
                    console.log("Title:", firstResult.l);
                    console.log("Type:", firstResult.q);
                    console.log("Year:", firstResult.y);
                } else {
                    console.log("No valid movie/tv found.");
                }
            } else {
                console.log("No results.");
            }
        });
    }).on('error', console.error);
}

searchIMDb('toy story');
searchIMDb('sex education');
