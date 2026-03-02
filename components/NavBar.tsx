import React, { useEffect } from "react";
import { useSession } from "next-auth/react";

import Feedback from "./Feedback";
import Row from "./row";
import { Link, Flex } from "./base";
import { useUser } from "../lib/uiUtils";
import { SongType, userHasRoleOrAdmin, UserRole } from "../lib/constants";
import { userCanSeeBilingual } from "../lib/users/role";
import { SongTypeContext } from "./SongTypeProvider";


/**
 * Navigation Bar
 */
export const NavBar = (): JSX.Element => {
  // below, if loading, it should be light pink. If done loading, but session doesn't exist, it should be light pink.
  // if session, exists, have it be the normal pink
  const { data: session, status } = useSession();
  const user = useUser(session?.user?.email, status);
  const { songType, changeSongType } = React.useContext(SongTypeContext);

  useEffect(() => {
    // if user cannot see both chinese and english so let's set the proper song type it can see
    if (!userCanSeeBilingual(user)) {
      // if user cannot see either, set english by default
      // this shouldnt happen
      if (!userHasRoleOrAdmin(user, UserRole.readEnglishSongs) && !userHasRoleOrAdmin(user, UserRole.readChineseSongs) && songType != SongType.english) {
        changeSongType(SongType.english);
        return;
      }
      // if can see english but seeing chinese
      else if (userHasRoleOrAdmin(user, UserRole.readEnglishSongs) && songType != SongType.english) {
        changeSongType(SongType.english);
        return;
      }
      // if can see chinese but seeing english
      else if (userHasRoleOrAdmin(user, UserRole.readChineseSongs) && songType != SongType.chinese) {
        changeSongType(SongType.chinese);
        return;
      }
    }
  }, [user])

  return (
    <Row className="w-full">
      <Flex className="flex-1">
        <Link
          fontSize="16px"
          underline
          href="/"
          color="#F497B8"
          hoverColor="#F497B8"
          className="pb-3"
        >
          Home
        </Link>
        <Link
          fontSize="16px"
          underline
          href="/favorites"
          color="#F497B8"
          hoverColor="#F497B8"
          className="pb-3 pl-3"
        >
          Favorites
        </Link>
        <Link
          fontSize="16px"
          underline
          href="/profile"
          color={status != "authenticated" || !user ? "#f9cbdb" : "#F497B8"}
          hoverColor="#F497B8"
          className="pl-3 pb-3"
        >
          Profile
        </Link>
      </Flex>
      <Flex
        className="flex-1 items-end pr-2 sm:p-0"
        flexDirection="column"
      >
        <Feedback />
      </Flex>
    </Row>
  );
};

export default NavBar;
