import json

# to get songs that appear in the same page like H1_1_0.md

with open("lib/chineseSongList.json", "r") as f:
    songList = json.loads(f.read())

for song in songList:
    if len(song["slug"].split("_")) == 3:
        print(song["slug"])
