from functools import reduce
from itertools import pairwise
import re
import sys
from pathlib import Path
import requests
import json
from typing import Dict

"""
Download all the mp3 and store them and update the index
"""


parent_dir = Path(__file__).resolve().parent.parent.parent

with open(Path.joinpath(parent_dir, "lib/songList.json"), "r") as f:
    song_meta = json.loads(f.read())
    songs = song_meta["songs"]

for song in songs:
    mp3 = song.get("mp3")
    if mp3 is None:
        continue
    if "s3.amazon" not in mp3:
        continue

    slug = song["slug"]
    # download the mp3
    doc = requests.get(mp3)
    with open(
        Path.joinpath(parent_dir, f"public/song-audio/english/{slug}.mp3"), "wb"
    ) as f:
        f.write(doc.content)

    # update the song meta
    song["mp3"] = f"/song-audio/english/{slug}.mp3"

ret = {"songs": songs, "hymnBooks": song_meta["hymnBooks"]}
with open(Path.joinpath(parent_dir, "lib/songList.json"), "w") as f:
    json.dump(ret, f, ensure_ascii=False)
