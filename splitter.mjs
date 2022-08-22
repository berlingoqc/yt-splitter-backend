// ESM syntax is supported.
export {};

import fs from "fs";
import path from "path";
import request from "request";
import ytdl from "ytdl-core";
import NodeID3 from "node-id3";
import zip from "adm-zip";
import { BehaviorSubject, Observable } from "rxjs";

import { exec } from 'child_process';

const downloadImage = function (uri, filename, callback) {
  return new Promise((resolv) => {
    try {
    if(fs.existsSync(filename)) {
      resolv(filename);
      return;
    }
    } catch(err) {

    }
   request.head(uri, function (err, res, body) {
      console.log("content-type:", res.headers["content-type"]);
      console.log("content-length:", res.headers["content-length"]);
      request(uri)
        .pipe(fs.createWriteStream(filename))
        .on("close", () => resolv(filename));
    });
  });
};

function downloadYT(v, basePath, args) {
  const p = path.join(basePath, "original.mp4");
  console.log('PATH', p);
  return new Promise((resolver, reject) => {
    const chapiter_split = args.tracks_source === 'chapters' ? '--split-chapters' : ''
    exec(`yt-dlp https://www.youtube.com/watch?v=${v} --audio-quality 0 -x --audio-format mp3 -P '${basePath}' -o 'audio.%(ext)s' ${chapiter_split}`, (error, stdout, stderr) => {
      if (error) {
        console.error(error);
        reject(error);
      }

      resolver('original.mp3');
    });
  });
}

export function getVideoInfo(v) {
  return new Promise((resolv, reject) => {
    exec(`yt-dlp --dump-json https://www.youtube.com/watch?v=${v}`, (error, stdout) => {
      if (error) {
        console.error(error);
        reject(error);
      }
      resolv(JSON.parse(stdout))
    })
  });
}

async function extractTrackFromMP3(file, trackName, start, end, basePath) {
  const output = `${trackName}.mp3`;
  console.log('EXTRACTING ', start, end);
  return new Promise((resolver, reject) => {
    exec(`ffmpeg -i '${path.join(basePath, file)}' -y -ss ${start} ${end ? "-to" : ""} ${end || ''} -acodec copy '${path.join(basePath, output)}'`, (error, stdout) => {
      if (error) {
        console.error(error);
        reject(error);
      }

      resolver(output);
    });
  });
}

async function tagTrack(file, album, track, imageFile, basePath) {
  console.log("TAG", file);
  return NodeID3.write(
    Object.assign(album, { title: track.title, APIC: imageFile }),
    path.join(basePath, file)
  );
}

let basePath = process.env.MUSIC_FOLDER || "./music";

function getFolderList(path) {
  return fs.readdirSync(path, { withFileTypes: true })
    .filter(dirent => dirent.isDirectory())
    .map(dirent => dirent.name)
}

export async function getArtistList() {
  return getFolderList(basePath);
}

export async function getAlbumList(artist) {
  return getFolderList(path.join(basePath, artist)).map((folder) => {
    return {
      album: folder,
      artist,
    }
  });
}

export async function getAlbumDetail(artist, album) {
  const items = fs.readdirSync(path.join(basePath, artist, album), {withFileTypes: true})
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name);
  
  return {
    original: items.includes('original.mp4') ?'original.mp4': undefined,
    audio: items.includes('audio.mp3') ? 'audio.mp3': undefined,
    thumbnail: items.includes('thumbnail.jpg') ? 'thumbnail.jpg': undefined,
    tracks: items.filter(i => path.extname(i) === '.mp3' && i !== 'audio.mp3')
  };
}

export async function getThumbnail(artist, album) {
  return path.join(artist, album, 'thumbnail.jpg');
}

export async function getTrack(artist, album, track) {
  return path.join(artist, album, track);
}

export async function getArchiveAlbum(artist, album) {
  const archive = new zip();
  const albumPath = path.join(basePath, artist, album);
  fs.readdirSync(albumPath, {withFileTypes: true})
    .filter(dirent => dirent.isFile())
    .map(dirent => dirent.name).forEach((file) => {
      archive.addLocalFile(path.join(albumPath, file));
    })
  return archive.toBuffer();
}


export class YtTrackProcessItem {
  operation;
  complete;
  items = [];
}

export class YtTrackProcess {
  name = '';
  items = [];
  error;
  queue = [];
}

const completeList = [];

let currentSplitter;
let currentSub;

export let currentProcessInfo = new YtTrackProcess();
export const subjectTrackSplitter = new BehaviorSubject();

