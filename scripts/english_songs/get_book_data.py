import json
import requests
from pathlib import Path

parent_dir = Path(__file__).resolve().parent.parent

with open(Path.joinpath(parent_dir, "lib/songList.json")) as f:
    song_list = json.loads(f.read())

for song in song_list:
    markdown_url = song["md"]
    text = ""
    if markdown_url != "":
        response = requests.get(markdown_url)
        # to get utf-9 encoding for special characters
        text = response.content.decode("utf-8", "ignore")

    # rawText = text.encode("utf-8")
    # text = rawText.decode("utf-8", "replace")
    if markdown_url == "":
        print(song["name"])
    with open(
        Path.joinpath(
            parent_dir, f"songContent/english/{song['hymn']}_{song['page_number']}.md",
        ),
        "w",
        encoding="utf-8",
    ) as f:
        f.write(text)
