from functools import reduce
from itertools import pairwise
from pydoc import text
import re
import sys
from pathlib import Path
import json
from typing import Dict
import ipdb
from pikepdf import Pdf, OutlineItem, Page
import pymupdf


parent_dir = Path(__file__).resolve().parent.parent.parent
the_pdf = Pdf.open(parent_dir / "scripts/portuguese_songs/p2.pdf")

with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"),
    encoding="utf8",
) as f:
    mapping_index = json.loads(f.read())
    mapping_index_by_chinese_key = {
        song["chineseKey"]: song
        for song in mapping_index
        if "chineseKey" in song and "englishKey" in song
    }


def get_outline_items(pdf):
    songs = []
    new_mapping_for_portuguese = []
    with pdf.open_outline() as outline:
        for song in outline.root:

            title = song.title

            # example of title: (094) 4.25 O Amor Verdadeiro'
            # if the first part (094) is numeric, it is a song so we want to add it
            # if the first part is not numeric, it is a category which we ignore
            # code:
            # Extract text between first ( and )
            start = title.find("(")
            end = title.find(")")
            if start == -1 or end == -1:
                print("Skipping title with no parentheses:", title)
                continue
            page_number_str = title[start + 1 : end]
            if not page_number_str.isnumeric():
                print("Skipping non-song title:", title)
                continue
            page_number = int(page_number_str)
            # if song, parse the page number from (094) which is between parentheses
            # and also get the title which is afterwards (trim the spaces)
            # example: (094) 4.25 O Amor Verdadeiro
            # title = (094) 4.25 O Amor Verdadeiro
            # page_number = 094
            # name = O Amor Verdadeiro
            # in addition 4.25 is the chinese hymn mapping
            # H4_25
            # instead of 4.25 it could be E.25 or 18.22 etc
            # so store that to a variable first
            rest_of_title = title[5:].strip()
            hymn_mapping_part = rest_of_title.split(" ")[0]
            name = " ".join(rest_of_title.split(" ")[1:]).strip()
            # Convert hymn mapping part to chinese_hymn_key
            # E-12 -> E_12, 4.25 -> H4_25, 18.20 -> H18_20
            if hymn_mapping_part.startswith("E"):
                chinese_hymn_key = hymn_mapping_part.replace("-", "_").replace(
                    "E", "EL"
                )
            elif "H" in hymn_mapping_part:
                book_page_split = hymn_mapping_part.split(".")
                # H23 => HC1
                # H24 => HC2
                # H25 => HC3
                # do manual mapping
                chinese_hymn_key = ""
                if book_page_split[0] == "H23":
                    chinese_hymn_key = "HC1_" + book_page_split[1]
                elif book_page_split[0] == "H24":
                    chinese_hymn_key = "HC2_" + book_page_split[1]
                elif book_page_split[0] == "H25":
                    chinese_hymn_key = "HC3_" + book_page_split[1]
            else:
                chinese_hymn_key = "H" + hymn_mapping_part.replace(".", "_")

            slug = f"P2_{page_number}"
            new_mapping_for_portuguese.append(
                {
                    "portugueseKey": slug,
                    "chineseKey": chinese_hymn_key,
                }
            )
            mapping_entry = mapping_index_by_chinese_key.get(chinese_hymn_key)
            if mapping_entry:
                if mapping_index_by_chinese_key.get(chinese_hymn_key) is not None:
                    new_mapping_for_portuguese.append(
                        {
                            "portugueseKey": slug,
                            "englishKey": mapping_index_by_chinese_key[
                                chinese_hymn_key
                            ]["englishKey"],
                        }
                    )
            # if page_number > 12:

            #     import ipdb

            #     ipdb.set_trace()
            entry = {
                "name": name,
                "pdfContentTitle": song.title,
                "page_number": page_number,
                "slug": slug,  # FOR COMBINED
                "hymn": "P2",
                "pdfPageNum": pdf.pages.index(song.destination[0]),
            }

            songs.append(entry)
            # 祢這份愛

    return songs, new_mapping_for_portuguese


songs, mappings = get_outline_items(the_pdf)

# add to the json in mappingIndex.json
# with open(
#     Path.joinpath(parent_dir, "lib/mappingIndex.json"),
#     "w",
#     encoding="utf8",
# ) as f:
#     mapping_index.extend(mappings)
#     f.write(json.dumps(mapping_index, ensure_ascii=False, indent=4))

with open(
    Path.joinpath(parent_dir, "lib/song-list/portugueseSongList.json"),
    encoding="utf8",
) as f:
    existing_data = json.loads(f.read())
    existing_data["songs"].extend(songs)
    existing_data["hymnBooks"].extend(
        [
            {
                "bookFullName": "Músicas Verdades bíblicas",
                "hymnBook": "P2",
                "hasOwnSheetPdf": False,
                "songType": "portuguese",
                "imageUrl": "/book-covers/p2cover.jpg",
                "albumCoverUrl": "/book-covers/p2cover.jpg",
            }
        ]
    )

# write the list of songs to lib/song-list/portugueseSongList.json
# into the songs key
with open(
    Path.joinpath(parent_dir, "lib/song-list/portugueseSongList.json"),
    "w",
    encoding="utf8",
) as f:
    # read the json first
    # then add to the list of songs and hymnbooks
    # then write

    f.write(
        json.dumps(
            existing_data,
            ensure_ascii=False,
            indent=4,
        )
    )

print(f"Extracted {len(songs)} songs from Portuguese PDF.")
import ipdb

ipdb.set_trace()

# Now extract the text for each song and write to songContent/portuguese/P1_{page_number}.md
actual_page_splits = [song["pdfPageNum"] for song in songs]

for i, (start_page, end_page) in enumerate(pairwise(actual_page_splits)):
    song = songs[i]
    print(f"Processing song: {song['name']} from page {start_page} to {end_page}")
    with pymupdf.open(parent_dir / "scripts/portuguese_songs/P2.pdf") as pdf_doc:

        text = ""

        for page_num in range(start_page, end_page):
            page = pdf_doc[page_num]
            text += page.get_text() + "\n"

        new_text = ""
        lines = text.split("\n")
        for i, line in enumerate(lines):
            stripped = line.lstrip()
            if stripped.isdigit():  # remove page number
                continue
            if stripped.startswith("("):  # hopefully it's the title
                new_text += "# " + line + "\n" + "\n"
                continue
            if line.strip().isdigit():
                continue
            # Check if line starts with digit(s) followed by period (for stanzas)
            if stripped and stripped[0].isdigit():
                new_text += "\n" + stripped + "\n"
            elif stripped and "Refrão" in stripped:  # chorus line
                new_text += "\n" + stripped + "\n"
            else:
                new_text += stripped + "\n"

        # write toe file in songContent/portuguese/P1_{song['page_number']}.md
        with open(
            parent_dir / f"songContent/portuguese/{song['slug']}.md",
            "w",
            encoding="utf8",
        ) as f:
            f.write(new_text)

        print(f"Wrote song content for {song['slug']} - {song['name']}.")
import ipdb

ipdb.set_trace()
