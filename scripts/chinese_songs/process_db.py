import json
from pathlib import Path
from typing import DefaultDict


def get_song_slug(hymn: str, page_number: str) -> str:
    return f"{hymn}_{page_number}"


def write_song(slug: str, text: str):
    with open(
        Path.joinpath(
            parent_dir,
            f"songContent/chinese/{slug}.md",
        ),
        "w",
        encoding="utf8",
    ) as f:
        f.write(text)


parent_dir = Path(__file__).resolve().parent.parent.parent

# songbook table
with open(
    Path.joinpath(parent_dir, "scripts/chinese_songs/chinese_book_table.json")
) as f:
    books_json = json.loads(f.read())

# songbooktext table
with open(
    Path.joinpath(parent_dir, "scripts/chinese_songs/chinese_song_text.json"),
    encoding="utf8",
) as f:
    songs_json = json.loads(f.read())


book_by_id = {book["bookid"]: book for book in books_json}

song_list = []
song_dict = DefaultDict(list)

for song in songs_json:
    book = book_by_id.get(song["bookid"])
    if book is None:
        continue

    song["hymn"] = book["abbvname"]
    song["isChinese"] = True
    # remove /r/n and the first part
    # ex: H13-67 為祢全地心意，憐憫、賜福與我們
    # ex: L03 你這份愛
    # sometimes there's no space in between the first part and the actual name..

    raw_song_name = song["songname"]

    actual_name = ""
    curr_cursor = 0
    hit_number = False
    for char in raw_song_name:
        if not char.isdigit() and not hit_number:
            # we are still in the beginning like "L" of "LO3"
            curr_cursor += 1
        elif char.isdigit() and not hit_number:
            hit_number = True
            curr_cursor += 1
        elif char.isdigit() and hit_number:
            curr_cursor += 1
        elif char == "-" and hit_number:
            curr_cursor += 1
        elif char == "." and hit_number:
            curr_cursor += 1
        else:
            # not a digit, maybe a space
            # but we've already hit a number
            # this is probably the beginning of the name or a space, which we'll remove later
            actual_name = raw_song_name[curr_cursor:]

    if actual_name == "":
        print(":::name without pagenum:::: " + song["songname"])
        actual_name = song["songname"]

    # remove /r/n and space
    song["name"] = actual_name.rstrip().strip()
    if song["pagenum"] == "0":

        if actual_name != song["songname"]:
            new_pagenum = raw_song_name.split("-")[1].split(" ")[0]
            song["pagenum"] = int(new_pagenum)
            print(f"changing pagenum for {song['songname']} to {new_pagenum}")

    song_list.append(song)
    song_dict[get_song_slug(song["hymn"], song["pagenum"])].append(song)


# write songs
# in addition, add more fields since the same page may have multiple songs
# so we add an additional suffix to the song's slug. And in order for it to match
# we add a `slug` field to the song. These new fields will show up in the song_list
# since it references the same object.. I know, sorry for the bad code
for key, value in song_dict.items():
    for song in value:
        song["hasMultipleInPage"] = False
    if len(value) > 1:
        # mark it saying there's multiple songs in this same page
        for song in value:
            song["hasMultipleInPage"] = True

        # loop through each song in the page and add an additional suffix of it's index on the page like
        # H1_32_0 for the first song, H1_32_1 for the second song, etc
        for index, song in enumerate(value):
            songtext = song["songtext"]
            write_song(
                slug=f"{song['hymn']}_{song['pagenum']}_{index}",
                text=songtext,
            )
            song["slug"] = f"{song['hymn']}_{song['pagenum']}_{index}"

    else:
        # write song content the normal way
        song = value[0]
        songtext = song["songtext"]
        if songtext.find("\r\n\r\n\r\n") > 0 and songtext.find("\r\n\r\n\r\n") < 16:
            print(
                f"removing 3 new lines from songtext: {song['hymn']}_{song['pagenum']}"
            )
            songtext = songtext.replace("\r\n\r\n\r\n", "\r\r")
            songtext = songtext.replace("\r\n\r\n", "\n")
            songtext = songtext.replace("\r\r", "\n\n")
        write_song(
            slug=f"{song['hymn']}_{song['pagenum']}",
            text=songtext,
        )
        song["slug"] = key


with open(
    Path.joinpath(parent_dir, "lib/chineseSongList.json"), "w", encoding="utf8"
) as f:
    # ensure chinese stays the same
    json.dump(song_list, f, ensure_ascii=False)

import ipdb

ipdb.set_trace()
