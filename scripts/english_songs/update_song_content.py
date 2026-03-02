import json
from pathlib import Path
import re

parent_dir = Path(__file__).resolve().parent.parent.parent

with open("lib/songList.json", "r") as f:
    songList = json.loads(f.read())["songs"]






"""
The following finds songs with stanzas and adds a space between the `1.` and the lyrics. So.. `1.More than fearfully created,` becomes `1. More than fearfully created,`

"""
for song in songList:
    with open(
        Path.joinpath(parent_dir, f"songContent/english/{song['slug']}.md"), "r"
    ) as f:
        songtext = f.read()
        occurences = re.findall(r"\d+\.", songtext)
        new_lyrics = songtext
        for stanza_text in occurences:
            # re.split includes "" in the beginning if the matched text starts in the beginning, same for the end
            split_arr = re.split(stanza_text, new_lyrics)
            new_lyrics = ""
            for idx, substring in enumerate(split_arr):
                if idx == len(split_arr) - 1:
                    new_lyrics += substring
                else:
                    new_lyrics += substring + stanza_text + " "

        # print(f"updating song name={song['slug']} lyrics=", new_lyrics)

    # # write it
    with open(
        Path.joinpath(
            parent_dir,
            f"songContent/english/{song['slug']}.md",
        ),
        "w",
        encoding="utf8",
    ) as f:
        f.write(new_lyrics)
