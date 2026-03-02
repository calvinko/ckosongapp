from functools import reduce
from itertools import pairwise
import re
import sys
from pathlib import Path
import json
from typing import Dict
from pikepdf import Pdf, OutlineItem, Page
import pikepdf

from optparse import OptionParser


parent_dir = Path(__file__).resolve().parent.parent


###
# SPLITS PDFS BASED ON PARAMETERS
#
# python3.10 scripts/cut_pdf.py -f public/books/CH1.pdf -t chinese -s 98 -e 98 --slug CH1_89
###

def create_new_pdf(pdf_path, start_page, end_page, song_type, slug):
    the_pdf =  Pdf.open(parent_dir / pdf_path)
    dst = Pdf.new()

    if start_page == end_page:
        dst.pages.append(the_pdf.pages[start_page-1])
    else:
        dst.pages.extend([the_pdf.pages[x] for x in range(start_page-1, end_page)])

    dst.save(parent_dir / f"public/books/individual-pages/{song_type}/{slug}.pdf")

    print(f"Created pdf for in public/books/individual-pages/{song_type}/{slug}.pdf for {start_page} to {end_page}")

if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option("-f", "--file", dest="file",
                  help="write report to FILE", metavar="FILE")
    parser.add_option("-t", "--songtype",
                  type="string", dest="songtype", default="english",
                  help="either chinese or english")
    parser.add_option("-s", "--startnum",
        type="int", dest="startnum",
        help="Start page number (start with 1)")
    parser.add_option("-e", "--endnum",
        type="int", dest="endnum",
        help="End page number (start with 1). if not provided, only the start page will be cut")
    parser.add_option("-l", "--slug",
        type="string", dest="slug",
        help="slug for pdf name")
    (options, args) = parser.parse_args()

    if not options.file:
        print("Please pass the name of the PDF file as a parameter")
        sys.exit(1)
    if not options.songtype:
        print("Please pass song type")
        sys.exit(1)
    if not options.startnum:
        print("Please pass start")
        sys.exit(1)

    if not options.slug:
        print("Please pass song slug")
        sys.exit(1)
    
    end_page = options.endnum if options.endnum else options.startnum
    
    create_new_pdf(pdf_path=options.file, slug=options.slug, start_page=options.startnum, end_page=end_page, song_type=options.songtype)