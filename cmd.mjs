
import { yt_tracksplitter, getArchiveAlbum, currentProcessInfo, getVideoInfo, getArtistList, getAlbumDetail, getAlbumList, getThumbnail, getTrack, yt_tracksplitter_add, subjectTrackSplitter, ffmpegSubject, getPasePath } from "./splitter.mjs";

import { readFile } from 'fs/promises';
import { argv } from 'process';


async function process() {
	let file_name = argv[2];
	let file_content = JSON.parse(await readFile(file_name))

	yt_tracksplitter_add(file_content)
}


process().then(() => {}).catch(e => console.error(e));