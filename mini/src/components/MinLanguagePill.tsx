import React from 'react';
import { getSecondLanguageOptions, getSongType, SongType } from '../utils/constants';
import { SongTypeConsumer } from '../utils/utils';

const ACTIVE_STYLE = `bg-[#3F7DC1] text-white`
const INACTIVE_STYLE = `border border-zinc-200 text-zinc-500 hover:bg-slate-300/50`

const LanguagePill = ({ }: {}) => {

    const { secondLanguageName, secondLanguageOption } = getSecondLanguageOptions();

    let visibleLanguages: SongType[];
    if (secondLanguageName == SongType.portuguese.toString()) {
        visibleLanguages = [SongType.english, SongType.chinese, SongType.portuguese]
    }
    else {
        visibleLanguages = [SongType.english, getSongType(secondLanguageName)]
    }

    return (
        <div className="">
            <SongTypeConsumer>
                {({ songType, setSongType }) => (
                    <div className="flex gap-2 flex-wrap">
                        {
                            visibleLanguages.map((lang) => (
                                <button
                                    key={lang}
                                    onClick={() => setSongType(lang)}
                                    className={`px-2 py-1 rounded-md text-[12px] ${songType === lang
                                        ? ACTIVE_STYLE : INACTIVE_STYLE}`}
                                >
                                    {lang?.charAt(0)?.toUpperCase() + lang?.slice(1)}
                                </button>
                            ))
                        }
                    </div>
                )}
            </SongTypeConsumer>
        </div>
    )
}

export default LanguagePill;