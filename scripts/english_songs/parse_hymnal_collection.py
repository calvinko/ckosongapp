from functools import reduce
from itertools import pairwise
import re
import sys
from pathlib import Path
import json
from typing import Dict
from pypdf import PdfReader
from pikepdf import Pdf, OutlineItem, Page


parent_dir = Path(__file__).resolve().parent.parent.parent
# for reading outlines
reader = PdfReader(parent_dir / "public/books/HC1.pdf")
# for cutting the pdfs
the_pdf = Pdf.open(parent_dir / "public/books/HC1.pdf")

outlines = reader.outline

with open(
    Path.joinpath(parent_dir, "lib/songList.json"),
    encoding="utf8",
) as f:
    english_meta = json.loads(f.read())
    english_songs = english_meta["songs"]
    english_songs_by_name = {song["name"].lower(): song for song in english_songs}
    non_hc1_english_songs = filter(lambda song: song["hymn"] != "HC1", english_songs)
    english_songs_without_hc1_by_name = {
        song["name"].lower(): song for song in non_hc1_english_songs
    }
    hc1_songs = list(filter(lambda song: song["hymn"] == "HC1", english_songs))

with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"),
    encoding="utf8",
) as f:
    mapping_index = json.loads(f.read())
    mapping_index_by_english_key = {song["englishKey"]: song for song in mapping_index}

##################################################
# 1. Parse out some songs out of the outline of the pdf
##################################################
# new_songs = []
# names = []
# for idx, outline in enumerate(outlines):
#     if idx % 2 != 0:
#         continue

#     outline_title = outline.title
#     name = outline_title.split("\t")[1].strip()

#     song_meta = {
#         "slug": "HC_",
#         "page_number": "",
#         "category": "HC ",
#         "name": name,
#         "isChinese": False,
#     }

#     old_song = english_songs_by_name.get(name.lower())
#     if old_song is not None:
#         if "mp3" in old_song:
#             song_meta["mp3"] = old_song.get("mp3")
#         if "pianoMp3" in old_song:
#             song_meta["pianoMp3"] = old_song.get("pianoMp3")
#         song_meta["key"] = old_song.get("key")
#         song_meta["metaToDisplay"] = [
#             {
#                 "key": "Old Hymn Book",
#                 "value": f"{old_song['hymn']} {old_song['page_number']}",
#                 "href": f"/songs/english/{old_song['slug']}",
#             }
#         ]
#     else:
#         new_songs.append(name)

#     english_songs.append(song_meta)
##################################################

##################################################
# 2. Get lyrics for old songs from markdown
##################################################
# no_lyrics = []
# for song in english_songs:
#     if "hymn" not in song:
#         print(song)
#         continue
#     if song["hymn"] == "HC1":
#         name = song["name"].lower()
#         if name in english_songs_without_hc1_by_name:
#             old_song = english_songs_without_hc1_by_name[name]
#             old_slug = old_song["slug"]
#             with open(
#                 Path.joinpath(parent_dir, f"songContent/english/{old_slug}.md")
#             ) as f:
#                 old_song_content = f.readlines()

#             # write to new md file with song's slug
#             with open(
#                 Path.joinpath(parent_dir, f"songContent/english/{song['slug']}.md"), "w"
#             ) as f:
#                 f.writelines(old_song_content)
#         else:
#             no_lyrics.append(song["slug"])
# print(no_lyrics)
##################################################


##################################################
# 3. Cut the pdf based off of the page numbers
##################################################
# assume sorted
# actual_page_splits = [int(song["page_number"]) for song in hc1_songs]

# for i, (start_page, end_page) in enumerate(pairwise(actual_page_splits)):
#     song = hc1_songs[i]
#     dst = Pdf.new()
#     # for the cases where there's the same song on the same pdf page (then we need to increase the index)
#     # e.g. 5, 5 => 5, 6 to write the pdf on page 5
#     if end_page == start_page:
#         end_page = end_page + 1
#     dst.pages.extend([the_pdf.pages[x] for x in range(start_page - 1, end_page - 1)])

#     dst.save(parent_dir / f"public/books/individual-pages/english/{song['slug']}.pdf")
##################################################

##################################################
# 4.
##################################################

for song in english_songs:
    if song["hymn"] != "HC1":
        continue
    metaToDisplay = song.get("metaToDisplay", [])
    for meta in metaToDisplay:
        if "Old Hymn Book" == meta["key"]:
            old_song_slug = meta["href"].split("/")[3]
            old_songs = list(
                filter(lambda x: x["slug"] == old_song_slug, english_songs)
            )
            if len(old_songs) == 0:
                print("not found ", old_song_slug)
                continue
            old_song_meta = old_songs[0].get("metaToDisplay", [])
            old_song_meta.insert(
                0,
                {
                    "key": "New Hymn Book",
                    "value": f"{song['hymn']} {song['page_number']}",
                    "href": f"/songs/english/{song['slug']}",
                },
            )
            old_songs[0]["metaToDisplay"] = old_song_meta

##################################################

# WRITE TO SONG LIST
with open(Path.joinpath(parent_dir, "lib/songList.json"), "w", encoding="utf8") as f:
    json.dump(english_meta, f, ensure_ascii=False)

import ipdb

ipdb.set_trace()
