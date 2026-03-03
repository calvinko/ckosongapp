#!/usr/bin/env node
import { promises as fs } from 'fs';
import path from "path";
import { FullMetaWithContent } from '../../ts/types/songMeta.interface';
import { getAllSongsWithContent } from "../songs/fetchSongsWithContent"
import HymnBookMeta from '../../ts/types/hymnBookMeta.interface';

const MINI_HIDE_BOOK_HYMN = ["HC3", "CHC3", "H22", "H23"]

const handle = async () => {
  const data = await getAllSongsWithContent();
  const songListPath = path.join(
    process.cwd(),
    `lib/generated/actualSongList.json`
  );
  const miniSongListPath = path.join(
    process.cwd(),
    `mini/src/data/miniSongList.json`
  );

  const miniHymnBooks: { [key: string]: HymnBookMeta } = Object.values(data.hymnBooks)
    .filter(book => !MINI_HIDE_BOOK_HYMN.includes(book.hymnBook))
    .filter(book => book.isSearchable !== false)
    .reduce((a, v) => ({ ...a, [v?.hymnBook]: v }), {})

  const miniSongs = Object.values(data.songs)
    .filter(song => song.hymn in miniHymnBooks)
    .filter(song => !MINI_HIDE_BOOK_HYMN.includes(song.hymn))
    .reduce((a, v) => ({ ...a, [v?.slug]: v }), {})

  const miniData: FullMetaWithContent = {
    songs: miniSongs,
    hymnBooks: miniHymnBooks,
    melodyClusters: data.melodyClusters
  }

  await fs.writeFile(songListPath, JSON.stringify(data, null, 4), 'utf8');
  await fs.writeFile(miniSongListPath, JSON.stringify(miniData, null, 4), 'utf8');
}

handle();

process.on('unhandledRejection', (error) => {
  // Will print "unhandledRejection err is not defined"
  console.error('ERROR: unhandledRejection for writing song list with content' + error)
  process.exit(1)
})
