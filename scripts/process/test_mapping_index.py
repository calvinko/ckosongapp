import json

# ensures mapping index isn't terribly wrong (all indexes match to a song that actually exists)


def get_song_slug(song):
    return f"{song['hymn']}_{song['page_number']}"


def valid_adjacent_index(curr, adjacent, before):
    """
    Make sure, if they are in the same book that it's in order (previous adjacent index has smaller page number,
    next adjacent index should have a bigger page number)

    curr: Current index
    adjacent: Adjacent index
    before: whether adjacent index is before or after (-1 or +1) from the curr index
    """
    adjacent_page_num = int(adjacent["englishKey"].split("_")[1])
    curr_page_num = int(curr["englishKey"].split("_")[1])

    # if adjacent one has the same book
    if "SOL1" in curr["englishKey"] and "SOL1" in adjacent["englishKey"]:
        if before:
            if not adjacent_page_num < curr_page_num:
                print(
                    f"Previous Index not correct or not in order: curr={curr['englishKey']} adjacent={adjacent['englishKey']} beforeOrNot={before}"
                )
        elif not adjacent_page_num > curr_page_num:
            print(
                f"Next Index not correct or not in order curr={curr['englishKey']} adjacent={adjacent['englishKey']} beforeOrNot={before}"
            )


with open("lib/mappingIndex.json", "r") as f:
    mapping_index = json.loads(f.read())

with open("lib/songList.json", "r") as f:
    songList = json.loads(f.read())

with open("lib/chineseSongList.json", "r") as f:
    chineseSongList = json.loads(f.read())

english_song_by_slug = {get_song_slug(song): song for song in songList}
chinese_song_by_slug = {song["slug"]: song for song in chineseSongList}

for idx, indexes in enumerate(mapping_index):

    # 1. incremental, if in the same book (for certain books, SOL1, SOL2), it should be incremental
    # 2. both songs exist
    englishKey = indexes["englishKey"]
    chineseKey = indexes["chineseKey"]
    english_song = english_song_by_slug.get(englishKey)
    if english_song is None:
        print(
            f"Error: English song for englishKey={englishKey} DNE. chineseKey={chineseKey}"
        )
    chinese_song = chinese_song_by_slug.get(chineseKey)
    if chinese_song is None:
        print(
            f"Error: Chinese song for chineseKey={chineseKey} DNE. englishKey={englishKey}"
        )

    if idx != 0 and idx != len(mapping_index) - 1:
        if "SOL1" in englishKey or "SOL2" in englishKey:
            prev_index = mapping_index[idx - 1]
            after_index = mapping_index[idx + 1]
            valid_adjacent_index(indexes, prev_index, True)
            valid_adjacent_index(indexes, after_index, False)