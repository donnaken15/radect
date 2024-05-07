
//import {inspect} from 'util';

{
	var argv = process.argv;
	if (argv.length <= 2) {
		console.log("radect - youtube chat viewer");
		console.log("node radect_youtube-chat [(...).rechat.json]");
		process.exit(1);
	}
}

function TimeFormat(ms) {
	return (ms < 0 ? "-" : "") +
		pad2(Math.floor(Math.abs(ms) / 3600000)) + ':' +
		pad2(Math.floor((Math.abs(ms) / 60000) % 60)) + ':' +
		(Math.abs(ms)/1000 % 60).toFixed(3).padStart(6,'0');
}
function DateFormat(date) {
	return pad2(date.getMonth()+1)+'/'+
			pad2(date.getDate()+1)+'/'+
			(date.getFullYear()).toString().substr(2,2)+' '+
			pad2(date.getHours())+':'+
			pad2(date.getMinutes())+':'+
			pad2(date.getSeconds());
}
function pad2(t,d='0') { return t.toString().padStart(2,d); }
const colors = true;
function e(c) { return colors ? "\x1b["+c+"m" : ""; }
function t(o,k='simpleText') { try { return o[k]; } catch { return null; } }
const fs = require('fs');
const fsopt = {encoding:'utf8', flag:'r'};

const imposters=JSON.parse(fs.readFileSync(__dirname+"\\imposters.json", fsopt));
const sus = {
	"name": null,
	"color": 97
};
var tz = new Date().getTimezoneOffset();

console.log(e(0));
fs.readFileSync(process.argv[2], fsopt).split('\n').forEach(
	(line) => {
		if (line !== '')
		{
			var root = JSON.parse(line);
			var data = root.replayChatItemAction;
			//console.log(data);
			var test = data.actions[0];
			if (test.hasOwnProperty('addChatItemAction'))
			Object.keys(test.addChatItemAction.item).forEach(
				(key) => {
					var obj = data.actions[0].addChatItemAction.item[key];
					var ts = new Date(parseInt(BigInt(obj.hasOwnProperty("timestampUsec") ? obj.timestampUsec : 0)/1000n) + tz);
					switch (key) {
						case "liveChatViewerEngagementMessageRenderer":
							var message = "";
							obj.message.runs.forEach(
								(seg) => {
									switch (Object.keys(seg)[0])
									{
										case 'text':
											message += seg.text;
											break;
										case 'emoji':
											message += seg.emoji.emojiId.startsWith('UC') ?
												':'+seg.emoji.searchTerms+':' : seg.emoji.emojiId;
											break;
									}
									message += ' ';
								}
							);
							console.log(e(95)+DateFormat(ts),
										e(37)+message.slice(0, -1));
							break;
						case "liveChatPlaceholderItemRenderer":
							break;
						default:
							console.log(e(91) + "uncaught " + key + e(0));
							break;
						case "liveChatTextMessageRenderer":
						case "liveChatPaidMessageRenderer":
						case "liveChatTickerPaidMessageItemRenderer":
							var userColor = sus.color;
							var userName = t(obj.authorName);
							var verified = false;
							var moderator = false;
							{
								for (var chan in imposters) {
									if (userName.toLowerCase() == imposters[chan].name.toLowerCase())
									{
										if (obj.authorExternalChannelId == imposters[chan].id)
											userColor = imposters[chan].color;
										else
											userColor = 31;
									}
								}
							}
							if (obj.authorBadges !== undefined)
								obj.authorBadges.forEach(
									(icon) => {
										if (!icon.liveChatAuthorBadgeRenderer.hasOwnProperty('icon'))
											return;
										var key = icon.liveChatAuthorBadgeRenderer.icon.iconType;
										switch (key) {
											case "MODERATOR":
												userColor = 94;
												moderator = true;
												break;
											case "VERIFIED":
												userName += " \u2713";
												verified = true;
												break;
										}
									}
								);
							var message = "";
							obj.message.runs.forEach(
								(seg) => {
									switch (Object.keys(seg)[0])
									{
										case 'text':
											message += seg.text;
											break;
										case 'emoji':
											message += seg.emoji.emojiId.startsWith('UC') ?
												':'+seg.emoji.searchTerms+':' : seg.emoji.emojiId;
											break;
									}
									message += ' ';
								}
							);
							var prefix = "";
							if (obj.purchaseAmountText !== undefined)
								prefix += e(92) + 'sent ' + t(obj.purchaseAmountText) + ' ' + e(97);
							console.log(e(95)+DateFormat(ts),
										e(90)+(t(obj.timestampText) ?? TimeFormat(parseInt(root.videoOffsetTimeMsec))).padStart(13),
										//e(34)+obj.authorExternalChannelId,
										e(userColor)+userName,
										e(37)+prefix+message.slice(0, -1));
							break;
					}
				}
			);
			else if (test.hasOwnProperty('replaceChatItemAction'))
			{
				//console.log(inspect(test, true, 20, true));
			}
		}
	}
);
console.log(e(0));
