# 1. Read chineseSongList.json and filter by book name CHC3
# 2. for each song, use the slug to create a markdown file in the path ../songContent/chinese/ e.g. CHC3_1.md
# 3. In the markdown file add a heading with the name of the song
import json
import os
import re

# Read the JSON file
with open("lib/chineseSongList.json", "r") as f:
    data = json.load(f)

# Filter by book name CHC3
filtered_songs = [song for song in data["songs"] if song.get("hymn") == "CHC3"]

# Create markdown files
for song in filtered_songs:
    slug = song.get("slug")
    name = song.get("name")
    if slug and name:
        # check if file exists, if it does, not overwrite

        filename = f"./songContent/chinese/{slug}.md"
        if not os.path.exists(filename):
            with open(filename, "w") as f:
                f.write(f"# {name}")
            print(f"Created file: {filename}")
        else:
            print(f"File already exists: {filename}")