export function yt_tracksplitter_add(data) {
  currentProcessInfo.queue.push(data);
  subjectTrackSplitter.next(currentProcessInfo);
  return yt_tracksplitter();
}

export function yt_tracksplitter() {
  if(currentSplitter) {
    return;
  }
  if(currentProcessInfo.queue.length < 1) {
    return;
  }
  const model = currentProcessInfo.queue.splice(0,1)[0];
  if(!model) {
    return;
  }
  currentProcessInfo.name = `${model.album.artist} ${model.album.album}`;
  subjectTrackSplitter.next(currentProcessInfo);
  currentSplitter = new Observable(async (sub) => {
    const folder = path.join(basePath, model.album.artist, model.album.album);

    sub.next({status: 'Creating folder'});
    if (!fs.existsSync(folder))
      fs.mkdirSync(folder, { recursive: true });
    sub.next({status: 'Complete'});
    
    sub.next({status: 'Get video info'});
    const info = await getVideoInfo(model.v);
    sub.next({status: 'Complete'});

    const image = info.thumbnails[0];
    const imageFile = "thumbnail.jpg";


    if (model.tracks_source === "chapters") {
      sub.next({status: 'Getting chapiters info'});
      const chapters = info.chapters;
      if (chapters) {
          let tracks = chapters.map((data) => {
            return { title: data.title }
          });
          model.tracks = tracks;
      }

      sub.next({status: 'Complete'});
    }


    sub.next({status: 'Download image'});
    await downloadImage(image.url, path.join(folder, imageFile));
    sub.next({status: 'Complete'});

    sub.next({status: 'Downloading youtube video to mp4'});
    const file = await downloadYT(model.v, folder, model);
    sub.next({status: 'Complete'});


    if (model.tracks_source == "manual") {
      sub.next({status: 'Splittings track'});
      for (let i = 0; i < model.tracks.length; i++) {
        const track = model.tracks[i];
        const nextTrack = model.tracks[i + 1];
        const fileTrack = await extractTrackFromMP3(
          'audio.mp3',
          track.title,
          track.ss,
          (track.t) ? track.t : (nextTrack ? nextTrack.ss : undefined),
          folder
        );
        console.log(fileTrack,path.join(folder, imageFile));
        const success = await tagTrack(
          fileTrack,
          model.album,
          track,
          path.join(folder, imageFile),
          folder
        );
        console.log(success);
        if (!success) {
          console.error("SUCCESS FAILED");
        }
      }
    } else if (model.tracks_source === "chapters") {
      // RENAME ALL FILE TO JUST THE TRACK NAME
      const files = fs.readdirSync(folder)
      for (let i = 0; i < files.length; i++) {
        const track = model.tracks.find(x => {
          return files[i].includes(x.title)
        })
        if (track) {
          const fileTrack = path.join(folder, track.title) + '.mp3'
          fs.renameSync(path.join(folder,files[i]), fileTrack);
          const success = await tagTrack(
            track.title + '.mp3',
            model.album,
            track,
            path.join(folder, imageFile),
            folder
          );
          console.log(success);
        }
      }
    }

    if (!model.keep_audio) {
      fs.rmSync(path.join(folder, 'audio.mp3'))
    }

    sub.next({status: 'Complete'});
    sub.next({status: 'Done'});
    sub.complete();
    currentSplitter = null;
    currentSub.unsubscribe();
    yt_tracksplitter();
  });
  currentSub = currentSplitter.subscribe((e) => {
    if(e.status === 'Complete') {
      if(currentProcessInfo.items[currentProcessInfo.items.length - 1]) {
        currentProcessInfo.items[currentProcessInfo.items.length -1 ].complete = true;
      } else {
        console.log('Cant handle Complete')
      }
    } else if(e.status === 'Done') {
      currentProcessInfo.items = [];
      currentProcessInfo.name = '';
      completeList.push(model.album);

      //TODO enable post download scripting
      if (fs.existsSync('afterdownload.sh')) {
        exec('afterdownload.sh', (error) => {
          console.log('After download is over');
        })
      }
    } else {
      currentProcessInfo.items.push({operation: e.status, complete: false});
    }

    subjectTrackSplitter.next(currentProcessInfo);
  });

  return currentProcessInfo;
}

export async function setBasePath(path) {
  basePath = path;
}

export function getPasePath() {
  return basePath;
}


if (!fs.existsSync(basePath))
  fs.mkdirSync(basePath, { recursive: true });
