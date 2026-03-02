import React, { useContext } from 'react';
import { SongTypeContext } from './SongTypeProvider';
import { SongType, userHasRoleOrAdmin, UserRole } from '../lib/constants';
import UserInfo from '../ts/types/userInfo.interface';
import { userCanSeeBilingual } from '../lib/users/role';
import { Flex } from './base';
import Pill from './base/Pill';
import { useDisplaySongTypes } from '../lib/userProperties';

const LanguagePill = ({
    user
}: { user: UserInfo }) => {

    const { songType, changeSongType: toggleSongType } = useContext(SongTypeContext);
    let userSetLang: SongType[] = useDisplaySongTypes();
    let visibleLanguages: SongType[];
    if (userHasRoleOrAdmin(user, UserRole.readOtherLang)) {
        visibleLanguages = userSetLang?.length == 1 ? [SongType.english, SongType.chinese] : userSetLang;
    } else if (userCanSeeBilingual(user)) {
        visibleLanguages = [SongType.english, SongType.chinese]
    } else {
        visibleLanguages = [SongType.english, SongType.chinese]
    }

    return (
        <div className="">
            <Flex flexDirection="row" className="gap-1 flex-wrap">
                {visibleLanguages.map((lang) => (
                    <Pill
                        key={lang}
                        isActive={songType === lang}
                        onClick={() => toggleSongType(lang)}
                    >
                        {lang?.charAt(0)?.toUpperCase() + lang?.slice(1)}
                    </Pill>
                ))}
            </Flex>
        </div>
    )
}

export default LanguagePill;