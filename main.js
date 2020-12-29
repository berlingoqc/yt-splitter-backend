// ESM syntax is supported.
export {};

const fs = require("fs");

const request = require("request");

const ytdl = require("ytdl-core");

const NodeID3 = require("node-id3");

const { createFFmpeg, fetchFile } = require("@ffmpeg/ffmpeg");

import { Observable } from "rxjs";

let ffmpegLoaded = false;
const ffmpeg = createFFmpeg({ log: true });

async function loadFFMPEG() {
  if (ffmpegLoaded) {
    return;
  }
  await ffmpeg.load();
  ffmpegLoaded = true;
}

const downloadImage = function (uri, filename, callback) {
  return new Promise((resolv) => {
    request.head(uri, function (err, res, body) {
      console.log("content-type:", res.headers["content-type"]);
      console.log("content-length:", res.headers["content-length"]);
      request(uri)
        .pipe(fs.createWriteStream(filename))
        .on("close", () => resolv(filename));
    });
  });
};

function downloadYT(v, basePath) {
  return new Promise((resolver, reject) => {
    const path = basePath + "original.mp4";
    ytdl(`https://www.youtube.com/watch?v=${v}`)
      .pipe(fs.createWriteStream(path))
      .addListener("close", () => {
        console.log("WRITTING OVER");
        resolver("original.mp4");
      });
  });
}

export function getVideoInfo(v) {
  return ytdl.getInfo(`https://www.youtube.com/watch?v=${v}`);
}

async function convertToMP3(file, basePath) {
  await loadFFMPEG();
  ffmpeg.FS("writeFile", file, await fetchFile(basePath + file));
  const output = "audio.mp3";
  await ffmpeg.run("-i", file, output);
  await fs.promises.writeFile(basePath + output, ffmpeg.FS("readFile", output));
  return output;
}

async function extractTrackFromMP3(file, trackName, start, end, basePath) {
  await loadFFMPEG();
  ffmpeg.FS("writeFile", file, await fetchFile(basePath + file));
  const output = `${trackName}.mp3`;
  await ffmpeg.run("-i", file, "-ss", start, end ? "-t" : "", end, output);
  await fs.promises.writeFile(basePath + output, ffmpeg.FS("readFile", output));
  return output;
}

async function tagTrack(file, album, track, imageFile, basePath) {
  console.log("TAG", file);
  return NodeID3.write(
    Object.assign(album, { title: track.name, APIC: imageFile }),
    basePath + file
  );
}

let basePath = "./";

export function yt_tracksplitter(model) {
  return new Observable(async (sub) => {
    const folder =
      basePath + "/" + model.album.artist + "/" + model.album.album + "/";

    sub.next({status: 'Creating folder'});
    if (fs.existsSync(folder)) fs.rmdirSync(folder, { recursive: true });
    fs.mkdirSync(folder, { recursive: true });
    sub.next({status: 'Complete'});
    
    sub.next({status: 'Get video info'});
    const info = await getVideoInfo(model.v);
    sub.next({status: 'Complete'});
    const image = info.videoDetails.thumbnails[0];
    const imageFile = "thumbnail.jpg";

    sub.next({status: 'Download image'});
    await downloadImage(image.url, folder + imageFile);
    sub.next({status: 'Complete'});

    sub.next({status: 'Downloading youtube video to mp4'});
    const file = await downloadYT(model.v, folder);
    sub.next({status: 'Complete'});

    sub.next({status: 'Converting to mp3'});
    const audioFile = await convertToMP3(file, folder);
    sub.next({status: 'Complete'});


    sub.next({status: 'Splittings track'});
    for (let i = 0; i < model.tracks.length; i++) {
      const track = model.tracks[i];
      const nextTrack = model.tracks[i + 1];
      const fileTrack = await extractTrackFromMP3(
        audioFile,
        track.name,
        track.ss,
        nextTrack ? nextTrack.ss : "",
        folder
      );
      const success = await tagTrack(
        fileTrack,
        model.album,
        track,
        folder + imageFile,
        folder
      );
      if (!success) {
        console.error("SUCCESS FAILED");
      }
    }
    sub.next({status: 'Complete'});
    sub.complete();
  });
}

export async function setBasePath(path) {
  basePath = path;
}
