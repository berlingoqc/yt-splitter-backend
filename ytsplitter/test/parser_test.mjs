import test from 'node:test';
import assert from 'node:assert/strict';

import { readdirSync, readFileSync } from 'fs';
import { join, resolve } from 'path';

import { parse_tracks_from_text } from '../src/parser.mjs';

const __dirname = resolve();
const trackFolder = join(__dirname, "./test/data/tracks");


function test_track_file(track, nbr_track, t) {
	const tracks = parse_tracks_from_text(readFileSync(join(trackFolder, track)).toLocaleString());
	if (t) {
		t.diagnostic(tracks);
	}

	assert.equal(tracks.length, nbr_track);
}


test('parser p0', (t) => test_track_file("p0.txt", 10, t));
test('parser p1', (_t) => test_track_file("p1.txt", 8));
//test('parser p2', (_t) => test_track_file("p2.txt", 15));
test('parser p3', (_t) => test_track_file("p3.txt", 5));
test('parser p4', (_t) => test_track_file("p4.txt", 10));
test('parser p5', (_t) => test_track_file("p5.txt", 21));
