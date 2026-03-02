from pathlib import Path
import pandas as pd
import json

#####
# Update chinese song to song mapping + the english song ones
#####


# mappings = {'CH1_9': 'H4_2', 'CH1_11': 'H4_3', 'CH1_45': 'H3_1', 'CH1_46': 'H3_2', 'CH1_57': 'H6_33', 'CH1_63': 'H3_6', 'CH1_65': 'H2_11_1', 'CH1_67': 'H6_35', 'CH1_68': 'H6_37', 'CH1_74': 'H6_40_2', 'CH1_87': 'H5_40', 'CH1_91': 'EL_29', 'CH1_94': 'H2_3', 'CH1_104': 'EL_77', 'CH1_106': 'EL_81', 'CH1_112': 'H6_70', 'CH1_113': 'H5_65', 'CH1_117': 'H5_67', 'CH1_118': 'H5_68', 'CH1_121': 'H1_195', 'CH1_123': 'H1_208', 'CH1_124': 'H5_72', 'CH1_127': 'H2_24', 'CH1_135': 'H7_25', 'CH1_136': 'H7_26', 'CH1_139': 'H7_23', 'CH1_140': 'H3_30', 'CH1_141': 'H7_24', 'CH1_142': 'H3_37', 'CH1_153': 'H2_45', 'CH1_161': 'H3_9', 'CH1_162': 'H6_30', 'CH1_164': 'H7_1', 'CH1_165': 'H3_7', 'CH1_167': 'H6_26', 'CH1_176': 'H6_29', 'CH1_180': 'H6_54', 'CH1_185': 'H2_29', 'CH1_201': 'H5_33', 'CH1_215': 'H4_57', 'CH1_216': 'H4_60', 'CH1_224': 'H4_59', 'CH1_225': 'H3_39_0', 'CH1_227': 'H7_37', 'CH1_233': 'H5_37', 'CH1_240': 'H7_66', 'CH1_242': 'H7_69', 'CH1_253': 'H7_10', 'CH1_263': 'H5_14', 'CH1_264': 'H5_14', 'CH1_267': 'H3_25', 'CH1_278': 'H7_50', 'CH1_279': 'H2_57', 'CH1_288': 'H3_55', 'CH1_295': 'H4_66', 'CH1_296': 'H4_68', 'CH1_297': 'H4_69', 'CH1_298': 'H5_1', 'CH1_305': 'H5_10', 'CH1_306': 'H3_51', 'CH1_307': 'H4_6', 'CH1_308': 'H2_76', 'CH1_310': 'H6_1', 'CH1_311': 'H3_65', 'CH1_312': 'H3_61', 'CH1_313': 'H7_8', 'CH1_314': 'H7_28', 'CH1_315': 'H7_30', 'CH1_316': 'H7_32', 'CH1_317': 'H2_74', 'CH1_318': 'H2_73', 'CH1_319': 'H3_39_1', 'CH1_320': 'H4_41', 'CH1_321': 'H6_2', 'CH1_322': 'H4_10_1', 'CH1_323': 'H6_3_1', 'CH1_324': 'H3_19', 'CH1_325': 'H6_4', 'CH1_326': 'H4_58', 'CH1_327': 'H6_7', 'CH1_328': 'H7_4', 'CH1_329': 'H7_6', 'CH1_330': 'H2_25_1', 'CH1_331': 'H5_47', 'CH1_333': 'H6_16', 'CH1_334': 'H4_75', 'CH1_335': 'H7_76'}
mappings = {
    "CH2_47": "H10_59",
    "CH2_48": "H10_61",
    "CH2_50": "H10_64",
    "CH2_52": "H10_68",
    "CH2_62": "H8_64",
    "CH2_65": "H10_86",
    "CH2_73": "H10_96",
    "CH2_74": "H10_98",
    "CH2_86": "H9_12",
    "CH2_87": "H9_16",
    "CH2_108": "H10_150",
    "CH2_125": "H9_26",
    "CH2_130": "H9_36",
    "CH2_131": "H9_37",
    "CH2_134": "H9_41",
    "CH2_144": "H8_57",
    "CH2_147": "H10_181",
    "CH2_176": "H9_67",
    "CH2_186": "H10_231",
    "CH2_190": "H10_239",
    "CH2_191": "H10_243",
    "CH2_196": "H10_262",
}
parent_dir = Path(__file__).resolve().parent.parent.parent

with open("lib/chineseSongList.json", "r") as f:
    chinese_list = json.loads(f.read())
    song_list = chinese_list["songs"]
    chinese_songs_by_slug = {song["slug"]: song for song in song_list}

with open("lib/mappingIndex.json", "r") as f:
    raw_ce_mapping_index = json.loads(f.read())

ce_mapping_index = {}
for v in raw_ce_mapping_index:
    ce_mapping_index[v["englishKey"]] = v["chineseKey"]
    ce_mapping_index[v["chineseKey"]] = v["englishKey"]

dual_c_mappings = {}
for k, v in mappings.items():
    dual_c_mappings[v] = k
    dual_c_mappings[k] = v

for song in song_list:
    slug = song["slug"]
    if slug not in dual_c_mappings:
        continue

    metaToDisplay = song.get("metaToDisplay", [])
    hasSameSongMeta = False
    for meta in metaToDisplay:
        if meta["key"] == "sameSong":
            hasSameSongMeta = True
            break

    if not hasSameSongMeta:
        metaToDisplay.append(
            {
                "key": "Same Song",
                "value": dual_c_mappings[slug].replace("_", " "),
                "href": f"/songs/chinese/{dual_c_mappings[slug]}",
            }
        )

    song["metaToDisplay"] = metaToDisplay

for song in song_list:
    slug = song["slug"]
    # starts with CH1
    if not slug.startswith("CH2"):
        continue

    if slug not in mappings:
        continue

    other_non_combined_slug = mappings[slug]

    if other_non_combined_slug not in ce_mapping_index:
        continue

    # other song is in mapping index
    # then we include the combined song with the english song
    english_slug = ce_mapping_index[other_non_combined_slug]
    # add to mapping index

    raw_ce_mapping_index.append({"englishKey": english_slug, "chineseKey": slug})


with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"), "w", encoding="utf8"
) as f:
    json.dump(raw_ce_mapping_index, f, ensure_ascii=False)

with open(
    Path.joinpath(parent_dir, "lib/chineseSongList.json"), "w", encoding="utf8"
) as f:
    json.dump(chinese_list, f, ensure_ascii=False)
