import request from "request";

import { getArchiveAlbum, currentProcessInfo, getVideoInfo, getArtistList, getAlbumDetail, getAlbumList, getThumbnail, getTrack, yt_tracksplitter_add, subjectTrackSplitter, getPasePath } from "./splitter.mjs";
import {join} from 'path';
import { copyFile, existsSync, mkdirSync } from "fs";

import express from "express";
import cors from "cors";
import formDataa from 'express-form-data';

const app = express();
const port = process.env.PORT || 3000;

const auth = {users: { 'user': process.env.PASSWORD || '12345678'}};

app.use(cors());
app.use(express.json());
app.use(formDataa.parse());
app.use(express.urlencoded({ extended: false }));

let clients = [];

function sendEventsToAll(newNest) {
  clients.forEach(c => c.res.write(`data: ${JSON.stringify(newNest)}\n\n`))
}

subjectTrackSplitter.asObservable().subscribe((event) => {
  console.log('BROADCAST EVENT');
  sendEventsToAll({ type: 'splitter', data: event});
});

app.get('/', (req, res) => {
  res.send(JSON.stringify({version: 0}));
})

app.get('/proxy-download', (req, res) => {
  const url = req.query.url;
   request.head(url, function (err, res2, body) {
      request(url)
        .pipe(res)
        .on("close", () => {
          console.log('END');
        });
    });
})

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
  res.sendFile(n, {root: getPasePath()});
})

app.post('/explorer/:artist/albums/:album/thumbnail', (req, res) => {
  const artist = req.params.artist;
  const album = req.params.album;

  const filePath = req.files.file.path;

  let dst = join(getPasePath(), artist, album);

  if (!existsSync(dst))
    mkdirSync(dst, { recursive: true });
  dst = join(dst, 'thumbnail.jpg');
  console.log('COPY TO', dst);
  copyFile(filePath, dst, () => {
    res.end();
  })

});

app.get('/explorer/:artist/albums/:album/:track', async (req, res) => {
  const artist = req.params.artist;
  const album = req.params.album;
  const track = req.params.track;

  let n = await getTrack(artist,album,track);
  n = '/' + n;
  res.sendFile(n, {root: getPasePath()});
});

app.get('/info', async (req,res) => {
  console.log(req.query);
  res.send(await getVideoInfo(req.query.v));
});

app.post("/download", (req, res) => {
  const data = yt_tracksplitter_add(req.body);
  if(data) {
    res.send(JSON.stringify({status: 'started'}))
  } else {
    res.send(JSON.stringify({status: 'queue'}));
  }
});

app.get("/events", (req, res) => {
  // Mandatory headers and http status to keep connection open
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  res.flushHeaders(); // flush the headers to establish SSE with client
  
  const clientId = Date.now();
  const newClient = {
    id: clientId,
    res
  };
  clients.push(newClient);


  newClient.res.write(`data: ${JSON.stringify({ type: 'splitter', data: currentProcessInfo})}\n\n`)


  req.on('close', () => {
    clients = clients.filter(c => c.id !== clientId);
  });
});

app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});

