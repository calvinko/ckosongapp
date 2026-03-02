# Editing Songs

`hymns` and `songs` are used interchangeably. `book` and `hymn books` are used interchangeably.

## Basics

Songs have a couple key fields in it's metadata:
- `slug`: this is the identifier we use for a song. It comes in the format of `{HymnBook shorthand}_{page number}`. For example, for Songs of Love 2, page 3 is `SOL2_3`. You will find that slug in the url of the song - https://songapp.vercel.app/songs/english/SOL2_3. You can find the shorthands of each song in `lib/constants.ts#HymnBook`
- `songType`: the type of the song, which is `chinese` or `english`

A song's metadata is stored in either `lib/songList.json` for english songs and `lib/chineseSongList.json`. We call these song lists. These hold *all* of the songs available in the app. The list of songs is in the key `songs`.

A song's lyrics are stored in the folder `songContent/*`. Each file is a markdown file of a song, with the name being its slug.

We also store hymn book metadata. You will find that in the key: `hymnBooks` in the song list.

## How we display these songs

In order for the app to serve these songs quickly, we auto-generate a final "song list" json, which includes the lyrics itself. So whenever the song lists are updated or the lyrics are updated, we need to regenerate this file. This can be done locally by `yarn write-song-list` and if you have it setup, it is also a pre-commit hook so it will automatically run before you commit and push. If you update on github, *you will not see the changes until I regenerate it*.

In addition, we also have client caching. So you may need to bump the cache version for the updates to take affect. This is done in `lib/reducers.ts#SONG_STATE_VERSION`. Please let me know beforehand if you bump. 

## Song Metadata

We store additional metadata about a song, which may show in the song page. Some you should know:

- `key`: This is the original song key, meaning the music key that the song sheet suggested (usually on the top left corner of the song sheet). So, it would be `E♭ 4/4` or `C 3/4`. Please include the time signature, if available. This will show in the "Details" Box in the song page.
- `start_key`: Since the original key in the song may be too "high" for normal people to sing, this is a suggested key to sing in. *Please do not touch this. Make a feedback submission if you have a suggestion for a song.* This will show in the "Details" Box in the song page.
- `mp3`: An mp3 link to a recording of the song (with a singer + music). See section for adding audio for more details.
- `instrumentalMp3`: mp3 link. Back up recording for just instrumental music. See section for adding audio for more details.
- `pianoMp3`: mp3 link. Back up recording for just piano music. See section for adding audio for more details.
- `metaToDisplay`: Unique list of key-value pairs for metadata to show in the "Details" Box in the song page.


## Adding Additional Metadata
As mentioned above, there is the metadata `metaToDisplay`, which is a unique list of key-value pairs for metadata to show in the "Details" Box in the song page.

If you want to add a new metadata to show, keep in mind:

- The `key` should be very clear and concise. It should not be long.
- The `key` should be something you can apply to multiple songs
- The `key` should be consistent across the songs (keep the same capitalization, et)
- The `key` should provide something meaningful about the song to the viewer, but not distract them

An example:
```
"metaToDisplay": [
    {
        "key": "Old Page",
        "value": "pg 3"
    },
    // and more...
]
```

## Adding Audio

In order to add audio to show up in the song page, you need to first upload it to the folder `public/song-audio/{chinese or english}/` with the name as it's slug so `SOS_4.mp3`. We support various audio file types.

Then, according to the song audio, if it's a recording of singing + music, or just instrumentals, or just piano, add it's path to the corresponding metadata key.

So if it's a recording of the song (singing + music), it would be like:
```
"mp3": "/song-audio/english/SOS_4.mp3" // skip the `public` part
```

Note how you need to keep the extension there. If it's m4a, then make it `SOS_4.m4a`, etc. You may skip the `public/` prefix of the path.


## Adding Song Sheets

Song sheets are the actual pdf sheet with the music notes for a song. It should come from the actual hymnal.

In order for a song sheet to be embedded:
- User needs to have access (via token or role in their account)
- The song's metadata has the field `hasSongSheet: true`
- The user wants to embed the song sheet 

When adding song sheets for songs, we should add all song sheets for at least one hymnal book at a time. Meaning, at once, we add all the song sheets for Songs of Love 2 (SOL2). Do not add song sheet for one song, one at a time. To do so:

1. Put all the sheet pdfs in the folder `public/songs/individual-songs/{chinese or english}/`. Name each song sheet by the song's slug (`SOL2_14.pdf`)
2. Once you have all song sheets in the proper folder, go to song lists and find the book under the key: `hymnBooks` and mark `"hasOwnSheetPdf": true`.
3. Run `yarn write-song-list` to auto-generate the full song list. (This I can do as well if you don't have everything set up)