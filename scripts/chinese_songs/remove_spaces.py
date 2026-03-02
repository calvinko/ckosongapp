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

parent_dir = Path(__file__).resolve().parent.parent.parent


def remove_spaces(filepath: str):
    with open(Path.joinpath(parent_dir, filepath), "r") as f:
        lines = f.readlines()

    new_lines = []
    for line in lines:
        if line.startswith("##"):
            new_lines.append(line)
        else:
            new_line = line.replace(" ", "")
            new_line = new_line.replace(".", ". ")
            new_line = new_line.replace(",", ", ")
            new_lines.append(new_line)

    with open(filepath, "w") as f:
        f.writelines(new_lines)


if __name__ == "__main__":
    parser = OptionParser()
    parser.add_option(
        "-f",
        "--file",
        dest="file",
        help="lyric markdown file to remove spaces from",
        metavar="FILE",
    )
    (options, args) = parser.parse_args()
    remove_spaces(options.file)
