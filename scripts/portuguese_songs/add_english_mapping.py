import json
from pathlib import Path

parent_dir = Path(__file__).resolve().parent.parent.parent

# Load the mapping index
with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"),
    encoding="utf8",
) as f:
    mapping_index = json.loads(f.read())

# Create a mapping index by chinese key for quick lookup
mapping_index_by_chinese_key = {
    song["chineseKey"]: song
    for song in mapping_index
    if "chineseKey" in song and "englishKey" in song
}

# Find all entries with portugueseKey that starts with P2025
# and get their chineseKey
portuguese_to_chinese = {}
for song in mapping_index:
    if "portugueseKey" in song and "chineseKey" in song:
        if song["portugueseKey"].startswith("P2025"):
            portuguese_to_chinese[song["portugueseKey"]] = song["chineseKey"]

# Now create new mappings for english keys
new_mappings_for_english = []
for portuguese_key, chinese_key in portuguese_to_chinese.items():
    # Check if there's an english key for this chinese key
    if chinese_key in mapping_index_by_chinese_key:
        english_key = mapping_index_by_chinese_key[chinese_key]["englishKey"]
        new_mappings_for_english.append(
            {
                "portugueseKey": portuguese_key,
                "englishKey": english_key,
            }
        )

# Add the new mappings to the mapping index
mapping_index.extend(new_mappings_for_english)

# Write the updated mapping index back to the file
with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"),
    "w",
    encoding="utf8",
) as f:
    f.write(json.dumps(mapping_index, ensure_ascii=False, indent=4))

print(
    f"Added {len(new_mappings_for_english)} new English mappings for Portuguese songs."
)
