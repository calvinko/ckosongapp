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
with open(
    Path.joinpath(parent_dir, "lib/song-list/portugueseSongList.json"),
    encoding="utf8",
) as f:
    existing_data = json.loads(f.read())

HYMN_TO_FIX = "P2025"

all_songs = existing_data["songs"]

# filter those with hymn = P2026
songs = [song for song in all_songs if song["hymn"] == HYMN_TO_FIX]

actual_page_splits = [song["pdfPageNum"] for song in songs]

for i, (start_page, end_page) in enumerate(pairwise(actual_page_splits)):
    song = songs[i]
    print(f"Processing song: {song['name']} from page {start_page} to {end_page}")
    with pymupdf.open(
        parent_dir / f"scripts/portuguese_songs/{HYMN_TO_FIX}.pdf"
    ) as pdf_doc:

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
