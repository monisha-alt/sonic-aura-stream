
export interface LyricsType {
  songId: string;
  lyrics: string;
  contributors?: string[];
  lastUpdated?: string;
}

export const lyrics: Record<string, LyricsType> = {
  "s1": {
    songId: "s1",
    lyrics: "I've been tryna call\nI've been on my own for long enough\nMaybe you can show me how to love, maybe\nI'm going through withdrawals\nYou don't even have to do too much\nYou can turn me on with just a touch, baby\n\nI look around and\nSin City's cold and empty (Oh)\nNo one's around to judge me (Oh)\nI can't see clearly when you're gone\n\nI said, ooh, I'm blinded by the lights\nNo, I can't sleep until I feel your touch\nI said, ooh, I'm drowning in the night\nOh, when I'm like this, you're the one I trust",
    contributors: ["The Weeknd", "Max Martin", "Oscar Holter"],
    lastUpdated: "2020-03-20"
  },
  "s2": {
    songId: "s2",
    lyrics: "White shirt now red, my bloody nose\nSleeping, you're on your tippy toes\nCreeping around like no one knows\nThink you're so criminal\nBruises on both my knees for you\nDon't say thank you or please\nI do what I want when I'm wanting to\nMy soul? So cynical\n\nSo you're a tough guy\nLike it really rough guy\nJust can't get enough guy\nChest always so puffed guy\nI'm that bad type\nMake your mama sad type\nMake your girlfriend mad tight\nMight seduce your dad type\nI'm the bad guy\nDuh",
    contributors: ["Billie Eilish", "Finneas O'Connell"],
    lastUpdated: "2019-03-29"
  },
  "s3": {
    songId: "s3",
    lyrics: "If you don't wanna see me\nDid a full 180, crazy\nThinking 'bout the way I was\nDid the heartbreak change me? Maybe\nBut look at where I ended up\nI'm all good already\nSo moved on, it's scary\nI'm not where you left me at all, so\n\nIf you don't wanna see me dancing with somebody\nIf you wanna believe that anything could stop me\n\nDon't show up, don't come out\nDon't start caring about me now\nWalk away, you know how\nDon't start caring about me now",
    contributors: ["Dua Lipa", "Caroline Ailin", "Ian Kirkpatrick", "Emily Warren"],
    lastUpdated: "2019-10-31"
  },
  "s4": {
    songId: "s4",
    lyrics: "If you wanna run away with me, I know a galaxy\nAnd I can take you for a ride\nI had a premonition that we fell into a rhythm\nWhere the music don't stop for life\nGlitter in the sky, glitter in my eyes\nShining just the way I like\n\nIf you feeling like you need a little bit of company\nYou met me at the perfect time\nYou want me, I want you, baby\nMy sugarboo, I'm levitating\nThe Milky Way, we're renegading\nYeah, yeah, yeah, yeah, yeah",
    contributors: ["Dua Lipa", "Stephen Kozmeniuk", "Sarah Hudson", "Clarence Coffee Jr."],
    lastUpdated: "2020-10-01"
  },
  "s5": {
    songId: "s5",
    lyrics: "Tastes like strawberries on a summer evenin'\nAnd it sounds just like a song\nI want more berries and that summer feelin'\nIt's so wonderful and warm\n\nBreathe me in, breathe me out\nI don't know if I could ever go without\nI'm just thinking out loud\nI don't know if I could ever go without\n\nWatermelon sugar high\nWatermelon sugar high\nWatermelon sugar high\nWatermelon sugar high\nWatermelon sugar",
    contributors: ["Harry Styles", "Tyler Johnson", "Kid Harpoon", "Mitch Rowland"],
    lastUpdated: "2019-11-16"
  },
  "s6": {
    songId: "s6",
    lyrics: "We couldn't turn around till we were upside down\nI'll be the bad guy now, but know I ain't too proud\nI couldn't be there even when I tried\nYou don't believe it, we do this every time\n\nSeasons change and our love went cold\nFeed the flame 'cause we can't let go\nRun away, but we're running in circles\nRun away, run away\n\nI dare you to do something\nI'm waiting on you again\nSo I don't take the blame\nRun away, but we're running in circles\nRun away, run away, run away",
    contributors: ["Post Malone", "Frank Dukes", "Louis Bell", "Billy Walsh", "Kaan Güneşberk"],
    lastUpdated: "2019-08-05"
  }
};
