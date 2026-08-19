const https = require('https');

https.get('https://hdfilmcehennemi.mobi/video/embed/pxvp89NbhOV/?rapidrame_id=0v4koswo623p', (res) => {
  console.log("Headers:", res.headers);
}).on('error', (e) => {
  console.error(e);
});
