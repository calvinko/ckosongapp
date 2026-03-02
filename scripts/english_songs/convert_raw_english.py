import json
from collections import defaultdict
from pathlib import Path

"""
Converts the raw song list to have the clean song list

rawSongList.json => songList.json

scripts/english_songs/get_data.py gets the rawSongList.json

this is so we can make diffs against the source (some excel sheet)
"""

parent_dir = Path(__file__).resolve().parent.parent.parent


def get_song_slug(hymn: str, page_number: str) -> str:
    return f"{hymn}_{page_number}"


with open(
    Path.joinpath(parent_dir, "scripts/english_songs/rawSongList.json"), "r"
) as f:
    prev_json = json.loads(f.read())

with open(Path.joinpath(parent_dir, "scripts/english_songs/song_audio.json"), "r") as f:
    raw_song_audio = json.loads(f.read())

song_audio = {}
for song in raw_song_audio:
    song_audio[song["slug"]] = song

# delete unnecssary fields and create new fields, if needed
songs = []
for song in prev_json:
    del song["created_at"]
    del song["updated_at"]
    del song["last_edited_email"]
    del song["chords"]
    del song["prioritized"]
    del song["reviewing"]
    del song["finalized"]
    del song["chords_boolean"]
    del song["prioritized_boolean"]
    del song["reviewing_boolean"]
    del song["_tags"]
    del song["tags"]
    del song["midi"]
    del song["lang"]
    del song["version"]
    del song["comments"]
    del song["finalized_boolean"]
    del song["violin"]
    song["slug"] = get_song_slug(song["hymn"], song["page_number"])
    song["isChinese"] = False

    if song["slug"] in song_audio:
        song["mp3"] = song_audio[song["slug"]]["mp3"]
        if "instrumentalMp3" in song_audio[song["slug"]]:
            song["instrumentalMp3"] = song_audio[song["slug"]].get("instrumentalMp3", "")
    songs.append(song)

# we want to put each song next to it's neighbor. so we need to group songs by it's hymn book
# and then sort it by it's page_number
song_by_book = defaultdict(list)
for song in songs:
    song_by_book[song["hymn"]].append(song)

for key, song_list in song_by_book.items():
    song_list.sort(key=lambda song: int(song["page_number"]))

ret = []
for key, song_list in song_by_book.items():
    ret.extend(song_list)

with open(Path.joinpath(parent_dir, "lib/songList.json"), "w") as f:
    json.dump(ret, f, ensure_ascii=False)