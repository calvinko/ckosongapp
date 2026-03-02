from functools import reduce
from itertools import pairwise
import re
import sys
from pathlib import Path
import json
from typing import Dict
from pikepdf import Pdf, OutlineItem, Page
import pikepdf

# from PyPDF2 import PdfReader, PdfWriter
# from PyPDF2._page import PageObject

"""
scripts/process/update_c_to_c_to_e.py will help with the noMappings
"""

parent_dir = Path(__file__).resolve().parent.parent.parent
the_pdf = Pdf.open(parent_dir / "public/books/CH1.pdf")

with open(
    Path.joinpath(parent_dir, "lib/chineseSongList.json"),
    encoding="utf8",
) as f:
    chinese_meta = json.loads(f.read())
    chinese_songs = chinese_meta["songs"]
    chinese_songs_by_name = {song["name"]: song for song in chinese_songs}

with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"),
    encoding="utf8",
) as f:
    mapping_index = json.loads(f.read())
    mapping_index_by_chinese_key = {song["chineseKey"]: song for song in mapping_index}


def get_outline_items(pdf):
    categories_to_titles = {}
    with pdf.open_outline() as outline:
        categories = {}
        for category in outline.root:
            categories[category.title] = category.title[category.title.find("、") + 1 :]

        for category in outline.root:
            title = category.title
            song_names = []
            for song in category.children:
                page = Page(song.action["/D"][0])
                entry = {
                    "name": song.title[4:],
                    "pdfContentTitle": song.title,
                    "pagenum": int(song.title[:3]),
                    "isChinese": True,
                    "hasMultipleInPage": False,  # there are multiple songs in each page but also they have unique "page numbers" (as in reference numbers)
                    "slug": f"CH1_{int(song.title[:3])}",  # FOR COMBINED
                    "hymn": "CH1",
                    "pdfPageNum": page.label,
                    "tags": [categories[title]],
                }

                # Badly formatted, no space between page num and title 001祢這份愛
                # Badly formatted, no space between page num and title 038主愛的路程（二）樓房到花園
                # Badly formatted, no space between page num and title 041主愛的路程（五）加略到再來
                if song.title[3] != " ":
                    if song.title == "001祢這份愛":
                        entry["name"] = "祢這份愛"
                    elif song.title == "038主愛的路程（二）樓房到花園":
                        entry["name"] = "主愛的路程（二）樓房到花園"
                    elif song.title == "041主愛的路程（五）加略到再來":
                        entry["name"] = "主愛的路程（五）加略到再來"
                    else:
                        print(
                            "Unexpected bad format one - fix manually, no space between page num and title",
                            song.title,
                        )

                song_names.append(entry)
                # 祢這份愛
            categories_to_titles[title] = song_names
    return categories_to_titles


categories_to_songs = get_outline_items(the_pdf)

nested_song_list = [song for category, song in categories_to_songs.items()]
song_list = reduce(lambda x, y: x + y, nested_song_list)

actual_page_splits = [int(song["pdfPageNum"]) for song in song_list]

for i, (start_page, end_page) in enumerate(pairwise(actual_page_splits)):
    song = song_list[i]
    dst = Pdf.new()

    dst.pages.extend([the_pdf.pages[x] for x in range(start_page - 1, end_page - 1)])

    dst.save(parent_dir / f"public/books/individual-pages/chinese/{song['slug']}.pdf")


no_chinese_mapping = []
new_mapping = []
for song in song_list:
    if song["name"] in chinese_songs_by_name:
        chinese_song = chinese_songs_by_name[song["name"]]
        song["metaToDisplay"] = [
            {
                "key": "Same Song",
                "value": f"{chinese_song['hymn']} {chinese_song['pagenum']}",
                "href": f"/songs/chinese/{chinese_song['slug']}",
            }
        ]

        if chinese_song.get("mp3"):
            song["mp3"] = chinese_song["mp3"]

        english_mapping = mapping_index_by_chinese_key.get(chinese_song["slug"])
        if english_mapping:
            new_mapping.append(
                {
                    "chineseKey": song["slug"],
                    "englishKey": english_mapping["englishKey"],
                }
            )
            # print(f"english mapping slug={song['slug']} othersSlug={chinese_song['slug']} mapping={english_mapping}")
        continue
    else:
        # to handle manually since names can match to multiple, or name is different etc
        no_chinese_mapping.append(song)
        # print(f"no song for title={song['title']} slug={song['slug']}")
import ipdb

ipdb.set_trace()


with open(
    Path.joinpath(parent_dir, "lib/outline_items.json"), "w", encoding="utf8"
) as f:
    # ensure chinese stays the same
    json.dump(categories_to_songs, f, ensure_ascii=False)

with open(Path.joinpath(parent_dir, "lib/no_mapping.json"), "w", encoding="utf8") as f:
    # ensure chinese stays the same
    json.dump(no_chinese_mapping, f, ensure_ascii=False)

with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"), "w", encoding="utf8"
) as f:
    # ensure chinese stays the same
    json.dump(mapping_index + new_mapping, f, ensure_ascii=False)

chinese_meta["songs"] = chinese_meta["songs"] + song_list
chinese_meta["hymnBooks"] = chinese_meta["hymnBooks"] + [
    {
        "bookFullName": "神家詩歌合訂本 1",
        "hymnBook": "CH1",
        "hasOwnSheetPdf": True,
        "songType": "chinese",
        "imageUrl": "/book-covers/elcover.jpg",
    }
]

with open(
    Path.joinpath(parent_dir, "lib/chineseSongList.json"), "w", encoding="utf8"
) as f:
    # ensure chinese stays the same
    json.dump(chinese_meta, f, ensure_ascii=False)

# reader = PdfReader(parent_dir / "public/books/CH1.pdf")

# {
#     "songnum": "20",
#     "pagenum": 48,
#     "author": "",
#     "hymn": "H13",
#     "isChinese": true,
#     "name": "我在祢情愛中出現",
#     "hasMultipleInPage": false,
#     "slug": "H13_48",
#     "mp3": "/song-audio/chinese/H13_48.mp3",
#     "metaToDisplay": [
#         {
#             "key": "Old Page",
#             "value": "pg 44"
#         }
#     ]
# },
