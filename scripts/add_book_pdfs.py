from functools import reduce
from itertools import pairwise
import re
import sys
from pathlib import Path
import json
from typing import Dict
from pypdf import PdfReader
from pikepdf import Pdf, OutlineItem, Page


song_book = "CHC3"
song_book_pdf_file_name = "HC3"
song_type = "chinese"

parent_dir = Path(__file__).resolve().parent.parent
# for reading outlines
reader = PdfReader(parent_dir / f"public/books/{song_book_pdf_file_name}.pdf")
# for cutting the pdfs
the_pdf = Pdf.open(parent_dir / f"public/books/{song_book_pdf_file_name}.pdf")

outlines = reader.outline

if song_type == "chinese":
    with open(
        Path.joinpath(parent_dir, "lib/chineseSongList.json"),
        encoding="utf8",
    ) as f:
        song_meta = json.loads(f.read())
        songs = song_meta["songs"]

        songs_to_cut = list(filter(lambda song: song["hymn"] == song_book, songs))
elif song_type == "english":
    with open(
        Path.joinpath(parent_dir, "lib/songList.json"),
        encoding="utf8",
    ) as f:
        song_meta = json.loads(f.read())
        songs = song_meta["songs"]

        songs_to_cut = list(filter(lambda song: song["hymn"] == song_book, songs))

if song_type == "chinese":
    actual_page_splits = [int(song["page_number"]) for song in songs_to_cut]
elif song_type == "english":
    actual_page_splits = [int(song["page_number"]) for song in songs_to_cut]
import ipdb

ipdb.set_trace()

for i, (start_page, end_page) in enumerate(pairwise(actual_page_splits)):
    song = songs_to_cut[i]
    dst = Pdf.new()
    # for the cases where there's the same song on the same pdf page (then we need to increase the index)
    # e.g. 5, 5 => 5, 6 to write the pdf on page 5
    if end_page == start_page:
        end_page = end_page + 1
    dst.pages.extend([the_pdf.pages[x] for x in range(start_page - 1, end_page - 1)])

    dst.save(
        parent_dir / f"public/books/individual-pages/{song_type}/{song['slug']}.pdf"
    )
