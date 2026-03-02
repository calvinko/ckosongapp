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
import pdfplumber

parent_dir = Path(__file__).resolve().parent.parent.parent

with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"),
    encoding="utf8",
) as f:
    mapping_index = json.loads(f.read())
    mapping_index_by_chinese_key = {
        song["chineseKey"]: song
        for song in mapping_index
        if "chineseKey" in song and "englishKey" in song
    }

    mapping_index_by_english_key = {
        song["englishKey"]: song
        for song in mapping_index
        if "chineseKey" in song and "englishKey" in song
    }

# have mapping of portuguseseKey to list of englishKey and chineseKey
mapping_index_by_portuguese_key = {}

for song in mapping_index:
    if "portugueseKey" in song:
        port_key = song["portugueseKey"]
        if port_key not in mapping_index_by_portuguese_key:
            mapping_index_by_portuguese_key[port_key] = {
                "englishKey": None,
                "chineseKey": None,
            }

        if song.get("englishKey"):
            mapping_index_by_portuguese_key[port_key]["englishKey"] = song["englishKey"]
        if song.get("chineseKey"):
            mapping_index_by_portuguese_key[port_key]["chineseKey"] = song["chineseKey"]

# import ipdb

# ipdb.set_trace()

new_mappings_to_add = []

for portuguese_key, mapping in mapping_index_by_portuguese_key.items():
    # only handle portuguese ones
    if mapping["chineseKey"] is not None and mapping["englishKey"] is not None:
        continue

    if mapping["chineseKey"] is None:
        # try to find chineseKey from englishKey
        english_key = mapping["englishKey"]
        if english_key in mapping_index_by_english_key:
            correct_chinese_key = mapping_index_by_english_key[english_key][
                "chineseKey"
            ]
            print(
                f"Fixing missing chineseKey for {portuguese_key} using englishKey {english_key}: {correct_chinese_key}"
            )
            mapping["chineseKey"] = correct_chinese_key
            new_mappings_to_add.append(
                {
                    "portugueseKey": portuguese_key,
                    "chineseKey": correct_chinese_key,
                }
            )
        else:
            print(
                f"Could not find chineseKey for {portuguese_key} with englishKey {english_key}"
            )

    if mapping["englishKey"] is None:
        # try to find englishKey from chineseKey
        chinese_key = mapping["chineseKey"]
        if chinese_key in mapping_index_by_chinese_key:
            correct_english_key = mapping_index_by_chinese_key[chinese_key][
                "englishKey"
            ]
            print(
                f"Fixing missing englishKey for {portuguese_key} using chineseKey {chinese_key}: {correct_english_key}"
            )
            mapping["englishKey"] = correct_english_key
            new_mappings_to_add.append(
                {
                    "portugueseKey": portuguese_key,
                    "englishKey": correct_english_key,
                }
            )
        else:
            print(
                f"Could not find englishKey for {portuguese_key} with chineseKey {chinese_key}"
            )

# add new_mappings_to_add to mappingIndex.json
mapping_index.extend(new_mappings_to_add)
with open(
    Path.joinpath(parent_dir, "lib/mappingIndex.json"),
    "w",
    encoding="utf8",
) as f:
    f.write(json.dumps(mapping_index, ensure_ascii=False, indent=4))


import ipdb

ipdb.set_trace()
