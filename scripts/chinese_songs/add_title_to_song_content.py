from functools import reduce
from itertools import pairwise
import re
import sys
from pathlib import Path
import json
from typing import Dict

parent_dir = Path(__file__).resolve().parent.parent.parent


with open(
    Path.joinpath(parent_dir, "lib/chineseSongList.json"),
    encoding="utf8",
) as f:
    chinese_meta = json.loads(f.read())
    chinese_songs = chinese_meta["songs"]
    chinese_songs_by_name = {song["name"]: song for song in chinese_songs}

error = []

for song in chinese_songs:
    slug = song["slug"]
    with open(
        Path.joinpath(parent_dir, f"songContent/chinese/{slug}.md"),
        "r",
        encoding="utf8",
    ) as f:
        lines = f.readlines()

    with open(
        Path.joinpath(parent_dir, f"songContent/chinese/{slug}.md"),
        "w",
        encoding="utf8",
    ) as f:
        if len(lines) == 0:
            error.append(slug)
        elif "#" in lines[0]:
            error.append(slug)
            # import ipdb

            # ipdb.set_trace()
        else:
            song_name = song["name"]
            lines.insert(0, f"# {song_name}\n\n")
            f.writelines(lines)
    # import ipdb

    # ipdb.set_trace()

print(error)
import ipdb

ipdb.set_trace()
