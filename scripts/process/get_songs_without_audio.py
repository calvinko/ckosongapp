import json
from pathlib import Path
import os

with open("lib/songList.json", "r") as f:
    data = json.loads(f.read())
    songList = data["songs"]

songs = []
for song in songList:
    if (
        (song.get("hymn") == "SOL2")
        and len(song.get("mp3", "")) == 0
        # and len(song.get("instrumentalMp3", "")) == 0
        # and len(song.get("pianoMp3", "")) == 0
    ):
        songs.append(song)

songs.sort(key=lambda song: int(song["page_number"]))
for song in songs:
    print(song["category"], song["name"])
# ret = []
# for song in songs:
#     ret.append({"slug": f"{song['hymn']}_{song['page_number']}", "mp3": song["mp3"]})
# print(json.dumps(ret))
