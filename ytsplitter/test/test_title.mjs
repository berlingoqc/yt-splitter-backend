import { join, resolve } from 'path';
import { readFileSync } from 'fs';
import { EOL } from 'os';

import { parse_artist_album_from_text } from '../src/parser.mjs';

const __dirname = resolve();
const titleFilePath = join(__dirname, "./test/data/title.txt");

const file_line = readFileSync(titleFilePath).toString().split(EOL);


file_line.forEach((line) => {
	const output = parse_artist_album_from_text(line);

	console.log(line + EOL + JSON.stringify(output));

	if (output.album == "" || output.artist == "") {
		process.exit(1);
	}

})

