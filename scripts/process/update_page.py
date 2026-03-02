"""
Update page numbers for H13 and H14
"""
import sys
import json
import subprocess
from pathlib import Path


BASE_DIR = Path(".").resolve().parent.parent


def get_hymn_name(file_name: str) -> str:
    if "." not in file_name:
        return file_name
    return file_name.split(".")[0]


def get_song_list(name: str) -> dict[str, any]:
    song_file = BASE_DIR / "lib" / name
    with song_file.open("r") as file:
        songs = json.load(file)
    return songs


def rename_song(old_name: str, new_name: str) -> bool:
    content_dir = BASE_DIR / "songContent" / "chinese"
    audio_dir  = BASE_DIR / "public" / "song-audio" / "chinese"
    directory_map = {content_dir: "md", audio_dir: "mp3"}
    for directory, extension in directory_map.items():
        song_file = directory / f"{old_name}.{extension}"
        if song_file.is_file():
            print(f"{old_name} -> {new_name}")
            new_song_file = directory / f"{new_name}.{extension}"
            params = ["git", "mv", str(song_file), str(new_song_file)]
            subprocess.run(params, check=True, text=True)


def update_song_numbers(songs: dict[str, any], book_name: str) -> None:
    to_update = []
    for song in songs["songs"]:
        if (
            song["songname"].startswith(book_name)
            and "metaToDisplay" in song
            and song["metaToDisplay"]
            and "value" in song["metaToDisplay"][0]
        ):
            new_page = song["metaToDisplay"][0]["value"]
            assert new_page.startswith("pg ")
            to_update.append((int(new_page[3:]), song["slug"]))
    to_update.sort(key=lambda x: x[0], reverse=True)
    print(to_update)
    for page_number, slug in to_update:
        assert slug.count("_") > 0
        parts = slug.split("_")
        parts[1] = str(page_number)
        rename_song("_".join(parts), slug)


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Please pass the name of the PDF file as a parameter")
        sys.exit(1)
    hymn_name = get_hymn_name(sys.argv[1])
    song_list = get_song_list("chineseSongList.json")
    update_song_numbers(song_list, hymn_name)
