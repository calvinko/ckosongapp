"""
A script to split an entire song book into individual pages
Requires Python version >= 3.10
"""
import re
import sys
from pathlib import Path
from itertools import pairwise

from PyPDF2 import PdfReader, PdfWriter
from PyPDF2._page import PageObject

SplitType = tuple[list[int], list[int]]


def _get_store_path(file_name: str) -> Path:
    """
    Get the store path of song using file name
    :param file_name: name of song PDF to look for
    :param path: a song path to search in
    :return: a path to store the files in
    :raises ValueError: when file_name does not end in '.pdf'
    :raises ValueError: when search path is not an existing directory
    :raises FileNotFoundError: when no corresponding song not found
    """
    if not file_name.endswith(".pdf"):
        raise ValueError(f"Expected file_name={file_name} to end in .pdf")
    base_dir = Path(".").resolve().parent.parent
    search_path = base_dir / "songContent"
    if not search_path.is_dir():
        raise ValueError(f"Unable to find song content in {search_path}")
    book_name = file_name.split(".")[0]
    for subpath in search_path.iterdir():
        if not subpath.is_dir():
            continue
        for file in subpath.iterdir():
            if file.stem.startswith(book_name):
                return base_dir / "public" / "books" / "individual-pages" / subpath.stem
    raise FileNotFoundError(f"Unable to find songs for file_name={file_name}")


def _split_by_title(pattern: str, pages: list[PageObject]) -> SplitType:
    """
    Get page splits using the title of each song
    :param pattern: a regex pattern to search for
    :param pages: a list of pages from the PDF reader
    :return: lists of song numbers and page numbers for the file
    """
    previous_number = -1
    song_numbers = []
    page_numbers = []
    expression = re.compile(pattern)
    for i, page in enumerate(pages):
        text = page.extractText().split("\n")[0]
        result = expression.search(text)
        if result is not None:
            try:
                song_number = int(result.group(1))
            except (IndexError, ValueError):
                continue
            if song_number < previous_number or song_number >= len(pages):
                continue
            song_numbers.append(song_number)
            page_numbers.append(i)
            previous_number = song_number
    page_numbers.append(len(pages) - 1)
    return song_numbers, page_numbers


def _split_by_song_list(pages: list[PageObject]) -> SplitType:
    """
    Get page splits using the table of content
    :param pages: a list of pages from the PDF reader
    :return: lists of song numbers and page numbers for the file
    """
    previous_number = -1
    song_numbers = []
    expression = re.compile(r"\D+\s[.]*[\s|]?([0-9]+)")
    for page in pages[1:5]:
        for line in page.extractText().split("\n"):
            results = expression.findall(line)
            for result in results:
                try:
                    song_number = int(result)
                except ValueError:
                    continue
                if song_number < previous_number or song_number > len(pages):
                    continue
                song_numbers.append(song_number)
                previous_number = song_number
    page_numbers = song_numbers.copy()
    page_numbers.append(len(pages))
    return song_numbers, page_numbers


def _get_splits(book: str, pages: list[PageObject]) -> SplitType:
    """
    Get a list of page splits for the given PDF file
    :param book: name of book to split on
    :param pages: a list of pages from the PDF reader
    :return: lists of song numbers and page numbers for the file
    :raises NotImplementedError: when the split strategy is not implemented
    """
    if book in [f"H{i}" for i in range(1, 10)]:
        return _split_by_title(r"\D+([0-9]+)\D+", pages)
    if book in ["H10", "H11"]:
        return _split_by_title(r"H[0-9]+-([0-9]+)\D+", pages)
    if book in [f"H{i}" for i in range(13, 25)]:
        return _split_by_song_list(pages)
    raise NotImplementedError(
        "The split strategy for book={book} has not been implemented yet"
    )



def save_split_pages(file_name: str) -> None:
    """
    Split the given file into individual files using splits
    :param file_name: name of song PDF to look for
    :return: None
    :raises FileExistsError: when store_path is an existing file
    """
    store_path = _get_store_path(file_name)
    if store_path.is_file():
        raise FileExistsError(f"Expected {str(store_path)} to be a directory, not file")

    book_name = file_name.split(".")[0]
    store_path.mkdir(exist_ok=True)
    print(f"Writing PDF files to {str(store_path)}...")
    reader = PdfReader(store_path.parent.parent / file_name)
    offset = 1 if file_name == "H19.pdf" else 0
    song_numbers, page_numbers = _get_splits(book_name, reader.pages)
    for i, (start_page, end_page) in enumerate(pairwise(page_numbers)):
        writer = PdfWriter()
        for page_number in range(start_page, end_page):
            writer.add_page(reader.pages[page_number + offset])
        file_path = store_path / f"{book_name}_{song_numbers[i]}.pdf"
        if file_path.is_file():
            file_path.rename(store_path / f"{book_name}_{song_numbers[i]}_0.pdf")
            file_path = store_path / f"{book_name}_{song_numbers[i]}_1.pdf"
        with open(file_path, "wb") as file:
            writer.write(file)


if __name__ == "__main__":
    # Take the name of PDF file as a parameter
    if len(sys.argv) < 2:
        print("Please pass the name of the PDF file as a parameter")
        sys.exit(1)
    for pdf_file in sys.argv[1:]:
        print(f"Splitting {pdf_file}")
        save_split_pages(pdf_file)
        print("Done")
