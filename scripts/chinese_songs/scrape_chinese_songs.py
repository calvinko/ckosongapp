import json
from bs4 import BeautifulSoup
import requests
from pathlib import Path

"""
This script scrapes a downloaded html file of a list of songs for a book. It then scrapes for each song lyrics, write their lyrics in `songContent/` and then add a list of songs 
to scraped_song_list.json and also adds it to the "truth" list of songs "chineseSongList.json"
"""

parent_dir = Path(__file__).resolve().parent.parent.parent
path_to_book_page = Path(str(Path.home()) + "/Downloads/to_scrape.html")

# open the html file that you saved from the browser with the list of songs (with all the loaded songs since it paginates)
# example https://churchofgod.org.hk/book/18%e5%86%8a/
link_to_songs = []
with open(path_to_book_page, "r") as f:
    content = f.read()
    soup = BeautifulSoup(content, "html.parser")

    # get parent div that holds the list of songs (you manually find it)
    parents = soup.find_all(attrs={"data-id": "40f1ddf9"})

    # there should only be one "parent" with the data-id that you manually got
    # this would hold an `ae-post-list-wrapper` div which is a list of items, each is an <article>
    # Each <article> is the song item and it holds two <a> which include the link to the song

    list_holder = (
        parents[0].find_all("div", class_="ae-post-list-wrapper")[0].find_all("article")
    )
    for song in list_holder:
        link_to_song = song.find_all("a")[0]["href"]
        link_to_songs.append(link_to_song)

song_list = []
# for each song, we load it's page and get it's contents
for link in link_to_songs:
    res = requests.get(link)
    soup = BeautifulSoup(res.content, "html.parser")

    site_contents = soup.find_all("div", class_="site-content")
    title = (
        site_contents[0]
        .find_all("h2", class_="elementor-heading-title")[0]
        .text.strip()
    )

    # transform to the correct slug we use

    # if there's no space in between song page and name (bad inconsitent data)
    # like H20-66我要差訓慰師真理的聖靈來！
    # easy case is H20-66 我要差訓慰師真理的聖靈來！
    if len(title.split(" ")) <= 1:
        actual_name = ""
        curr_cursor = 0
        hit_number = False  # for when we hit the song book number
        hit_dash = False  # for when we hit the page number (after the dash)
        string_page_num = ""
        for char in title:
            if not char.isdigit() and not hit_number:
                # we are still in the beginning like "L" of "LO3"
                curr_cursor += 1
            elif char.isdigit() and not hit_number:
                hit_number = True
                curr_cursor += 1
            elif char.isdigit() and hit_number and not hit_dash:
                curr_cursor += 1
            elif char.isdigit() and hit_number and hit_dash:
                # page number character
                string_page_num += char
                curr_cursor += 1
            elif char == "-" and hit_number:
                hit_dash = True
                curr_cursor += 1
            elif char == "." and hit_number:
                curr_cursor += 1
            else:
                # not a digit, maybe a space
                # but we've already hit a number
                # this is probably the beginning of the name or a space, which we'll remove later
                name = title[curr_cursor:]

        book_short = title.split("-")[0].upper()
        page_num = int(string_page_num)
    else:
        # ex: h18-80
        dash_slug = title.split(" ")[0]
        book_short = dash_slug.split("-")[0].upper()
        page_num = int(dash_slug.split("-")[1])
        name = title.split(dash_slug)[1].strip()

    slug = f"{book_short}_{page_num}"

    # find div that holds the text of the song
    song_parents = site_contents[0].find_all(
        "div", class_="elementor-widget-container"
    )[-1]

    # create the song text from the html
    song_text = ""
    for line in song_parents.find_all("p"):
        # remove all the white space and put in \n for every <br> and \n\n for every <p>
        song_text += line.get_text(separator="\n").strip() + "\n\n"

    # create song for song list
    song_list.append(
        {
            "bookid": "-1",
            "pagenum": page_num,
            "songname": title,
            "hymn": book_short,
            "isChinese": True,
            "name": name,
            "hasMultipleInPage": False,
            "slug": slug,
        }
    )

    with open(
        Path.joinpath(parent_dir, f"songContent/chinese/{slug}.md"),
        "w",
        encoding="utf8",
    ) as f:
        f.write(song_text)

song_list.sort(key=lambda song: int(song["pagenum"]))

# populated scraped_song_list
with open(
    Path.joinpath(parent_dir, f"scripts/chinese_songs/scraped_song_list.json"),
    "r",
    encoding="utf8",
) as f:
    old_scraped_song_list = json.loads(f.read())

with open(
    Path.joinpath(parent_dir, f"scripts/chinese_songs/scraped_song_list.json"),
    "w",
    encoding="utf8",
) as f:
    json.dump(old_scraped_song_list + song_list, f, ensure_ascii=False)

# read chinese song list and the write in the one after
with open(
    Path.joinpath(parent_dir, f"lib/chineseSongList.json"), "r", encoding="utf8"
) as f:
    curr = json.loads(f.read())

with open(
    Path.joinpath(parent_dir, f"lib/chineseSongList.json"), "w", encoding="utf8"
) as f:
    json.dump(curr + song_list, f, ensure_ascii=False)
