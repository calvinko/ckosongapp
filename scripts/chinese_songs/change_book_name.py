from functools import reduce
from itertools import pairwise
import re
import sys
import shutil
from pathlib import Path
import json
from typing import Dict

parent_dir = Path(__file__).resolve().parent.parent.parent
audio_dir = Path.joinpath(parent_dir, "public/song-audio/chinese")
markdown_dir = Path.joinpath(parent_dir, "songContent/chinese")
pdf_dir = Path.joinpath(parent_dir, "public/books/individual-pages/chinese")

with open(
    Path.joinpath(parent_dir, "lib/chineseSongList.json"),
    encoding="utf8",
) as f:
    chinese_meta = json.loads(f.read())
    chinese_songs = chinese_meta["songs"]

unresolved_pdf = []

# Rename PDF files for CH1/CH2 songs
for song in chinese_songs:
    if song["hymn"] not in ["S1", "S2"]:
        continue

    # Reconstruct the old slug by replacing S1/S2 back to CH1/CH2
    old_slug = song["slug"].replace("S1_", "CH1_").replace("S2_", "CH2_")

    if old_slug == song["slug"]:
        # Slug doesn't have S1 or S2, skip
        continue

    old_pdf_path = Path.joinpath(pdf_dir, f"{old_slug}.pdf")

    if old_pdf_path.exists():
        new_pdf_path = Path.joinpath(pdf_dir, f"{song['slug']}.pdf")
        try:
            shutil.move(str(old_pdf_path), str(new_pdf_path))
            print(f"✓ Renamed PDF: {old_slug}.pdf → {song['slug']}.pdf")
        except Exception as e:
            unresolved_pdf.append(
                {
                    "song": song["name"],
                    "old_slug": old_slug,
                    "new_slug": song["slug"],
                    "error": str(e),
                }
            )

print("\n" + "=" * 80)
if unresolved_pdf:
    print("UNRESOLVED PDF FILES - Needs manual review:")
    print("=" * 80)
    for item in unresolved_pdf:
        print(f"\nSong: {item['song']}")
        print(f"  Old slug: {item['old_slug']}")
        print(f"  New slug: {item['new_slug']}")
        print(f"  Error: {item['error']}")
else:
    print("All PDF files renamed successfully!")
print("=" * 80)

# # First pass: rename CH1/CH2 hymns and slugs, handle audio files
# for song in chinese_songs:
#     old_slug = song["slug"]

#     if song["hymn"] == "CH1":
#         song["hymn"] = "S1"
#         song["slug"] = song["slug"].replace("CH1_", "S1_")
#     elif song["hymn"] == "CH2":
#         song["hymn"] = "S2"
#         song["slug"] = song["slug"].replace("CH2_", "S2_")
#     else:
#         continue

#     # Handle audio file renaming if mp3 field exists
#     if "mp3" in song:
#         old_mp3 = song["mp3"]
#         # Expected pattern: /song-audio/chinese/{old_slug}.mp3 or .m4a
#         match = re.match(r"/song-audio/chinese/(.+)\.(mp3|m4a)$", old_mp3)

#         if match:
#             old_filename = match.group(1)
#             extension = match.group(2)

#             # Check if the old file exists
#             old_file_path = Path.joinpath(audio_dir, f"{old_filename}.{extension}")

#             if old_file_path.exists():
#                 new_file_path = Path.joinpath(audio_dir, f"{song['slug']}.{extension}")
#                 try:
#                     shutil.move(str(old_file_path), str(new_file_path))
#                     song["mp3"] = f"/song-audio/chinese/{song['slug']}.{extension}"
#                 except Exception as e:
#                     unresolved_audio.append(
#                         {
#                             "song": song["name"],
#                             "slug": song["slug"],
#                             "old_mp3": old_mp3,
#                             "error": str(e),
#                         }
#                     )
#             else:
#                 unresolved_audio.append(
#                     {
#                         "slug": song["slug"],
#                         "old_mp3": old_mp3,
#                         "error": f"File not found: {old_file_path}",
#                     }
#                 )
#         else:
#             unresolved_audio.append(
#                 {
#                     "slug": song["slug"],
#                     "old_mp3": old_mp3,
#                     "error": "mp3 path does not match expected pattern",
#                 }
#             )

