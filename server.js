const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const https = require('https');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

// Statik dosyaları sun
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json());

// JSON Fetch Helper
function fetchJson(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (response) => {
            let data = '';
            response.on('data', chunk => data += chunk);
            response.on('end', () => {
                try { resolve(JSON.parse(data)); }
                catch (e) { reject(e); }
            });
        }).on('error', reject);
    });
}

// Film arama ve iframe oluşturma servisi
app.get('/api/search', async (req, res) => {
    const query = req.query.q;
    if (!query) {
        return res.status(400).json({ success: false, error: 'Arama terimi girilmedi.' });
    }

    console.log(`\n[API] IMDB'de aranıyor: "${query}"`);
    const encodedQuery = encodeURIComponent(query.toLowerCase());
    const imdbUrl = `https://v3.sg.media-imdb.com/suggestion/x/${encodedQuery}.json`;

    try {
        const imdbData = await fetchJson(imdbUrl);

        if (!imdbData.d || imdbData.d.length === 0) {
            return res.status(404).json({ success: false, error: 'Film veya dizi bulunamadı.' });
        }

        const currentYear = new Date().getFullYear();

        // Feature (Film) veya TV Series (Dizi) olan ve vizyona girmiş ilk mantıklı sonucu bul
        const result = imdbData.d.find(item => {
            const isVideo = item.q && (item.q === 'feature' || item.q === 'TV series' || item.q === 'TV mini-series' || item.q === 'video');
            const isReleased = !item.y || parseInt(item.y) <= currentYear;
            return isVideo && isReleased;
        });

        if (!result || !result.id) {
            return res.status(404).json({ success: false, error: 'Bulunan sonuçlar film veya dizi formatında değil.' });
        }

        const imdbId = result.id;
        const title = result.l;
        const year = result.y ? ` (${result.y})` : '';
        const isTvShow = (result.q === 'TV series' || result.q === 'TV mini-series');

        console.log(`[API] Bulundu: ${title}${year} [${result.q}] -> ID: ${imdbId}`);

        // Vidsrc iframe URL'sini oluştur
        let iframeSrc = '';
        if (isTvShow) {
            iframeSrc = `https://vidsrc.to/embed/tv/${imdbId}`; // Varsayılan S1E1
        } else {
            iframeSrc = `https://vidsrc.to/embed/movie/${imdbId}`;
        }

        console.log(`[API] Başarılı! Iframe adresi oluşturuldu: ${iframeSrc}`);
        
        // Frontend'e sonucu gönder
        res.json({ 
            success: true, 
            url: iframeSrc, 
            movie: `${title}${year}`,
            imdbId: imdbId,
            isTv: isTvShow
        });

    } catch (error) {
        console.error(`[API] Hata:`, error.message);
        res.status(500).json({ success: false, error: error.message || 'API Hatası' });
    }
});

// Socket.io Odaları ve Senkronizasyon
const roomsData = {}; // Her odanın kendi video durumunu tutar

io.on('connection', (socket) => {
    console.log(`Yeni kullanıcı bağlandı: ${socket.id}`);

    // Kullanıcının bulunduğu mevcut oda ve adı
    let currentRoom = null;
    socket.username = "Misafir"; // Varsayılan

    socket.on('joinRoom', (data) => {
        // data string (eski sürüm) veya obje olabilir
        const roomId = typeof data === 'string' ? data : data.roomId;
        if (data.username) {
            socket.username = data.username;
        }

        if (currentRoom) {
            socket.leave(currentRoom);
        }
        currentRoom = roomId;
        socket.join(roomId);
        console.log(`[Socket] ${socket.username} (${socket.id}) -> ${roomId} odasına katıldı.`);

        // Oda verisi yoksa başlat
        if (!roomsData[roomId]) {
            roomsData[roomId] = { url: '', time: 0, isPlaying: false, title: '' };
        }

        // Yeni katılana mevcut durumu gönder
        socket.emit('updateVideo', roomsData[roomId]);
        
        // Odaya katılım mesajı (Sistem mesajı)
        io.to(roomId).emit('systemMessage', `${socket.username} odaya katıldı.`);
        
        // Odadaki kişi sayısını herkese bildir
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        io.to(roomId).emit('roomUsersCount', roomSize);
    });

    // Film kaynağı değiştiğinde (Oda bazlı)
    socket.on('changeVideo', (data) => {
        if (!currentRoom) return;
        console.log(`[Socket] ${currentRoom} odasında ${socket.username} video değiştirdi: ${data.url}`);
        roomsData[currentRoom] = { url: data.url, time: 0, isPlaying: false, title: data.title };
        io.to(currentRoom).emit('updateVideo', roomsData[currentRoom]);
        
        // Video değiştiğinde sistem mesajı gönder
        io.to(currentRoom).emit('systemMessage', `${socket.username} ${data.title} açtı.`);
    });

    // Geri Sayım Olayı
    socket.on('startCountdown', () => {
        if (!currentRoom) return;
        console.log(`[Socket] ${currentRoom} odasında geri sayım başlatıldı.`);
        io.to(currentRoom).emit('triggerCountdown');
    });

    // Eklentiden gelen Senkronizasyon (Play/Pause) sinyalleri
    socket.on('syncPlay', (data) => {
        if (!currentRoom) return;
        roomsData[currentRoom].isPlaying = true;
        roomsData[currentRoom].time = data.time;
        // Kendisi hariç herkese gönder
        socket.to(currentRoom).emit('doPlay', data);
    });

    socket.on('syncPause', (data) => {
        if (!currentRoom) return;
        roomsData[currentRoom].isPlaying = false;
        roomsData[currentRoom].time = data.time;
        socket.to(currentRoom).emit('doPause', data);
    });

    socket.on('syncSeek', (data) => {
        if (!currentRoom) return;
        roomsData[currentRoom].time = data.time;
        socket.to(currentRoom).emit('doSeek', data);
    });

    // Sohbet (Chat) Mesajları
    socket.on('chatMessage', (msg) => {
        if (!currentRoom) return;
        // Mesajı odadaki herkese (gönderen dahil) ilet
        io.to(currentRoom).emit('chatMessage', {
            username: socket.username,
            text: msg
        });
    });

    socket.on('disconnect', () => {
        console.log(`Kullanıcı ayrıldı: ${socket.id}`);
        if (currentRoom) {
            // Odadan ayrılma mesajı
            io.to(currentRoom).emit('systemMessage', `${socket.username} odadan ayrıldı.`);
            
            const roomSize = io.sockets.adapter.rooms.get(currentRoom)?.size || 0;
            io.to(currentRoom).emit('roomUsersCount', roomSize);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
