import json
from bs4 import BeautifulSoup
import requests
from pathlib import Path
import re

"""
This script imports new Treasure for the Soul episodes. See scrape_tsfs.py for the other details
"""

parent_dir = Path(__file__).resolve().parent.parent.parent
path_to_page = Path(str(Path.home()) + "/Downloads/to_scrape.html")

episodes = []
# ex: http://churchofgod.org.hk/podcast/?jsf=jet-engine:podcast&pagenum=5

with open(
    Path.joinpath(
        parent_dir,
        f"scripts/treasures_for_the_soul/data/episodes.json",
    ),
    "r",
    encoding="utf8",
) as f:
    episodes = json.load(f)

episodes.sort(key=lambda episode: int(episode["number"]))
latest_downloaded_episode = episodes[-1]
latest_downloaded_episode_number: int = int(latest_downloaded_episode["number"])

print(f"Latest Downloaded Episode Num: {latest_downloaded_episode_number}")
link_to_episode = []
done_with_pages = False
latest_episode_num = 0
for pg_num in range(
    0, 5
):  # update page range depending on when the latest downloaded episode is at
    if done_with_pages:
        break
    res = requests.get(
        f"https://churchofgod.org.hk/podcast/?jsf=jet-engine:podcast&pagenum={pg_num}"
    )
    soup = BeautifulSoup(res.content, "html.parser")

    # get parent div that holds the list of episode (you manually find it)
    parents = soup.find_all(attrs={"data-listing-id": "19585"})
    # there should only be one "parent" with the data-id that you manually got
    # this would hold an `ae-post-list-wrapper` div which is a list of items, each is an <article>
    # Each <article> is the song item and it holds two <a> which include the link to the song

    episode_divs = parents[0].find_all("div", class_="jet-listing-grid__item")
    for episode_wrapper in episode_divs:
        try:
            if episode_wrapper.text == "\n":
                continue
            row = episode_wrapper.select("div.elementor-container")

            link_wrapper = row[0].select("div.elementor-top-column")
            epp_num_str = episode_wrapper.select("h2.elementor-heading-title")[
                0
            ].text.strip()

            # some may be EP 1523 無限者真的用愛子的血和我立永恆愛約
            # some may be EP1523 無限者真的用愛子的血和我立永恆愛約 (without space)
            # use regex to extract the number
            match = re.search(r"EP\s?(\d+)", epp_num_str, re.IGNORECASE)
            if match:
                epp_num_str = match.group(1)
            epp_num = int(epp_num_str)  # TODO assumes greater than 1000
            try:
                latest_episode_num = max(epp_num, latest_episode_num)
            except:
                import ipdb

                ipdb.set_trace()
                print(f"Error with parsing episode from list {epp_num}")

            # import ipdb

            # ipdb.set_trace()
            if epp_num <= latest_downloaded_episode_number:
                print(
                    f"Stopped fetching list of episodes. latest_episode_num={latest_episode_num} Reached epp_num={epp_num}. latest_num={latest_downloaded_episode_number}"
                )
                done_with_pages = True
                break
            link_to_episode.append(
                {
                    "link": link_wrapper[0].attrs["data-column-clickable"],
                    "epp_num": epp_num,
                }
            )
        except Exception as e:
            print(f"Error with fetching episode {epp_num}", e)
            import ipdb

            ipdb.set_trace()
    print(f"Finished getting episodes for page {str(pg_num)}")


print("Continue?")
import ipdb

ipdb.set_trace()

print(f"Got episodes... total={len(link_to_episode)}")

# get existing episodes
with open(
    Path.joinpath(
        parent_dir,
        f"scripts/treasures_for_the_soul/data/episodes.json",
    ),
    "r",
    encoding="utf8",
) as f:
    episode_list = json.load(f)


for index, entry in enumerate(link_to_episode):
    try:
        link = entry["link"]
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

        content_container = (
            site_contents[0]
            .find_all("section")[1]
            .find_all("div", class_="elementor-widget-wrap")[0]
            .find_all("div", class_="elementor-widget-container")[7]
        )

        content_children = [
            *site_contents[0]
            .find_all("section")[1]
            .find_all("div", class_="elementor-widget-wrap")[0]
            .find_all("div", class_="elementor-widget-container")[7]
            .children
        ]
        # import ipdb

        # ipdb.set_trace()
        # check if content_container elements have `elementor-jet-audio`
        # if so, make similar query but .find_all("div", class_="elementor-widget-container")[8]
        if len(content_container.find_all("div", class_="elementor-jet-audio")) > 0:
            content_children = [
                *site_contents[0]
                .find_all("section")[1]
                .find_all("div", class_="elementor-widget-wrap")[0]
                .find_all("div", class_="elementor-widget-container")[8]
                .children
            ]

        content_text = []
        # import ipdb

        # ipdb.set_trace()
        anchor_link = ""
        if (
            len(site_contents[0].find_all("a", class_="jet-listing-dynamic-link__link"))
            > 0
        ):
            anchor_link = (
                site_contents[0]
                .find_all("a", class_="jet-listing-dynamic-link__link")[0]
                .attrs["href"]
            )
        if len(site_contents[0].find_all("iframe")) > 0:
            anchor_link = site_contents[0].find_all("iframe")[0].attrs["src"]
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

            # import ipdb

            # ipdb.set_trace()

        # some may be EP 1523 無限者真的用愛子的血和我立永恆愛約
        # some may be EP1523 無限者真的用愛子的血和我立永恆愛約 (without space)
        # use regex to extract the number
        episode_num_str = title
        match = re.search(r"EP\s?(\d+)", episode_num_str, re.IGNORECASE)
        if match:
            episode_num_str = match.group(1)

        episode_num = 99999
        try:
            episode_num = int(episode_num_str)  # TODO assumes greater than 1000
        except Exception as e:
            import ipdb

            ipdb.set_trace()
            print(
                f"Error with parsing episode num {episode_num_str} from episode {title}"
            )
            episode_num = 99999
        try:
            episode_name = "".join(title.split(" ")[1:]).strip()
        except Exception as e:
            episode_name = "COULD NOT FIND"

        episode_list.append(
            {
                "id": episode_num,
                "title": title,
                "number": episode_num,
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

dup = {}
filtered_episode_list = []
for episode in episode_list:
    if episode["id"] in dup:
        continue
    dup[episode["id"]] = True
    filtered_episode_list.append(episode)

# if not number, put at end
filtered_episode_list.sort(
    key=lambda episode: int(episode["number"]) if episode["number"] else 999999
)


with open(
    Path.joinpath(
        parent_dir,
        f"scripts/treasures_for_the_soul/data/episodes.json",
    ),
    "w",
    encoding="utf8",
) as f:
    json.dump(filtered_episode_list, f, ensure_ascii=False, indent=4)
