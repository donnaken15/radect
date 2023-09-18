colored chat viewer in command prompt

requires JSON from yt-dlp --write-sub (for twitch, use https://github.com/mpeter50/yt-dlp/tree/twitchvod-livechat)

use as:
yt-dlp --write-sub ABCDEFGHIJK --skip-download
node radect_youtube-chat.js "[ABCDEFGHIJK].live_chat.json"
