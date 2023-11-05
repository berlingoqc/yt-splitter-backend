// ESM syntax is supported.
export {};

import fs from "fs";
import path, { join } from "path";
import request from "request";
import NodeID3 from "node-id3";
import zip from "adm-zip";
import { BehaviorSubject, Observable } from "rxjs";

import { exec } from "child_process";
import {
  parse_artist_album_from_text,
  parse_tracks_from_yt_info,
} from "./parser.mjs";

const basePath = process.env.MUSIC_FOLDER || "./music";
const metadata_folder = join(basePath, '.ytdownload')

function init_folder() {
  if (!fs.existsSync(metadata_folder)) {
    fs.mkdirSync(metadata_folder);
    saveList('completed', []);
    saveList('failed', []);
  }
}

init_folder();

const downloadImage = function (uri, filename, callback) {
  return new Promise((resolv) => {
    try {
      if (fs.existsSync(filename)) {
        resolv(filename);
        return;
      }
    } catch (err) {}
    request.head(uri, function (err, res, body) {
      console.log("content-type:", res.headers["content-type"]);
      console.log("content-length:", res.headers["content-length"]);
      request(uri)
        .pipe(fs.createWriteStream(filename))
        .on("close", () => resolv(filename));
    });
  });
};

function downloadYTFullAlbum(v, basePath, args) {
  const p = path.join(basePath, "original.mp4");
  console.log("PATH", p);
  return new Promise((resolver, reject) => {
    const chapiter_split =
      args.tracks_source === "chapters" ? "--split-chapters" : "";
    exec(
      `yt-dlp https://www.youtube.com/watch?v=${v} --audio-quality 0 -x --audio-format mp3 -P '${basePath}' -o 'audio.%(ext)s' ${chapiter_split}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          reject(error);
        }

        resolver("original.mp3");
      }
    );
  });
}

function downloadYTPlaylistAlbum(v, basePath, args) {
  const p = path.join(basePath, "original.mp4");
  console.log("PATH", p);
  return new Promise((resolver, reject) => {
    exec(
      `yt-dlp https://www.youtube.com/playlist?list=${v} --audio-quality 0 -x --audio-format mp3 -o "%(title)s.%(ext)s" -P '${basePath}'`,
      (error, stdout, stderr) => {
        if (error) {
          console.log(stderr);
          console.error(error);
          reject(error);
        }
        console.log(stdout);

        resolver("original.mp3");
      }
    );
  });
}

export async function getVideoInfo(model) {
  const path = model.v ? `/watch?v=${model.v}` : `/playlist?list=${model.p}`;
  const info = await new Promise((resolv, reject) => {
    exec(
      `yt-dlp --dump-single-json https://www.youtube.com${path}`,
      { maxBuffer: 1024 * 5000 },
      (error, stdout, stderr) => {
        if (error) {
          console.error(error);
          reject({ error, stderr });
        } else {
          resolv(JSON.parse(stdout));
        }
      }
    );
  });
  if (model.p) {
    return {
      info,
      tracks: info.entries.map(x => ({title: x.title})),
      name: {
        artist: info.entries[0].artist,
        album: info.title,
        year: info.entries[0].release_year
      },
    };
  }
  return {
    info,
    tracks: parse_tracks_from_yt_info(info),
    name: parse_artist_album_from_text(info.title),
  };
}

async function extractTrackFromMP3(file, trackName, start, end, basePath) {
  const output = `${trackName}.mp3`;
  console.log("EXTRACTING ", start, end);
  return new Promise((resolver, reject) => {
    exec(
      `ffmpeg -i '${path.join(basePath, file)}' -y -ss ${start} ${
        end ? "-to" : ""
      } ${end || ""} -acodec copy "${path
        .join(basePath, output)
        .replace('"', "'")}"`,
      (error, stdout, stderr) => {
        if (error) {
          reject({ error, stderr });
        } else {
          resolver(output);
        }
      }
    );
  });
}

async function tagTrack(file, album, track, imageFile, index, basePath) {
  console.log("TAG", file);
  return NodeID3.write(
    Object.assign(album, { title: track.title, APIC: imageFile, TRCK: index }),
    path.join(basePath, file)
  );
}


function getFolderList(path) {
  return fs
    .readdirSync(path, { withFileTypes: true })
    .filter((dirent) => dirent.isDirectory())
    .map((dirent) => dirent.name);
}

export async function getArtistList() {
  return getFolderList(basePath);
}

export async function getAlbumList(artist) {
  return getFolderList(path.join(basePath, artist)).map((folder) => {
    return {
      album: folder,
      artist,
    };
  });
}

