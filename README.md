# Song App

Note: we cannot auto generate lyrics anymore because some are already manually updated.
We also cannot autogenerate the song list mappings as well. We can update the mappings though, just not from the original source.

## Features

- Viewing English and Chinese Hymns and lyrics
- Searching hymns by Song location, title, lyrics
- Mappings from Chinese hymns <-> English hymns
- Favoriting hymns and syncing across devices via accounts
- Profiles
- Song Audio mp3 and/or instrumentals
- Related Songs with stanzas

**More (hidden) features**

- Viewing Song Sheets for certain english hymns
- Make a Melody

## Development

To run:

```
yarn
yarn dev
```

If song lists aren't updated, you may try:
1. `yarn write-song-list` This will re-generate the `lib/generated/actualSongList.json` that the app uses, which comes from `songList.json`, `chineseSongList.json` and the `songContent/*` md files per song lyrics. (This shouldn't happen much since this command is run on pre-commit)
2. ~~Bump `SONG_STATE_VERSION`. This will tell the client to refresh it's local redux cache (stored in local storage)~~


For editing songs, see [Editing Songs Documentation](docs/editing-songs.md)

### Repository structure
```
.
├── components              # React components
├── pages                   # represents pages and api for app
├── lib
│   ├── generated               # Generated files folder
│   │   └── actualSongList.json # Generated English and Chinese Song Index that the app directly uses
│   ├── scripts                 # Scripts folder
│   │   └── writeSongListWithContent.ts         # Script that writes `actualSongList.json`. It's added to a precommit hook
│   ├── chineseSongList.json    # Chinese Song index that we update by hand.
│   ├── songList.json           # English Song index that we update by hand.
│   ├── mappingIndex.json       # Chinese <-> English song mapping that we update by hand
│   └── ...                     # etc.
├── songContent
│   ├── chinese                 # Folder holding chinese song lyrics
│   │   └── ...
│   ├── english                 # Folder holding english song lyrics
│   │   └── ...
├── scripts                     # scripts to parse data from different sources and generates the indices in `/lib` and post-processing
│   ├── chinese_songs           # Folder holding scripts to parse chinese songs from raw source
│   │   └── README.md           # read this for instructions
│   │   └── ...
│   ├── english_songs           # Folder holding scripts to parse english songs from raw source
│   │   └── README.md           # read this for instructions
│   │   └── ...
│   ├── process                                       # Folder holding scripts to post process the data
│   │   └── README.md                                 # read this for instructions
│   │   └── get_songs_with_abnormal_slug.py           # script to get the chinese songs that are in the same page
│   │   └── test_mapping_index.py                     # test mapping index and ensure consistency
│   │   └── ...
├── models                  # Folder holding all the mongodb models
|   └── ...
├── ts                          # Types Representations
│   ├── songMeta.interface.ts   # Song Meta data type (indices must have all these fields or we must able to generate these fields from the index)
│   ├── song.interface.ts       # Song data type (indices must have all these fields or we must able to generate these fields from the index)
│   ├── ...
└── ...
```

---

Songs cannot be generated from original sources anymore because we've updated the lists and indices. Whenever changing the song list, you need to update the SONG_STATE_VERSION in `lib/redux/reducers.ts`
so the local storage browser side can be refreshed.
