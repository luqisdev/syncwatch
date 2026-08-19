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

const fs = require('fs');
const USERS_FILE = path.join(__dirname, 'users.json');

// Veritabanı Yardımcı Fonksiyonları
function loadUsers() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({}));
        return {};
    }
    try {
        return JSON.parse(fs.readFileSync(USERS_FILE, 'utf8'));
    } catch (e) {
        return {};
    }
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

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

    // Kullanıcının bulunduğu mevcut oda, adı ve rastgele rengi
    let currentRoom = null;
    socket.username = "Misafir"; // Varsayılan
    
    // Kullanıcıya harika rastgele bir pastel/vibrant renk ata
    const colors = ["#ef4444", "#3b82f6", "#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#14b8a6", "#f97316"];
    socket.color = colors[Math.floor(Math.random() * colors.length)];

    socket.on('joinRoom', (data) => {
        // data string (eski sürüm) veya obje olabilir
        const roomId = typeof data === 'string' ? data : data.roomId;
        if (data.username) {
            socket.username = data.username;
        }

        if (currentRoom) {
            socket.leave(currentRoom);
            if (roomsData[currentRoom] && roomsData[currentRoom].users) {
                delete roomsData[currentRoom].users[socket.id];
                io.to(currentRoom).emit('updateUsersList', Object.values(roomsData[currentRoom].users));
            }
        }
        currentRoom = roomId;
        socket.join(roomId);
        console.log(`[Socket] ${socket.username} (${socket.id}) -> ${roomId} odasına katıldı.`);

        // Oda verisi yoksa başlat
        if (!roomsData[roomId]) {
            roomsData[roomId] = { 
                url: '', 
                mediaType: 'vidsrc', // vidsrc, youtube, instagram
                time: 0, 
                isPlaying: false, 
                title: '', 
                users: {}, 
                chatHistory: [], 
                queue: [], // Medya kuyruğu
                admin: null 
            };
        }

        // İlk giren kişi veya admin yoksa admin yap
        if (!roomsData[roomId].admin) {
            roomsData[roomId].admin = socket.id;
        }

        // Odaya kullanıcıyı ekle
        roomsData[roomId].users[socket.id] = { id: socket.id, username: socket.username, color: socket.color };

        // Yeni katılana mevcut durumu ve geçmiş mesajları gönder
        socket.emit('updateVideo', roomsData[roomId]);
        socket.emit('chatHistory', roomsData[roomId].chatHistory);
        
        // Odaya katılım mesajı (Sistem mesajı)
        io.to(roomId).emit('systemMessage', `${socket.username} odaya katıldı.`);
        
        // Odadaki kişi sayısını ve isimlerini herkese bildir
        io.to(roomId).emit('updateUsersList', { 
            users: Object.values(roomsData[roomId].users),
            adminId: roomsData[roomId].admin
        });
        const roomSize = io.sockets.adapter.rooms.get(roomId)?.size || 0;
        io.to(roomId).emit('roomUsersCount', roomSize);
    });

    // Film kaynağı değiştiğinde (Oda bazlı)
    socket.on('changeVideo', (data) => {
        if (!currentRoom) return;
        if (roomsData[currentRoom].admin !== socket.id) return;

        console.log(`[Socket] ${currentRoom} odasında ${socket.username} video değiştirdi: ${data.url}`);
        roomsData[currentRoom] = { 
            ...roomsData[currentRoom],
            url: data.url,
            mediaType: data.mediaType || 'vidsrc',
            time: 0, 
            isPlaying: false, 
            title: data.title 
        };
        io.to(currentRoom).emit('updateVideo', roomsData[currentRoom]);
        io.to(currentRoom).emit('systemMessage', `${socket.username} ${data.title} açtı.`);
    });

    // Kuyruktan Sonrakine Geç
    socket.on('playNext', () => {
        if (!currentRoom) return;
        if (roomsData[currentRoom].admin !== socket.id) return;
        
        if (roomsData[currentRoom].queue.length > 0) {
            const nextMedia = roomsData[currentRoom].queue.shift();
            
            roomsData[currentRoom] = { 
                ...roomsData[currentRoom],
                url: nextMedia.url,
                mediaType: nextMedia.type,
                time: 0, 
                isPlaying: false, 
                title: nextMedia.title 
            };
            
            io.to(currentRoom).emit('updateVideo', roomsData[currentRoom]);
            io.to(currentRoom).emit('queueUpdated', roomsData[currentRoom].queue);
            io.to(currentRoom).emit('systemMessage', `${socket.username} kuyruktaki sıradaki videoya geçti: ${nextMedia.title}`);
        }
    });

    // Geri Sayım Olayı
    socket.on('startCountdown', () => {
        if (!currentRoom) return;
        // YALNIZCA ADMİN BAŞLATABİLİR
        if (roomsData[currentRoom].admin !== socket.id) return;

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
        
        const now = new Date();
        const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');
        
        const messageData = {
            username: socket.username,
            text: msg,
            time: timeStr,
            color: socket.color
        };

        if (!roomsData[currentRoom].chatHistory) roomsData[currentRoom].chatHistory = [];
        roomsData[currentRoom].chatHistory.push(messageData);
        if (roomsData[currentRoom].chatHistory.length > 50) {
            roomsData[currentRoom].chatHistory.shift();
        }

        io.to(currentRoom).emit('chatMessage', messageData);

        // --- Link Algılama (YouTube, Instagram vs.) ---
        const ytMatch = msg.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/i);
        const instaMatch = msg.match(/instagram\.com\/(?:p|reel)\/([A-Za-z0-9_-]+)/i);

        if (ytMatch || instaMatch) {
            let mediaObj = null;
            if (ytMatch) {
                mediaObj = {
                    title: `YouTube Videosu`,
                    url: `https://www.youtube.com/embed/${ytMatch[1]}`,
                    type: 'youtube',
                    addedBy: socket.username
                };
            } else if (instaMatch) {
                mediaObj = {
                    title: `Instagram Postu`,
                    url: `https://www.instagram.com/p/${instaMatch[1]}/embed/`,
                    type: 'instagram',
                    addedBy: socket.username
                };
            }

            if (mediaObj) {
                roomsData[currentRoom].queue.push(mediaObj);
                io.to(currentRoom).emit('queueUpdated', roomsData[currentRoom].queue);
                io.to(currentRoom).emit('systemMessage', `${socket.username} kuyruğa bir video ekledi.`);
            }
        }
    });

    // "Yazıyor..." Animasyonu İçin
    socket.on('typing', (isTyping) => {
        if (!currentRoom) return;
        socket.to(currentRoom).emit('typing', { username: socket.username, isTyping });
    });

    // Hesap (Auth) Sistemi
    socket.on('auth', (data) => {
        const { username, password, type } = data;
        const users = loadUsers();
        
        if (type === 'register') {
            if (users[username]) {
                return socket.emit('authResult', { success: false, message: 'Bu kullanıcı adı zaten alınmış!' });
            }
            users[username] = { password };
            saveUsers(users);
            socket.emit('authResult', { success: true, username });
        } else if (type === 'login') {
            if (!users[username] || users[username].password !== password) {
                return socket.emit('authResult', { success: false, message: 'Hatalı şifre veya kullanıcı adı!' });
            }
            socket.emit('authResult', { success: true, username });
        }
    });

    // Admin Yetki Devri
    socket.on('transferAdmin', (targetSocketId) => {
        if (!currentRoom || roomsData[currentRoom].admin !== socket.id) return;
        if (roomsData[currentRoom].users[targetSocketId]) {
            roomsData[currentRoom].admin = targetSocketId;
            const newAdminName = roomsData[currentRoom].users[targetSocketId].username;
            io.to(currentRoom).emit('systemMessage', `${newAdminName} odanın yeni yöneticisi oldu! 👑`);
            io.to(currentRoom).emit('updateUsersList', {
                users: Object.values(roomsData[currentRoom].users),
                adminId: roomsData[currentRoom].admin
            });
        }
    });

    // Kullanıcıyı Odadan Atma (Kick)
    socket.on('kickUser', (targetSocketId) => {
        if (!currentRoom || roomsData[currentRoom].admin !== socket.id) return;
        if (targetSocketId === socket.id) return; // Kendini atamaz
        
        const targetSocket = io.sockets.sockets.get(targetSocketId);
        if (targetSocket) {
            targetSocket.emit('kicked');
            targetSocket.disconnect(true);
        }
    });

    socket.on('disconnect', () => {
        console.log(`Kullanıcı ayrıldı: ${socket.id}`);
        if (currentRoom) {
            // Odadan ayrılma mesajı
            io.to(currentRoom).emit('systemMessage', `${socket.username} odadan ayrıldı.`);
            
            // Kullanıcıyı listeden çıkar
            if (roomsData[currentRoom] && roomsData[currentRoom].users) {
                delete roomsData[currentRoom].users[socket.id];
                
                // Eğer ayrılan kişi Admin ise, yetkiyi odada kalan ilk kişiye devret
                if (roomsData[currentRoom].admin === socket.id) {
                    const remainingUsers = Object.keys(roomsData[currentRoom].users);
                    if (remainingUsers.length > 0) {
                        roomsData[currentRoom].admin = remainingUsers[0];
                        io.to(currentRoom).emit('systemMessage', `${roomsData[currentRoom].users[remainingUsers[0]].username} odanın yeni yöneticisi oldu! 👑`);
                    } else {
                        roomsData[currentRoom].admin = null;
                    }
                }

                io.to(currentRoom).emit('updateUsersList', {
                    users: Object.values(roomsData[currentRoom].users),
                    adminId: roomsData[currentRoom].admin
                });
            }

            const roomSize = io.sockets.adapter.rooms.get(currentRoom)?.size || 0;
            io.to(currentRoom).emit('roomUsersCount', roomSize);
        }
    });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Sunucu çalışıyor: http://localhost:${PORT}`);
});