export async function getAlbumDetail(artist, album) {
  const items = fs
    .readdirSync(path.join(basePath, artist, album), { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name);

  return {
    original: items.includes("original.mp4") ? "original.mp4" : undefined,
    audio: items.includes("audio.mp3") ? "audio.mp3" : undefined,
    thumbnail: items.includes("thumbnail.jpg") ? "thumbnail.jpg" : undefined,
    tracks: items.filter(
      (i) => path.extname(i) === ".mp3" && i !== "audio.mp3"
    ),
  };
}

export async function getThumbnail(artist, album) {
  return path.join(artist, album, "thumbnail.jpg");
}

export async function getTrack(artist, album, track) {
  return path.join(artist, album, track);
}

export async function getArchiveAlbum(artist, album) {
  const archive = new zip();
  const albumPath = path.join(basePath, artist, album);
  fs.readdirSync(albumPath, { withFileTypes: true })
    .filter((dirent) => dirent.isFile())
    .map((dirent) => dirent.name)
    .forEach((file) => {
      archive.addLocalFile(path.join(albumPath, file));
    });
  return archive.toBuffer();
}

export async function splitTracks(model, folder) {
  for (let i = 0; i < model.tracks.length; i++) {
    const track = model.tracks[i];
    const nextTrack = model.tracks[i + 1];

    try {
      await extractTrackFromMP3(
        "audio.mp3",
        track.title,
        track.ss,
      track.t ? track.t : nextTrack ? nextTrack.ss : undefined,
        folder
      );
    } catch (ex) {
      throw ex;
    }
  }
  if (!model.keep_audio) {
    fs.rmSync(path.join(folder, "audio.mp3"));
  }
}

export async function tagTracks(model, imageFile, folder) {
  console.log("starting addings tags ", JSON.stringify(model.tracks))

  for (let i = 0; i < model.tracks.length; i++) {
    const track = model.tracks[i];

    const success = await tagTrack(
      `${track.title}.mp3`,
      model.album,
      track,
      path.join(folder, imageFile),
      i + 1,
      folder
    );
    console.log(success);

  }
}

export class YtTrackProcessItem {
  operation;
  complete;
  items = [];
}

export class YtTrackProcess {
  name = "";
  items = [];
  error;
  queue = [];
}

function saveList(name, data) {
  const file_name = join(basePath, '.ytdownload', name + '.json');
  const str_data = JSON.stringify(data);
  fs.writeFileSync(file_name, str_data);
}

function getList(name) {
  const file_name = join(basePath, '.ytdownload', name + '.json');
  const str_data = fs.readFileSync(file_name);
  return JSON.parse(str_data);
}

export let completeList = getList('completed');
export let failedList = getList('failed');

let currentSplitter;
let currentSub;

export let currentProcessInfo = new YtTrackProcess();
export const subjectTrackSplitter = new BehaviorSubject();

export function yt_tracksplitter_add(data) {
  currentProcessInfo.queue.push(data);
  subjectTrackSplitter.next(currentProcessInfo);
  return yt_tracksplitter();
}

async function run_splitter_step(sub, status, callback) {
  sub.next({ status });
  try {
    const v = await callback();
    sub.next({ status: "Complete" });
    return v;
  } catch (e) {
    sub.next({ status: "Error", error: e });
  }
}

export function yt_tracksplitter() {
  if (currentSplitter) {
    return;
  }
  if (currentProcessInfo.queue.length < 1) {
    return;
  }
  const model = currentProcessInfo.queue.splice(0, 1)[0];
  if (!model) {
    return;
  }

  currentProcessInfo.current = model;
  currentProcessInfo.name = `${model.album.artist} ${model.album.album}`;
  subjectTrackSplitter.next(currentProcessInfo);
  currentSplitter = new Observable(async (sub) => {
    const folder = path.join(basePath, model.album.artist, model.album.album);

    await run_splitter_step(sub, "Creating folder", async () => {
      if (!fs.existsSync(folder)) fs.mkdirSync(folder, { recursive: true });
    });

    const info = await run_splitter_step(sub, "Get video info", async () => {
      return (await getVideoInfo(model)).info;
    });

    const imageFile = await run_splitter_step(
      sub,
      "Download image",
      async () => {
        const image = info.thumbnails[0];
        const imageFile = "thumbnail.jpg";

        await downloadImage(image.url, path.join(folder, imageFile));

        return imageFile;
      }
    );

    await run_splitter_step(
      sub,
      "Download youtube video",
      async () => {
        if (model.v) {
          return downloadYTFullAlbum(model.v, folder, model);
        } else if (model.p) {
          return downloadYTPlaylistAlbum(model.p, folder, model);
        }
      }
    );

    if (model.v) {
      await run_splitter_step(
        sub,
        "Splittings track",
        async () => splitTracks(model, folder),
      );
    }

    await run_splitter_step(
      sub,
      "Adding i3tags",
      async () => tagTracks(model, imageFile, folder)
    );

    sub.next({ status: "Done" });
    sub.complete();
    currentSplitter = null;
    currentSub.unsubscribe();
    yt_tracksplitter();
  });
  currentSub = currentSplitter.subscribe((e) => {
    if (e.status === "Complete") {
      if (currentProcessInfo.items[currentProcessInfo.items.length - 1]) {
        currentProcessInfo.items[
          currentProcessInfo.items.length - 1
        ].complete = true;
      } else {
        console.log("Cant handle Complete");
      }
    } else if (e.status === "Done") {
      currentProcessInfo.items = [];
      currentProcessInfo.name = "";
      completeList.push(model);
      saveList('completed', completeList);

      //TODO enable post download scripting
      if (fs.existsSync("afterdownload.sh")) {
        exec("afterdownload.sh", (error) => {
          console.log("After download is over");
        });
      }
    } else if (e.status === "Error") {
      failedList.push(Object.assign(model, {error: e.error}));
      currentProcessInfo.name = '';
      currentProcessInfo.items = [];
      currentProcessInfo.current = null;
      saveList('failed', completeList);
    } else {
      currentProcessInfo.items.push({ operation: e.status, complete: false });
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

if (!fs.existsSync(basePath)) fs.mkdirSync(basePath, { recursive: true });
