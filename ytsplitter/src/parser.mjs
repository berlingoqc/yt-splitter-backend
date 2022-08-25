

import { EOL } from 'os';


const regex_tracks = [
	/(([0-9]{0,1}[0-9]:){0,1}([0-9]{0,1}[0-9]):([0-9][0-9]))/g
].map((r) => new RegExp(r));

export function parse_track_from_line(line) {
	const matching_regex = regex_tracks.map((regex) => line.match(regex));
	if (matching_regex && matching_regex.length > 0) {
		let first_timestamp = matching_regex[0];
		if (!first_timestamp || first_timestamp.length <= 0) {
			return null;
		}

		if (first_timestamp.length > 1) {
			// multiple track on this line
		} else {
			const timestamp = first_timestamp[0];
			const title = line.replace(timestamp, '').replace(/[<>\+\-\[\]\,\.]/g, "").trim();

			const match_index = title.match(/([0-9]{1,3}[.])/);
			console.log('match index', match_index);

			return { title, ss: timestamp}
		}
	}
	
	return null;
}

export function parse_tracks_from_text(text) {
	// Parse the text into line
	const lines = text.split(EOL);

	const parsed_lines = lines.map(x => {
		let track = parse_track_from_line(x)
		return track;
	}).filter(x => x);

	for (let i = 0; i < parsed_lines.length; i ++) {
		parsed_lines[i].t == parse_track_from_line[i]?.ss || null;
	}

	return parsed_lines;
}


function second_to_hh_mm_ss(second) {
	const hour = Math.floor(second / 3600);
	const minute = Math.floor(second / 60);
	second = second % 60

	return `${hour}:${minute}:${second}`;
}

export function parse_tracks_from_chapters(chapters) {
	return chapters.map((chap) => {
		return { ss: second_to_hh_mm_ss(chap.start_time), t: second_to_hh_mm_ss(chap.end_time), title: chap.title};
	})
}


export function parse_tracks_from_yt_info(info) {
	if (info.chapters && info.chapters.length > 1) {
		return parse_tracks_from_chapters(info.chapters);
	}

	return parse_tracks_from_text(info.description);
}

const regexs_artist_album = [
	{
		regex: new RegExp(/(.*)[-|–](.*)((?:\(.*\))|(\[.*\]))/),
		artist_match_index: 1,
		album_match_index: 2,
	},
	{
		regex: new RegExp(/((\(.*\))|(\[.*\]))/),
		artist_match_index: 1,
		album_match_index: 2,
		year_match_index: 3,
	}
];

const regex_year = new RegExp(/.*([0-9]{4}).*/);

export function parse_artist_album_from_text(text) {
	for(let i = 0; i < regexs_artist_album.length; i++) {
		const regex = regexs_artist_album[i];
		const match = text.match(regex.regex);
		if (match && match.length > regex.album_match_index) {
			const match_year = text.match(regex_year);
			return {
				artist: match?.[regex.artist_match_index]?.trim() || '',
				album: match?.[regex.album_match_index]?.trim() ,
				year: match_year && match_year[1],
			}
		}
	}

	return {};
}