import json
import shutil
from pathlib import Path

parent_dir = Path(__file__).resolve().parent.parent.parent

# 1. Load mappingIndex and create a dictionary mapping chineseKey to portugueseKey
with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"),
    encoding="utf8",
) as f:
    mapping_index = json.loads(f.read())

# Create a mapping from chineseKey to portugueseKey
chinese_to_portuguese = {}
for mapping in mapping_index:
    if "chineseKey" in mapping and "portugueseKey" in mapping:
        chinese_key = mapping["chineseKey"]
        portuguese_key = mapping["portugueseKey"]
        chinese_to_portuguese[chinese_key] = portuguese_key

# 2. Load portugueseSongList.json
with open(
    Path.joinpath(parent_dir, "lib/song-list/portugueseSongList.json"),
    encoding="utf8",
) as f:
    portuguese_song_list = json.loads(f.read())
    songs = portuguese_song_list["songs"]

# Create a mapping from slug to song for quick lookup
song_by_slug = {song["slug"]: song for song in songs}

# 3. Define the audio folder and output folder
audio_folder = Path.home() / "Downloads/portuguese_songs"
output_folder = parent_dir / "public/song-audio/portuguese"

# Create output folder if it doesn't exist
output_folder.mkdir(parents=True, exist_ok=True)

# Track skipped files
skipped_files = []

# 4. Process each audio file
if audio_folder.exists():
    for audio_file in audio_folder.glob("*.mp3"):
        file_name = audio_file.name
        print(f"Processing audio file: {file_name}")

        # Trim, split into spaces and take the first element
        first_part = file_name.split()[0]

        # Convert the format to chinese_hymn_key
        # 1.20 -> H1_20, E-25 -> EL_25, H23.20 -> HC23_20
        if first_part.startswith("E"):
            chinese_hymn_key = first_part.replace("-", "_").replace("E", "EL")
        elif first_part.startswith("H"):
            chinese_hymn_key = "HC" + first_part[1:].replace(".", "_")
        else:
            chinese_hymn_key = "H" + first_part.replace(".", "_")

        print(f"  Converted to chinese_hymn_key: {chinese_hymn_key}")

        # Get the corresponding portugueseKey from the mapping
        portuguese_key = chinese_to_portuguese.get(chinese_hymn_key)
        if not portuguese_key:
            print(f"  ERROR: No portuguese key found for {chinese_hymn_key}. Skipping.")
            skipped_files.append(
                {"file_name": file_name, "chinese_hymn_key": chinese_hymn_key}
            )
            continue

        print(f"  Mapped to portugueseKey: {portuguese_key}")

        # Rename the file to portugueseKey + .mp3
        new_file_name = f"{portuguese_key}.mp3"
        new_file_path = output_folder / new_file_name

        # Move to public/song-audio/portuguese/
        shutil.copy(audio_file, new_file_path)
        print(f"  Copied to {new_file_path}")

        # Update the song in the songs list
        song = song_by_slug.get(portuguese_key)
        if song:
            song["mp3"] = f"/song-audio/portuguese/{new_file_name}"
            print(f"  Updated song {portuguese_key} with mp3 path: {song['mp3']}")
        else:
            print(
                f"  ERROR: Song with slug {portuguese_key} not found in song list. Skipping."
            )
            skipped_files.append(
                {"file_name": file_name, "chinese_hymn_key": chinese_hymn_key}
            )

# 5. Write back to portugueseSongList.json
with open(
    Path.joinpath(parent_dir, "lib/song-list/portugueseSongList.json"),
    "w",
    encoding="utf8",
) as f:
    f.write(json.dumps(portuguese_song_list, ensure_ascii=False, indent=4))

print(
    f"Successfully processed Portuguese audio files and updated portugueseSongList.json"
)

# Print skipped files
if skipped_files:
    print(f"\nSkipped {len(skipped_files)} files:")
    for skipped in skipped_files:
        print(
            f"  - File: {skipped['file_name']}, Chinese Key: {skipped['chinese_hymn_key']}"
        )
else:
    print("\nNo files were skipped.")

import ipdb

ipdb.set_trace()
