from pathlib import Path
import json


"""
IGNORE - USE `yarn write-song-list`
"""


##################################################################################################################
##################################################################################################################
##################################################################################################################
"""
Takes lib/songList.json and lib/chineseSongList.json and all the songContent/* files (source of truth)
and creates a new song list json with song content for the mini song app (lightweight version of the song app).

Whenever these files change, we need to run this script (hopefully in the future with a pre-commit hook)
"""

parent_dir = Path(__file__).resolve().parent.parent.parent

def get_song_slug(hymn, page_number):
    return f"{hymn}_{page_number}"

with open(Path.joinpath(parent_dir, "lib/songList.json"), "r") as f:
    rawEnglishMeta = json.loads(f.read())

with open(Path.joinpath(parent_dir, "lib/chineseSongList.json"), "r") as f:
    rawChineseSongList = json.loads(f.read())

with open(Path.joinpath(parent_dir, "lib/mappingIndex.json"), "r") as f:
    rawMappingIndex = json.loads(f.read())

DUAL_MAPPING_INDEX = {} 
for mapping in rawMappingIndex:
    DUAL_MAPPING_INDEX[mapping.get("englishKey")] = mapping.get("chineseKey")
    DUAL_MAPPING_INDEX[mapping.get("chineseKey")] = mapping.get("englishKey")

rawEnglishSongList = rawEnglishMeta.get("songs")

hymnBooksByName = {book.get("hymnBook"): book for book in rawEnglishMeta.get("hymnBooks")}

songList = {}
for song in rawEnglishSongList:
    hymn = song.get("hymn")
    if (hymn == "GFH" or hymn == "VanMusicTeam"):
        continue;
        
    new_song = {}
    slug = get_song_slug(song["hymn"], song["page_number"])

    new_song["id"] = song.get("id")
    new_song["hymn"] = song.get("hymn")
    new_song["pageNumber"] = song.get("page_number")
    new_song["name"] = song.get("name")
    new_song["songType"] = "english"
    new_song["slug"] = slug

    new_song["startKey"] = song.get("start_key")
    new_song["key"] = song.get("key")
    new_song["reference"] = DUAL_MAPPING_INDEX.get(slug, None)
    new_song["hasOwnSheetPdf"] = hymnBooksByName.get(song["hymn"], {}).get("hasOwnSheetPdf", False)
    new_song["metaToDisplay"] = song.get("metaToDisplay")
    new_song["tags"] = song.get("tags", [])
    with open(Path.joinpath(parent_dir, f"songContent/english/{slug}.md"), "r") as f:
        content = f.readlines()
        content = content[1:]
        new_song["content"] = "".join(content)

    songList[slug] = new_song

chinese_song_list = {}
for song in rawChineseSongList:
    slug = song["slug"]

    new_song = {}
    new_song["id"] = song.get("bookid")
    new_song["hymn"] = song.get("hymn")
    new_song["pageNumber"] = song.get("pagenum")
    new_song["name"] = song.get("name")
    new_song["songType"] = "chinese",
    new_song["slug"] = slug

    new_song["startKey"] = song.get("start_key")
    new_song["key"] = song.get("key")
    new_song["reference"] = DUAL_MAPPING_INDEX.get(slug, None)
    # song["hasOwnSheetPdf"] = hymnBooksByName.get(song["hymn"]).get("hasOwnSheetPdf", False)
    # song["metaToDisplay"] = song.get("metaToDisplay")
    new_song["tags"] = song.get("tags", [])

    with open(Path.joinpath(parent_dir, f"songContent/chinese/{slug}.md"), "r", encoding="utf-8") as f:
        content = f.readlines()
        content = "".join(content)
        content = content.replace(".", ". ")
        new_song["content"] = content

    chinese_song_list[slug] = new_song

## write files

ret = {
    "songs": songList,
    "hymnBooks": rawEnglishMeta.get("hymnBooks")
}

with open(Path.joinpath(parent_dir, "mini/src/data/miniSongList.json"), "w", encoding="utf-8") as f:
    json.dump(ret, f, indent=4, ensure_ascii=False)

with open(Path.joinpath(parent_dir, "mini/src/data/miniChineseSongList.json"), "w", encoding="utf-8") as f:
    json.dump(chinese_song_list, f, indent=4, ensure_ascii=False)