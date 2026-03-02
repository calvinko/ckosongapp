import { getSongType, SongType } from "../../../lib/constants";
import actualSongList from "../../../lib/generated/actualSongList.json"

import { create, insertMultiple, search } from '@orama/orama';
import { createTokenizer } from '@orama/tokenizers/mandarin'
import { stopwords as mandarinStopwords } from "@orama/stopwords/mandarin";
import { afterInsert as highlightAfterInsert, searchWithHighlight } from '@orama/plugin-match-highlight'

// the search document DB
let document;
let chineseDocument;
let portugueseDocument;

/**
 * Handles GET /api/songs/search?searchQuery="..."&songType=english
 */
const handler = async (req, res) => {
    if (req.method !== "GET") {
        res.setHeader("Allow", "GET");
        return res.status(405).end();
    }
    // song type ignored for now
    const {
        query: { songType: songTypeParam, searchQuery },
    } = req;

    if (!document || !chineseDocument) {
        document = await create({
            schema: {
                id: 'string',
                hymn: 'string',
                pageNumber: 'number',
                content: 'string',
                name: 'string',
                songType: 'string'
            },
            components: {
                // Register the hook
                afterInsert: [highlightAfterInsert]
            }
        });
        chineseDocument = await create({
            schema: {
                id: 'string',
                hymn: 'string',
                pageNumber: 'number',
                content: 'string',
                name: 'string',
                songType: 'string'
            },
            components: {
                // Register the hook
                tokenizer: createTokenizer({
                    stopWords: mandarinStopwords,
                }),
                afterInsert: [highlightAfterInsert]
            }
        });
        portugueseDocument = await create({
            schema: {
                id: 'string',
                hymn: 'string',
                pageNumber: 'number',
                content: 'string',
                name: 'string',
                songType: 'string'
            },
            components: {
                // Register the hook
                afterInsert: [highlightAfterInsert]
            }
        });
        const songs = Object.values(actualSongList.songs)
        const books = actualSongList.hymnBooks;

        const englishSongs = songs.filter(song => song.songType === SongType.english).filter(song => books[song.hymn]?.isSearchable !== false)
        const chineseSongs = songs.filter(song => song.songType === SongType.chinese).filter(song => books[song.hymn]?.isSearchable !== false)
        const portugueseSongs = songs.filter(song => song.songType === SongType.portuguese)

        const docs = englishSongs.map((song, i) => {
            let content = song.content.replace(/\n/g, ' ')
            content = content.trim();
            return {
                id: song.slug,
                hymn: song.hymn,
                pageNumber: parseInt(song.pageNumber),
                // slug: song.slug,
                content: content,
                name: song.name,
                songType: song.songType
            };
        })
        await insertMultiple(document, docs, songs.length);

        const chineseDocs = chineseSongs.map((song, i) => {
            let content = song.content.replace(/\n/g, ' ')
            content = content.trim();
            return {
                id: song.slug,
                hymn: song.hymn,
                pageNumber: parseInt(song.pageNumber),
                // slug: song.slug,
                content: content,
                name: song.name,
                songType: song.songType
            };
        })
        await insertMultiple(chineseDocument, chineseDocs, chineseSongs.length);

        const portugueseDocs = portugueseSongs.map((song, i) => {
            let content = song.content.replace(/\n/g, ' ')
            content = content.trim();
            return {
                id: song.slug,
                hymn: song.hymn,
                pageNumber: parseInt(song.pageNumber),
                // slug: song.slug,
                content: content,
                name: song.name,
                songType: song.songType
            };
        }
        )
        await insertMultiple(portugueseDocument, portugueseDocs, portugueseSongs.length);
    }


    // if (!songType) {
    //     return res.status(400).json({
    //         errors: [{ message: `Invalid Song type. Must be english or chinese.` }],
    //     });
    // }

    try {

        let docToSearch;
        switch (songTypeParam) {
            case SongType.chinese:
                docToSearch = chineseDocument;
                break;
            case SongType.portuguese:
                docToSearch = portugueseDocument;
                break;
            case SongType.english:
            default:
                docToSearch = document;
        }
        console.log(`Searching for query=${searchQuery} in songType=${songTypeParam}`)
        let searchResult = await searchWithHighlight(docToSearch, {
            term: searchQuery,
            properties: ["content", "name"],
            threshold: 0.1,
            exact: true,
            // tolerance: 3,
            boost: {
                content: 2,
            },
            limit: 40
        })
        const processedRes = searchResult.hits.map(entry => {
            const contentPos = entry.positions.content; // content key's positions, not name or other keys we also search in

            // positions look like:
            // "content": {
            //     "utterly": [
            //     {
            //         "start": 322,
            //         "length": 7
            //     }
            //     ],
            //     "despised": [
            //     {
            //         "start": 330,
            //         "length": 8
            //     }
            // make it look like:
            // [ [ 322, 329 ], [ 330, 338 ] ]
            // where we have non overlapping intervals for all the keys
            const positions = Object.values(contentPos).flatMap(val => val).map(pos => {
                return [pos.start, pos.start + pos.length]
            })

            // merge the intervals together
            let positionIntervals = []
            if (positions.length > 0) {
                positions.sort((x, y) => x[0] - y[0]);
                positionIntervals.push(
                    [positions[0][0], positions[0][1]]
                );
                let preEnd = positions[0][1];
                for (const [start, end] of positions) {
                    if (start > preEnd) {
                        positionIntervals.push([start, end]);
                        preEnd = end;
                    } else {
                        let pre = positionIntervals.pop();
                        let left = Math.min(pre[0], start);
                        let right = Math.max(pre[1], end);
                        positionIntervals.push([left, right]);
                        preEnd = right;
                    }
                }
            }

            return {
                id: entry.id,
                score: entry.score,
                document: entry.document,
                positionIntervals: positionIntervals
            };
        })

        return res.status(200).json({ result: processedRes });
    } catch (err) {
        console.error(
            `Error searching for songs searchQuery=${searchQuery}. ${err} ${err.stack}`,
            err
        );
        res.status(500).json({
            errors: [
                {
                    message: `Failed to search for songs ${err} ${err.lineNumber}`,
                    searchQuery
                },
            ],
        });
    }
};

export default handler;
