import json
from bs4 import BeautifulSoup
import requests
from pathlib import Path

"""
This script scrapes a downloaded html file of a list of songs for a book. It then scrapes for each song lyrics, write their lyrics in `songContent/` and then add a list of songs 
to scraped_song_list.json and also adds it to the "truth" list of songs "chineseSongList.json"
"""

parent_dir = Path(__file__).resolve().parent.parent.parent
path_to_page = Path(str(Path.home()) + "/Downloads/to_scrape.html")

episodes = []

#########################################################################################################
### Get Episode Links

# request for pages with links to epsiodes
# ex: http://churchofgod.org.hk/podcast/?jsf=jet-engine:podcast&pagenum=5

# link_to_episode = []
# for pg_num in range(0, 46):
#     res = requests.get(f"https://churchofgod.org.hk/podcast/?jsf=jet-engine:podcast&pagenum={pg_num}")
#     soup = BeautifulSoup(res.content, "html.parser")

#     # get parent div that holds the list of episode (you manually find it)
#     parents = soup.find_all(attrs={"data-id": "8f0a6b9"})
#     # there should only be one "parent" with the data-id that you manually got
#     # this would hold an `ae-post-list-wrapper` div which is a list of items, each is an <article>
#     # Each <article> is the song item and it holds two <a> which include the link to the song

#     episode_divs = parents[0].find_all("div", class_="jet-listing-grid__item")
#     for episode_wrapper in episode_divs:
#         if episode_wrapper.text == '\n':
#             continue
#         row = episode_wrapper.select("div.elementor-row")
#         link_wrapper = row[0].select("div.elementor-top-column")
#         link_to_episode.append(link_wrapper[0].attrs["data-column-clickable"])

#     print(f"Finished getting episodes for page {str(pg_num)}")

# print("Got episodes...")

# with open(
#         Path.joinpath(
#             parent_dir,
#             f"scripts/treasures_for_the_soul/data/episode_links.json",
#         ),
#         "w",
#         encoding="utf8",
#     ) as f:
#         json.dump(link_to_episode, f, ensure_ascii=False)

# import ipdb; ipdb.set_trace()
#########################################################################################################


## 2.

#########################################################################################################

# open json file with links to episodes
with open(
    Path.joinpath(
        parent_dir,
        f"scripts/treasures_for_the_soul/data/episode_links.json",
    ),
    "r",
    encoding="utf8",
) as f:
    link_to_episode = json.load(f)
# with open(
#         Path.joinpath(
#             parent_dir,
#             f"scripts/treasures_for_the_soul/data/episodes.json",
#         ),
#         "r",
#         encoding="utf8",
#     ) as f:
#         episode_list = json.loads(f.read())
episode_list = []

partitioned_lists = [
    link_to_episode[i : i + 100] for i in range(0, len(link_to_episode), 100)
]

PARTITION = 2  # change every run
print(f"Number of partitions {len(partitioned_lists)}")
print(f"PARTITION {PARTITION}")

import ipdb

ipdb.set_trace()
for index, link in enumerate(partitioned_lists[PARTITION]):
    try:
        res = requests.get(link)
        soup = BeautifulSoup(res.content, "html.parser")

        site_contents = soup.find_all("div", class_="site-content")
        title = (
            site_contents[0]
            .find_all("section")[0]
            .select("h1.elementor-heading-title")[0]
            .text.strip()
        )
        intro_text = (
            site_contents[0]
            .find_all("section")[1]
            .find_all("div", class_="elementor-widget-wrap")[0]
            .find_all("div", class_="elementor-widget-container")[2]
            .text.strip()
        )

        content_children = [
            *site_contents[0]
            .find_all("section")[1]
            .find_all("div", class_="elementor-widget-wrap")[0]
            .find_all("div", class_="elementor-widget-container")[4]
            .children
        ]
        content_text = []
        if len(content_children[1].find_all("iframe")):
            anchor_link = content_children[1].find_all("iframe")[0].attrs["src"]
        for idx, child in enumerate(content_children):
            if (
                child.text == "\n"
                or child.text == " "
                or child.text == ""
                or idx == 0
                or idx == len(content_children) - 1
            ):
                continue

            iframe_select = child.find_all("iframe")
            if len(iframe_select) > 0:
                # this is the anchor link
                anchor_link = iframe_select[0].attrs["src"]
                continue

            content_text.append(str(child.text))

        episode_num = title.split(" ")[0].strip()
        try:
            episode_name = "".join(title.split(" ")[1:]).strip()
        except Exception as e:
            episode_name = "COULD NOT FIND"

        episode_list.append(
            {
                "id": episode_num,
                "title": title,
                "number": episode_num[2:],
                "name": episode_name,
                "episodeLink": anchor_link,
                "introText": intro_text,
                "content": content_text,
                "cogLink": link,
            }
        )
    except Exception as e:
        print(f"Error with episode ", episode_num, episode_name, e)
        import ipdb

        ipdb.set_trace()
    print(f"Got episode content index={index} {episode_num} {episode_name} link={link}")

import ipdb

ipdb.set_trace()

# episode_list.sort(key = lambda episode: episode["title"])


with open(
    Path.joinpath(
        parent_dir,
        f"scripts/treasures_for_the_soul/data/episode2.json",
    ),
    "w",
    encoding="utf8",
) as f:
    json.dump(episode_list, f, ensure_ascii=False)
