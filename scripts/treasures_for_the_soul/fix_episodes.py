from pathlib import Path
import pandas as pd
import json
import requests
from bs4 import BeautifulSoup

parent_dir = Path(__file__).resolve().parent.parent.parent


PATH = f"scripts/treasures_for_the_soul/data/episodes.json"
with open(
    Path.joinpath(
        parent_dir,
        PATH,
    ),
    "r",
    encoding="utf8",
) as f:
    episode_list = json.loads(f.read())

# for ep in episode_list:
# if "link" not in ep:
#     print(f"no link {ep['title']}")
# else:
#     ep["cogLink"] = ep["link"]
#     del ep["link"]


######## DEDUP #########################
# episode_list.sort(key=lambda episode: int(episode["number"]))

# ids = {}
# dup = []
# for episode in episode_list:
#     if episode["id"] in ids:
#         dup.append(episode["id"])
#     ids[episode["id"]] = episode
########################################

episode_list.sort(key=lambda episode: int(episode["number"]))


with open(
    Path.joinpath(parent_dir, PATH),
    "w",
    encoding="utf8",
) as f:
    json.dump(episode_list, f, ensure_ascii=False, indent=4)
