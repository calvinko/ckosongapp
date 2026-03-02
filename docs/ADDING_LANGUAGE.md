# How to Add a New Language

To add a new language to the Song App, follow these steps:

- **Update SongType Enum**
  - Edit the file: [`lib/constants.ts`](https://github.com/tko22/song-app/blob/main/lib/constants.ts)
  - Find the `SongType` enum and add your new language as an entry (e.g., `tamil = "tamil"`).
  - If using the mini-app, also update [`mini/src/utils/constants.ts`](https://github.com/tko22/song-app/blob/main/mini/src/utils/constants.ts).

- **Add Song Book(s) for the Language**
  - Add your new song book(s) in the appropriate data file in the `lib/song-list/` folder (e.g., `lib/song-list/tamilSongList.json`).
  - Include all metadata required by the app (title, language type, unique acronym).

- **Add Songs in the New Language**
  - Insert new song entries in the relevant file in `lib/song-list/` (e.g., `tamilSongList.json`).
  - Each song should specify the new `songType` and reference the correct song book.

---

## Example: Changes in `scripts/write-song-list.ts`

When adding a new language, you need to update the script to handle the new song list file and type.

- Add a new import for your language's song list JSON file.
- Update logic to process the new language (e.g., Tamil).
- Example diff for Tamil:

```typescript
// Before
import englishSongs from '../song-list/englishSongList.json';
import chineseSongs from '../song-list/chineseSongList.json';

// After
import englishSongs from '../song-list/englishSongList.json';
import chineseSongs from '../song-list/chineseSongList.json';
import tamilSongs from '../song-list/tamilSongList.json';

// Before
const allSongs = {
  ...englishSongs,
  ...chineseSongs,
};

// After
const allSongs = {
  ...englishSongs,
  ...chineseSongs,
  ...tamilSongs,
};
```

- Update any type checks or dynamic loading to reference the new SongType (e.g., `SongType.tamil`).

**References:**

- SongType enum: [`lib/constants.ts`](https://github.com/tko22/song-app/blob/main/lib/constants.ts)
- Song lists: `lib/song-list/`
- Script: [`scripts/write-song-list.ts`](https://github.com/tko22/song-app/blob/main/scripts/write-song-list.ts)
