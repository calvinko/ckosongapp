import json
from bs4 import BeautifulSoup
import requests
from pathlib import Path


### no_lyrics_slugs=['CH1_4', 'CH1_9', 'CH1_11', 'CH1_12', 'CH1_20', 'CH1_23', 'CH1_25', 'CH1_26', 'CH1_28', 'CH1_39']

parent_dir = Path(__file__).resolve().parent.parent.parent
with open(
    Path.joinpath(
        parent_dir,
        f"lib/chineseSongList.json",
    ),
    "r",
    encoding="utf8",
) as f:
    chinese_songs = json.load(f)["songs"]
    chinese_songs_by_slug = {song["slug"]: song for song in chinese_songs}

no_lyrics_slugs = []
############################################################################################################################
# 1.
# Pulls lyrics based off of the pattern of the url and the song's page number and name. However, the format may not always work
# like name isn't fully in the link, different characters, url uses other hymn book as reference etc
############################################################################################################################
# to_parse_lyric_songs = filter(lambda s: s["hymn"] == "CH2", chinese_songs)

# for song in to_parse_lyric_songs:
#     ## 3 turns into 003
#     formatted_num = f"{int(song['pagenum']):03}"
#     slug = song["slug"]

#     # hymnal collection 1 CH1 has the format of s1-001-{song name}
#     res = requests.get(
#         f"https://churchofgod.org.hk/hymns/s2-{formatted_num}-{song['name'].strip()}"
#     )
#     soup = BeautifulSoup(res.content, "html.parser")

# parents = soup.find_all(attrs={"data-id": "6c277154"})
# # get parent div
# # site_contents = soup.find_all("div", class_="site-content")
# if len(parents) == 0:
#     print(slug)
#     no_lyrics_slugs.append(slug)
#     continue

# # find div that holds the text of the song
# song_parents = parents[0].find_all("div", class_="elementor-widget-container")[-1]

# # create the song text from the html
# song_text = ""
# for line in song_parents.find_all("p"):
#     # remove all the white space and put in \n for every <br> and \n\n for every <p>
#     song_text += line.get_text(separator="").strip() + "\n\n"

# with open(
#     Path.joinpath(parent_dir, f"songContent/chinese/{slug}.md"),
#     "w",
#     encoding="utf8",
# ) as f:
#     f.write(song_text)

# import ipdb

# ipdb.set_trace()

############################################################################################################################
############################################################################################################################
############################################################################################################################

############################################################################################################################
# 2. Get the list of songs from the song book page and then get the lyrics from each song's page
############################################################################################################################
res = requests.get(
    f"https://churchofgod.org.hk/hymnbook/%E7%A5%9E%E5%AE%B6%E8%A9%A9%E6%AD%8C18%E5%86%8A/"
)
soup = BeautifulSoup(res.content, "html.parser")

# get parent div that holds the list of songs (you manually find it)
parents = soup.find_all(attrs={"data-id": "22a6678"})

# there should only be one "parent" with the data-id that you manually got
# this would hold an `ae-post-list-wrapper` div which is a list of items, each is an <article>
# Each <article> is the song item and it holds two <a> which include the link to the song

list_holder = (
    parents[0].find_all("div", class_="ae-post-list-wrapper")[0].find_all("article")
)

link_to_songs = []
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
    song = chinese_songs_by_slug.get(slug)
    if song is None:
        print("no song", slug)
        continue
    parents = soup.find_all(attrs={"data-id": "6c277154"})
    # get parent div
    # site_contents = soup.find_all("div", class_="site-content")
    if len(parents) == 0:
        print(slug)
        no_lyrics_slugs.append(slug)
        continue

    # find div that holds the text of the song
    song_parents = parents[0].find_all("div", class_="elementor-widget-container")[-1]

    # create the song text from the html
    song_text = ""
    for i, line in enumerate(song_parents.find_all("p")):
        # remove all the white space and put in \n for every <br> and \n\n for every <p>
        if i == len(song_parents.find_all("p")) - 1:
            song_text += line.get_text(separator="").strip()
        else:
            song_text += line.get_text(separator="").strip() + "\n\n"

    with open(
        Path.joinpath(parent_dir, f"songContent/chinese/{slug}.md"),
        "w",
        encoding="utf8",
    ) as f:
        f.write(song_text)


import ipdb

ipdb.set_trace()
