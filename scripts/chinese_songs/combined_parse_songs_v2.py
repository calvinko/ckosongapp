from functools import reduce
from itertools import pairwise
import re
import sys
from pathlib import Path
import json
from typing import Dict
from pypdf import PdfReader
from pikepdf import Pdf, OutlineItem, Page

## V2 for CH2, uses pypdf instead of pikepdf

parent_dir = Path(__file__).resolve().parent.parent.parent
reader = PdfReader(parent_dir / "public/books/CH2.pdf")
the_pdf = Pdf.open(parent_dir / "public/books/CH2.pdf")

outlines = reader.outline

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

categories = {}
category_to_items = []
category_outline = []  # even index
category_item_list = []  # odd index
for idx, outline_item in enumerate(outlines[1:]):
    if idx % 2 == 0:
        if type(outline_item) == list:
            print(f"ERROR: outline_item is not a list and is odd idx={idx}")
            import ipdb

            ipdb.set_trace()
        category_outline.append(outline_item.title.split("（")[0].strip())
        # categories[outline_item.title] = outline_item.title.split(" (")[0].strip()
    else:
        if type(outline_item) != list:
            print(f"ERROR: outline_item is a list and is odd idx={idx}")
            import ipdb

            ipdb.set_trace()
        category_item_list.append(outline_item)

if len(category_item_list) != len(category_outline):
    print("ERROR: len(category_item_list) != len(category_outline)")
    import ipdb

    ipdb.set_trace()

for idx, _ in enumerate(category_outline):
    category_to_items.append([category_outline[idx], category_item_list[idx]])

categories_to_songs = {}
for idx, (category, items) in enumerate(category_to_items):
    song_names = []
    for song in items:
        pdf_page_num = reader.get_page_number(song.page)
        try:
            page_num = int(song.title.split("\t")[0].strip())
            song_name = song.title.split("\t")[1].strip()
        except Exception as e:
            page_num = int(song.title.split(" ")[1].strip())
            song_name = song.title.split(" ")[2].strip()

        entry = {
            "name": song_name,
            "pdfContentTitle": song.title,
            "pagenum": page_num,
            "isChinese": True,
            "hasMultipleInPage": False,  # there are multiple songs in each page but also they have unique "page numbers" (as in reference numbers)
            "slug": f"CH2_{page_num}",  # FOR COMBINED
            "hymn": "CH2",
            "pdfPageNum": int(reader.page_labels[pdf_page_num]),
            "tags": [category],
        }
        song_names.append(entry)
    categories_to_songs[category] = song_names


nested_song_list = [song for category, song in categories_to_songs.items()]
song_list = reduce(lambda x, y: x + y, nested_song_list)

actual_page_splits = [int(song["pdfPageNum"]) for song in song_list]

############################
# make the individual pdfs #
############################
for i, (start_page, end_page) in enumerate(pairwise(actual_page_splits)):
    song = song_list[i]
    dst = Pdf.new()
    # for the cases where there's the same song on the same pdf page (then we need to increase the index)
    # e.g. 5, 5 => 5, 6 to write the pdf on page 5
    if end_page == start_page:
        end_page = end_page + 1
    dst.pages.extend([the_pdf.pages[x] for x in range(start_page - 1, end_page - 1)])

    dst.save(parent_dir / f"public/books/individual-pages/chinese/{song['slug']}.pdf")

############################
# make the mappings since
# these are songs that map to other hymn books so we want to add to the metadata if possible (by name matching)
############################
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

        # add song audio if possible
        if chinese_song.get("mp3"):
            song["mp3"] = chinese_song["mp3"]

        # add in english mapping index if possible
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


with open(
    Path.joinpath(parent_dir, "lib/outline_items_v2.json"), "w", encoding="utf8"
) as f:
    # ensure chinese stays the same
    json.dump(categories_to_songs, f, ensure_ascii=False)

with open(
    Path.joinpath(parent_dir, "lib/no_mapping_v2.json"), "w", encoding="utf8"
) as f:
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
        "bookFullName": "神家詩歌合訂本 2",
        "hymnBook": "CH2",
        "hasOwnSheetPdf": True,
        "songType": "chinese",
        "imageUrl": "/book-covers/ch2cover.jpg",
        "onlySongSheet": True,
    }
]

with open(
    Path.joinpath(parent_dir, "lib/chineseSongList.json"), "w", encoding="utf8"
) as f:
    # ensure chinese stays the same
    json.dump(chinese_meta, f, ensure_ascii=False)

import ipdb

ipdb.set_trace()
