import json
import os
from pathlib import Path

parent_dir = Path(__file__).resolve().parent.parent.parent

with open(
        Path.joinpath(parent_dir, f"lib/chineseSongList.json"), "r", encoding="utf8"
    ) as f:
        chinese_song_list = json.loads(f.read())

songs_with_mp3 = {}
chineseSongAudioDir = Path.joinpath(parent_dir, f"public/song-audio/chinese").glob('*')
for i in chineseSongAudioDir:
    file_name = os.path.basename(i)
    # skip
    if file_name == "README.md":
        continue
    
    song_slug = file_name.split(".")[0]
    songs_with_mp3[song_slug] = 1

for song in chinese_song_list:
    slug = song["slug"]
    if slug in songs_with_mp3:
        song["mp3"] = f"/song-audio/chinese/{slug}.mp3"


with open(
        Path.joinpath(parent_dir, f"lib/chineseSongList.json"), "w", encoding="utf8"
    ) as f:
        json.dump(chinese_song_list, f, ensure_ascii=False)