#     # Handle markdown file renaming
#     old_markdown_path = Path.joinpath(markdown_dir, f"{old_slug}.md")
#     if old_markdown_path.exists():
#         new_markdown_path = Path.joinpath(markdown_dir, f"{song['slug']}.md")
#         try:
#             shutil.move(str(old_markdown_path), str(new_markdown_path))
#         except Exception as e:
#             unresolved_markdown.append(
#                 {
#                     "song": song["name"],
#                     "old_slug": old_slug,
#                     "new_slug": song["slug"],
#                     "error": str(e),
#                 }
#             )


# # Second pass: update metaToDisplay references for all songs
# # and update any mp3 fields that reference CH1 or CH2
# for song in chinese_songs:
#     # Update mp3 field if it references CH1 or CH2
#     if "mp3" in song:
#         if "CH1_" in song["mp3"] or "CH2_" in song["mp3"]:
#             song["mp3"] = song["mp3"].replace("CH1_", "S1_")
#             song["mp3"] = song["mp3"].replace("CH2_", "S2_")

#     if "metaToDisplay" in song:
#         for meta in song["metaToDisplay"]:
#             # Update the value field (e.g., "CH1 227" -> "S1 227")
#             if "value" in meta:
#                 meta["value"] = meta["value"].replace("CH1 ", "S1 ")
#                 meta["value"] = meta["value"].replace("CH2 ", "S2 ")

#             # Update the href field (e.g., "/songs/chinese/CH1_227" -> "/songs/chinese/S1_227")
#             if "href" in meta:
#                 meta["href"] = meta["href"].replace("/CH1_", "/S1_")
#                 meta["href"] = meta["href"].replace("/CH2_", "/S2_")

# with open(
#     Path.joinpath(parent_dir, "lib/chineseSongList.json"),
#     "w",
#     encoding="utf8",
# ) as f:
#     json.dump(chinese_meta, f, ensure_ascii=False)

# # Third pass: update mappingIndex.json chineseKey references
# with open(
#     Path.joinpath(parent_dir, "lib/mappingIndex.json"),
#     encoding="utf8",
# ) as f:
#     mapping_index = json.loads(f.read())

# for mapping in mapping_index:
#     if "chineseKey" in mapping:
#         mapping["chineseKey"] = mapping["chineseKey"].replace("CH1_", "S1_")
#         mapping["chineseKey"] = mapping["chineseKey"].replace("CH2_", "S2_")

# with open(
#     Path.joinpath(parent_dir, "lib/mappingIndex.json"),
#     "w",
#     encoding="utf8",
# ) as f:
#     json.dump(mapping_index, f, ensure_ascii=False)

# print("\n" + "=" * 80)
# if unresolved_audio:
#     print("UNRESOLVED AUDIO FILES - Needs manual review:")
#     print("=" * 80)
#     for item in unresolved_audio:
#         print(f"\nSong: {item.get('song', item.get('slug'))}")
#         print(f"  Slug: {item['slug']}")
#         print(f"  Old MP3: {item['old_mp3']}")
#         print(f"  Error: {item['error']}")
# else:
#     print("All audio files renamed successfully!")

# if unresolved_markdown:
#     print("\nUNRESOLVED MARKDOWN FILES - Needs manual review:")
#     print("=" * 80)
#     for item in unresolved_markdown:
#         print(f"\nSong: {item['song']}")
#         print(f"  Old slug: {item['old_slug']}")
#         print(f"  New slug: {item['new_slug']}")
#         print(f"  Error: {item['error']}")
# else:
#     print("All markdown files renamed successfully!")

# print("=" * 80)
# print("✓ Updated hymn CH1→S1 and CH2→S2 in chineseSongList.json")
# print("✓ Updated slugs CH1_→S1_ and CH2_→S2_ in chineseSongList.json")
# print("✓ Renamed markdown files in songContent/chinese/")
# print("✓ Updated metaToDisplay references in chineseSongList.json")
# print("✓ Updated chineseKey references in mappingIndex.json")
# print("=" * 80)
