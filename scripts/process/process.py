import json
from pathlib import Path

parent_dir = Path(__file__).resolve().parent.parent.parent


def remove_new_line(song):
    with open(
        Path.joinpath(parent_dir, f"songContent/chinese/{song['slug']}.md"), "r"
    ) as f:
        songtext = f.read()
        songtext = songtext.replace("\n\n", "\n")

    print(f"updating song name={song['name']} slug={song['slug']}")

    # write it
    with open(
        Path.joinpath(
            parent_dir,
            f"songContent/chinese/{song['slug']}.md",
        ),
        "w",
        encoding="utf8",
    ) as f:
        f.write(songtext)


"""
DEFINE PROCESSING METHODS ABOVE

REPLACE BELOW ON WHAT TO DO
"""


#### Writing methods #####
def write_chinese_song_list(chinese_meta):
    with open(
        Path.joinpath(parent_dir, "lib/chineseSongList.json"), "w", encoding="utf8"
    ) as f:
        # ensure chinese stays the same
        json.dump(chinese_meta, f, ensure_ascii=False, indent=4)


############################
with open("lib/chineseSongList.json", "r") as f:
    chinese_meta = json.loads(f.read())
    songList = chinese_meta["songs"]
with open("lib/songList.json", "r") as f:
    english_meta = json.loads(f.read())

need_to_process = songList
# list(filter(lambda song: song["hymn"] == "H18", songList))

for song in need_to_process:

    if "songnum" in song:
        del song["songnum"]

    song["page_number"] = song["pagenum"]
    del song["pagenum"]

    # method here
    continue

chinese_meta["songs"] = need_to_process
write_chinese_song_list(chinese_meta)
