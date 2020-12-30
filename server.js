import { yt_tracksplitter, getArchiveAlbum, getVideoInfo, getArtistList, getAlbumDetail, getAlbumList, getThumbnail, getTrack } from "./splitter";

const express = require("express");
const cors = require("cors");
const basicAuth = require('express-basic-auth')

const app = express();
const port = 3000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(basicAuth({users: { 'user': process.env.PASSWORD ?? '12345678'}}))

let clients = [];

function sendEventsToAll(newNest) {
  clients.forEach(c => c.res.write(`data: ${JSON.stringify(newNest)}\n\n`))
}

app.get('/explorer/artist', async (req, res) => {
  const artists = await getArtistList();
  res.send(JSON.stringify(artists));
})

app.get('/explorer/:artist/albums', async (req, res) => {
  const artist = req.params.artist;
  res.send(JSON.stringify(await getAlbumList(artist)));
})

app.get('/explorer/:artist/albums/:album', async (req, res) => {
  const artist = req.params.artist;
  const album = req.params.album;

  res.send(JSON.stringify(await getAlbumDetail(artist, album)))
})

app.get('/explorer/:artist/albums/:album/archive', async (req, res) => {
  const artist = req.params.artist;
  const album = req.params.album;

  const data = await getArchiveAlbum(artist, album);
  res.set('Content-Type', 'application/zip')
  res.set('Content-Disposition', `attachment; filename=${artist} ${album}.zip`);
  res.set('Content-Length', data.length);
  res.end(data, 'binary');
})

app.get('/explorer/:artist/albums/:album/thumbnail', async (req, res) => {
  const artist = req.params.artist;
  const album = req.params.album;

  let n = await getThumbnail(artist, album);
  n = '/' + n;
  res.sendFile(n, {root: __dirname});
})

app.get('/explorer/:artist/albums/:album/:track', async (req, res) => {
  const artist = req.params.artist;
  const album = req.params.album;
  const track = req.params.track;

  let n = await getTrack(artist,album,track);
  n = '/' + n;
  res.sendFile(n, {root: __dirname});
});

app.get('/info', async (req,res) => {
  console.log(req.query);
  res.send(JSON.stringify((await getVideoInfo(req.query.v)).videoDetails));
});

let running = false;

app.post("/download", (req, res) => {
  running = true;
  yt_tracksplitter(req.body).subscribe((event) => sendEventsToAll(event), null, () => {
      clients.forEach((c) => c.res.end());
      running = false;
  });
  res.send(JSON.stringify({}));
});

app.get("/events", (req, res) => {
  // Mandatory headers and http status to keep connection open
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.flushHeaders(); // flush the headers to establish SSE with client
  
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);
  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

