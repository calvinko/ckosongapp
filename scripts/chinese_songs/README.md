Chinese songs comes from the kosolution.net mysql database dump (3/13/2021). I took the book table (`songbook` in `chinese_book_table.json`) and song table (`songbooktext` in `chinese_song_text.json`).

by running `process_db.py`, it looks at these two raw data db points and creates chineseSongList.json in `lib/chineseSongList.json`

For H19 and above, we get them from the Church of God in Hong kong website (https://churchofgod.org.hk/book/21%e5%86%8a/). To do so, we scrape it. There's some dynamic paging so we get all the songs loaded in the page and save the html to `~/Downloads/to_scrape.html` which we then parse and get all the song lyrics. It then populates `songContent/chinese` and then updates `lib/chineseSongList.json` and adds the songs to `scraped_song_list.json` for a location just to store the scraped songs (just in case). The script is `scrape_chinese_songs.py`.
