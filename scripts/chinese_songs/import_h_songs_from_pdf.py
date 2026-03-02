from itertools import pairwise
from pathlib import Path
import json
from typing import Dict
from pypdf import PdfReader
from pikepdf import Pdf, OutlineItem, Page

## Hymn Book Parser
bookName = "H23"

parent_dir = Path(__file__).resolve().parent.parent.parent
reader = PdfReader(parent_dir / f"public/books/{bookName}.pdf")
the_pdf = Pdf.open(parent_dir / f"public/books/{bookName}.pdf")

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
    mapping_index_by_chinese_key = {
        song["chineseKey"]: song for song in mapping_index if "chineseKey" in song
    }

song_list = []
for outline_item in outlines[1:]:
    pdf_page_num = reader.get_page_number(outline_item.page)
    title = outline_item.title.strip()

    # Parse title format: "H22-04 Song Name" or "H22-04\tSong Name"
    try:
        if "\t" in title:
            code_part, song_name = title.split("\t", 1)
        else:
            parts = title.split(" ", 1)
            code_part = parts[0]
            song_name = parts[1] if len(parts) > 1 else ""

        # Extract page number from code like "H22-04" -> 4
        page_num = int(code_part.split("-")[1])
        song_name = song_name.strip()
    except Exception as e:
        print(f"Error parsing title: {title} - {e}")
        import ipdb

        ipdb.set_trace()

    # Actual page number is song page number + 1
    actual_page_num = page_num + 1

    entry = {
        "name": song_name,
        "hymn": bookName,
        "isChinese": True,
        "hasMultipleInPage": False,
        "slug": f"{bookName}_{page_num}",
        "page_number": page_num,
        "pdfPageNum": actual_page_num,
    }
    song_list.append(entry)

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
                "value": f"{chinese_song['hymn']} {chinese_song['page_number']}",
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
        continue
    else:
        # to handle manually since names can match to multiple, or name is different etc
        no_chinese_mapping.append(song)


with open(
    Path.joinpath(parent_dir, "lib/outline_items_h22.json"), "w", encoding="utf8"
) as f:
    json.dump(song_list, f, ensure_ascii=False)

with open(
    Path.joinpath(parent_dir, "lib/no_mapping_h22.json"), "w", encoding="utf8"
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
        "bookFullName": "神家詩歌合訂本 23",
        "hymnBook": bookName,
        "hasOwnSheetPdf": True,
        "songType": "chinese",
        "imageUrl": "/book-covers/h23cover.jpg",
        "onlySongSheet": True,
    }
]

with open(
    Path.joinpath(parent_dir, "lib/chineseSongList.json"), "w", encoding="utf8"
) as f:
    # ensure chinese stays the same
    json.dump(chinese_meta, f, ensure_ascii=False, indent=4)

print(f"Extracted {len(song_list)} songs from {bookName} PDF.")
print(f"No mapping found for {len(no_chinese_mapping)} songs.")
import ipdb

ipdb.set_trace()
