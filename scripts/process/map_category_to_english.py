from pathlib import Path
import pandas as pd
import json

"""
Collection Chinese Book (CH1) categorizes their songs. This script finds 
the translation of the songs and adds the puts the translated category to the english song

e.g. CH1_1 => SOL1_1. CH1_1 has category 1 so SOL1_1 will have category 1 (but in english)
"""

parent_dir = Path(__file__).resolve().parent.parent.parent
CATEGORY_TRANSLATION = {
    "神和祂的愛": "God and His Love",
    "阿爸，父": "Abba, Father",
    "父與主": "Father and the Lord",
    "主": "The Lord",
    "聖靈": "The Holy Spirit",
    "主愛歷程": "Love Journey of the Lord",
    "父差主來": "Father Sent the Lord to Come",
    "主降世": "The Lord Came From Heaven to Earth",
    "主釘十架": "The Lord Died on the Cross",
    "主復活": "The Lord's Resurrection",
    "主升天": "The Lord's Ascension",
    "主與我永聯合": "Forever United with the Lord",
    "主再來": "The Lord's Return",
    "千禧年國與燦爛永恆": "Millennium and Brilliant Eternity",
    "親近經歷神": "Draw Close to God and Experience Him",
    "十架果效，榮耀救贖": "Fruit of the Cross. Glorious Salvation",
    "勝過仇敵，心靈釋放": "Victoriously Overcome Satan. Spirit Set Free",
    "榮耀託付": "Glorious Commission",
    "我們的回應": "Our Love Response",
    "征途詩歌": "Our Journey Following the Lord",
    "神的家": "God's Family",
    "復興與更新": "Revival and Renewal",
    "經文詩歌": "Hymn from Scriptures",
    # CH2
    "父、子、聖靈": "Father, Son, and Holy Spirit",
    "父的名": "Father's Name",
    "父和主": "Father and the Lord",
    "愛主": "Beloved Lord",
    # "聖靈": "The Holy Spirit",
    "主的愛路": "Love Journey of the Lord",
    "十架救恩、心靈釋放": "Salvation of the Cross, Spirit Set Free",
    "回應": "Our Love Response",
    "同走永生的道路": "Walk on the Everlasting Way",
    "主再來的盼望": "Hope in the Lord's Coming",
    "與主同工，完成託付": "Cowork with the Lord, Finish His Commission",
    # "征途詩歌": "Our Journey Following the Lord",
    # "經文詩歌": "Hymn from Scriptures",
}


with open("lib/chineseSongList.json", "r") as f:
    chinese_list = json.loads(f.read())
    chinese_song_list = chinese_list["songs"]
    chinese_songs_by_slug = {song["slug"]: song for song in chinese_song_list}

with open("lib/songList.json", "r") as f:
    english_list = json.loads(f.read())
    english_song_list = english_list["songs"]
    english_songs_by_slug = {song["slug"]: song for song in english_song_list}

with open("lib/mappingIndex.json", "r") as f:
    raw_ce_mapping_index = json.loads(f.read())

ce_mapping_index = {}
for v in raw_ce_mapping_index:
    ce_mapping_index[v["chineseKey"]] = v["englishKey"]

ch_songs = [
    song
    for song in chinese_song_list
    if song["slug"].startswith("CH1") or song["slug"].startswith("CH2")
]

eslug_to_ch_songs = {}

for song in ch_songs:
    if song["slug"] in ce_mapping_index:
        eslug_to_ch_songs[ce_mapping_index[song["slug"]]] = {
            "ch_song": song,
            "en_song": ce_mapping_index[song["slug"]],
        }


for song in english_song_list:
    slug = song["slug"]
    if slug not in eslug_to_ch_songs:
        continue

    song_map = eslug_to_ch_songs[slug]
    ch_song = song_map["ch_song"]

    ch_category = ch_song["tags"][0]
    en_category = CATEGORY_TRANSLATION.get(ch_category, None)

    if en_category is None:
        print(
            f"Could not find category for {ch_category} slug={slug} ch_song={ch_song['slug']}"
        )
        import ipdb

        ipdb.set_trace()
        continue

    new_tags = song.get("tags", [])
    new_tags.append(en_category)
    song["tags"] = new_tags

with open(Path.joinpath(parent_dir, "lib/songList.json"), "w", encoding="utf8") as f:
    json.dump(
        {"songs": english_song_list, "hymnBooks": english_list["hymnBooks"]},
        f,
        ensure_ascii=False,
        indent=4,
    )


import ipdb

ipdb.set_trace()
