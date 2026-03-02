import json
from collections import defaultdict
from pathlib import Path

"""
Update song list (See scripts/english/README.md)
"""

parent_dir = Path(__file__).resolve().parent.parent.parent


def get_song_slug(hymn: str, page_number: str) -> str:
    return f"{hymn}_{page_number}"


with open(
    Path.joinpath(parent_dir, "lib/songList.json"), "r"
) as f:
    full_meta = json.loads(f.read())

### remove image key from songs ###
song_list = full_meta["songs"]
for song in song_list:
    if "image" in song:
        del song["image"]

ret = {"songs": song_list, "hymnBooks": full_meta["hymnBooks"]}
### end ###

# with open(Path.joinpath(parent_dir, "scripts/english_songs/song_audio.json"), "r") as f:
#     raw_song_audio = json.loads(f.read())

# song_audio = {}
# for song in raw_song_audio:
#     song_audio[song["slug"]] = song

# song_list = full_meta["songs"]
# book_meta_list = full_meta["hymnBooks"]

# for song in song_list:
#     if "hasOwnSheetPdf" in song:
#         del song["hasOwnSheetPdf"]

# ret = {
#     "songs": song_list,
#     "hymnBooks": [
#         {
#             "bookFullName": "Songs of Love 1",
#             "hymnBook": "SOL1",
#             "hasOwnSheetPdf": True,
#             "songType": "english",
#             "imageUrl": "/book-covers/sol1cover.jpg"
#         },
#         {
#             "bookFullName": "Songs of Love 2",
#             "hymnBook": "SOL2",
#             "hasOwnSheetPdf": True,
#             "songType": "english",
#             "imageUrl": "/book-covers/sol2cover.jpg"
#         },
#         {
#             "bookFullName": "Hymnal 1",
#             "hymnBook": "GFH1",
#             "hasOwnSheetPdf": False,
#             "songType": "english",
#             "imageUrl": "/book-covers/gfh1cover.jpg"
#         },
#         {
#             "bookFullName": "Hymnal 2",
#             "hymnBook": "GFH2",
#             "hasOwnSheetPdf": False,
#             "songType": "english",
#             "imageUrl": "/book-covers/gfh2cover.jpg"
#         },
#         {
#             "bookFullName": "God's Beautiful Heart",
#             "hymnBook": "GBH",
#             "hasOwnSheetPdf": False,
#             "songType": "english",
#             "imageUrl": "/book-covers/gbhcover.jpg"
#         },
#         {
#             "bookFullName": "Songs of my Heart 1",
#             "hymnBook": "SOMH1",
#             "hasOwnSheetPdf": False,
#             "songType": "english"
#         },
#     ]
# }



with open(Path.joinpath(parent_dir, "lib/songList.json"), "w") as f:
    json.dump(ret, f, ensure_ascii=False)