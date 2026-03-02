import json
from pathlib import Path
import os

"""
This file is a collection of scripts to update mappings and content. Change the __name__ == __main__ to use a specific script
"""

parent_dir = Path(__file__).resolve().parent.parent.parent


def get_song_slug(hymn: str, page_number: str) -> str:
    return f"{hymn}_{page_number}"


def update_h12_mappings():
    """
    Update h12 mapping to the newest addition
    """
    with open("lib/chineseSongList.json", "r") as f:
        songList = json.loads(f.read())

    slugs_updated = []

    # OLD H12 pg23 => 40 need +1
    for song in songList:
        if song["hymn"] == "H12":
            pagenum = int(song["pagenum"])
            old_pagenum = str(song["pagenum"])
            old_slug = song["slug"]
            if pagenum >= 23 and pagenum <= 40:
                song["pagenum"] = pagenum + 1

            elif pagenum >= 42 and pagenum <= 53:
                song["pagenum"] = pagenum + 2
            elif pagenum >= 53 and pagenum <= 62:
                song["pagenum"] = pagenum + 3
            elif pagenum >= 63 and pagenum <= 79:
                song["pagenum"] = pagenum + 4
            elif pagenum == 80:
                song["pagenum"] = 85
            else:
                continue

            print(
                f"Changing slug from {old_slug} to {get_song_slug('H12', song['pagenum'])}"
            )
            song["slug"] = get_song_slug("H12", song["pagenum"])
            song["songtext"] = song["songtext"].replace(
                old_pagenum, str(song["pagenum"]), 1
            )
            song["songname"] = song["songname"].replace(
                old_pagenum, str(song["pagenum"]), 1
            )

            os.rename(
                Path.joinpath(
                    parent_dir,
                    f"songContent/chinese/{old_slug}.md",
                ),
                Path.joinpath(
                    parent_dir,
                    f"songContent/chinese/{song['slug']}_temp.md",
                ),
            )

            slugs_updated.append(song["slug"])

    with open(
        Path.joinpath(parent_dir, "lib/chineseSongList.json"), "w", encoding="utf8"
    ) as f:
        # ensure chinese stays the same
        json.dump(songList, f, ensure_ascii=False)

    for slug in slugs_updated:
        os.rename(
            Path.joinpath(parent_dir, f"songContent/chinese/{slug}_temp.md"),
            Path.joinpath(
                parent_dir,
                f"songContent/chinese/{slug}.md",
            ),
        )


def remove_unnecessary_fields_chinese():
    with open("lib/chineseSongList.json", "r") as f:
        songList = json.loads(f.read())

    for song in songList:
        del song["translate"]
        del song["type"]
        del song["tag"]
        del song["music"]

    with open(
        Path.joinpath(parent_dir, "lib/chineseSongList.json"), "w", encoding="utf8"
    ) as f:
        # ensure chinese stays the same
        json.dump(songList, f, ensure_ascii=False)


if __name__ == "__main__":
    remove_unnecessary_fields_chinese()