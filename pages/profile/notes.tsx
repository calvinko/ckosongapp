import Fuse from "fuse.js";
import { useSession } from "next-auth/react";
import Head from "next/head";
import { useRouter } from "next/router";
import React, { useState } from "react";
import { Toaster } from "react-hot-toast";
import { Box, Heading, Link, Text, TextField, Flex } from "../../components/base";
import NavBar from "../../components/NavBar";
import Placeholder from "../../components/Placeholder";
import SearchBar from "../../components/SearchBar";
import SongNoteBox from "../../components/SongNote";
import { userHasRoleOrAdmin, UserRole } from "../../lib/constants";
import { toDateFullYearString } from "../../lib/dateUtils";
import { NOTE_SEARCH_FUSE_OPTIONS, toSearchableSongNote, useNotesForUser } from "../../lib/generic-entries/songNotes";
import { useSongs, useUser } from "../../lib/uiUtils";
import { SearchableSongNote } from "../../ts/types/songNote.interface";
import UserInfo from "../../ts/types/userInfo.interface";
import { ChevronLeft } from "react-feather";


/**
 * Song Notes on a user - lists all song notes the user has written
 */
const ProfileSongNotes = () => {
  const router = useRouter()
  const { data: session, status } = useSession();
  const loadingSession = status == "loading";

  const [noteSearchVal, setNoteSearchVal] = useState("");

  const email: string | null | undefined = session?.user?.email;
  const user: UserInfo | null = useUser(email, status);
  const songMap = useSongs();

  const { songNotes, isLoading } = useNotesForUser(user?.email);

  /**
   * Go back to the previous page
   */
  const onBackClick = () => {
    router.back();
  }

  if (loadingSession) {
    return (
      <Box className="max-w-[95%] md:max-w-lg my-16 mx-3 md:mx-auto">
        <Placeholder fluid>
          <Placeholder.Header>
            <Placeholder.Line />
            <Placeholder.Line />
          </Placeholder.Header>
          {[...Array(5)].map((e, index) => (
            <Placeholder.Paragraph key={`placeholder-${index}`}>
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
              <Placeholder.Line />
            </Placeholder.Paragraph>
          ))}
        </Placeholder>
      </Box>
    );
  }

  const hasAccess = userHasRoleOrAdmin(user, UserRole.songNotes);
  if (!user || !hasAccess) {
    return (
      <Flex
        className="items-center justify-center w-full h-10"
        m="20% 0"
        flexDirection="row"
      >
        <Box width="320px">
          <Text as="p">Sorry, not available. 😕</Text>
          <Link href="/" underline>Go back home</Link>
        </Box>
      </Flex>
    )
  }

  let notesToShow: SearchableSongNote[] = songNotes?.map(note => toSearchableSongNote(note, songMap[note?.slug])) ?? []
  const notesSearchFuse = new Fuse(notesToShow, NOTE_SEARCH_FUSE_OPTIONS);

  if (noteSearchVal) {
    notesToShow = notesSearchFuse.search(noteSearchVal).map((res) => res.item);
  }

  const sortedSongNotes = notesToShow?.sort((a, b) => b?.createdAt - a?.createdAt) ?? []

  // group song notes by day and sort by date
  let notesByDate: { [name: string]: SearchableSongNote[] } = {}
  sortedSongNotes.forEach(note => {
    const createdAt = new Date(note?.createdAt);
    const dataStr = toDateFullYearString(createdAt);
    if (dataStr in notesByDate) {
      notesByDate[dataStr].push(note);
    } else {
      notesByDate[dataStr] = [note];
    }
  });

  return (
    <Flex
      className="min-h-screen	items-center sm:p-0 my-8 mx-3 sm:mx-2 items-center"
      flexDirection="column"
    >
      <Head>
        <title>Song Notes</title>
        <link rel="icon" href="/favicon.ico" />
        <meta property="og:title" content={`Song Notes`} key="title" />
      </Head>
      <Flex className="flex-1" flexDirection="column">
        <Toaster />
        <Box className="max-w-lg sm:min-w-[576px] w-full">
          <NavBar />
          <SearchBar />
          <div className="mt-6">
            <Link className="cursor-pointer" lineHeight="0" onClick={onBackClick}>
              <>
                <ChevronLeft className="inline arrow-icon" />
                Back
              </>
            </Link>
            <Heading as="h3" type="h3" className="mt-1 mb-1">
              Notes
            </Heading>
          </div>
          <div className="mt-2 pb-2 w-full">
            <TextField
              aria-label="Search notes by song/text/time"
              autoComplete=""
              id="search-notes-input"
              lines={1}
              type="input"
              inputClassName="leading-none"
              placeholder="Search by song, text, or time"
              value={noteSearchVal}
              onChange={(e) => { setNoteSearchVal(e?.target?.value ?? "") }}
            />
          </div>
          <div className="mt-5">
            {
              Object.entries(notesByDate).map(([dateStr, notes]) => (
                <div className="flex flex-col mb-5">
                  <Text
                    as="p"
                    fontSize="14px"
                    fontWeight={500}
                    className="mb-2"
                  >
                    {dateStr}
                  </Text>
                  {
                    notes?.map((note) => (
                      <SongNoteBox
                        songNote={note}
                        song={songMap[note?.slug]}
                        withSong
                      />
                    ))
                  }
                </div>
              ))
            }
            {
              isLoading ? (
                <Box className="max-w-[95%] md:max-w-lg my-4 mx-4 md:mx-auto w-full">
                  <Placeholder fluid>
                    <Placeholder.Header>
                      <Placeholder.Line />
                      <Placeholder.Line />
                    </Placeholder.Header>
                    {[...Array(5)].map((e, index) => (
                      <Placeholder.Paragraph key={`placeholder-${index}`}>
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                        <Placeholder.Line />
                      </Placeholder.Paragraph>
                    ))}
                  </Placeholder>
                </Box>
              ) : (!isLoading && sortedSongNotes?.length <= 0) ?
                <Flex
                  m="20% 0"
                  className="items-center justify-center w-full h-10"
                  flexDirection="row"
                >
                  <Box>
                    <Text as="p">No notes yet!</Text>
                    <Link href="/" underline>Go back home</Link>
                  </Box>
                </Flex> : null
            }

          </div>
        </Box>
      </Flex>
    </Flex>
  )
}

export default ProfileSongNotes;