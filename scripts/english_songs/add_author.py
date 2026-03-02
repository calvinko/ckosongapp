import json
import os

# Get the directory where this script is located
script_dir = os.path.dirname(os.path.abspath(__file__))

# Paths to the JSON files
raw_author_file = os.path.join(script_dir, "new_raw_author_list.json")
songlist_file = os.path.join(script_dir, "../../lib/songList.json")

# Read raw_author_hc.json
with open(raw_author_file, "r", encoding="utf-8") as f:
    raw_authors = json.load(f)

# Create a lookup map by slug
author_map = {item["slug"]: item for item in raw_authors}

# Read songList.json
with open(songlist_file, "r", encoding="utf-8") as f:
    song_data = json.load(f)

# Process each song in the songList
updated_count = 0
for song in song_data["songs"]:
    slug = song.get("slug")

    if slug and slug in author_map:
        author_info = author_map[slug]

        # Add fields from raw_author_hc.json to the song
        if author_info.get("lyricsBy"):
            song["lyricsBy"] = author_info["lyricsBy"]

        if author_info.get("musicBy"):
            song["musicBy"] = author_info["musicBy"]

        if author_info.get("translatedBy"):
            song["translatedBy"] = author_info["translatedBy"]

        updated_count += 1

# Write back to songList.json
with open(songlist_file, "w", encoding="utf-8") as f:
    json.dump(song_data, f, ensure_ascii=False, indent=4)

print(f"✓ Updated {updated_count} songs with author information")
print(f"✓ songList.json has been updated")
