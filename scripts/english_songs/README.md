## Getting Raw data for english songs

We've updated mappings manually on `songList.json` so we cannot go from rawSongList.json to songList.json, rendering many of the scripts useless. Use `update_song_list.py` to update the songList.json instead.

---

We got our initial data from some excel sheet (see `get_data.py`). This then outputs `rawSongList.json`. We keep this raw json from this initial data to diff here and here to see if there are updates that we can make.

But we also have added our own data as well..

Currently, we have only started adding new audio links that we store here. So we stored those mappings in `song_audio.json`.

And then `convert_raw_english.py` stitches `rawSongList.json` with `song_audio.json` to create `lib/songList.json`.
