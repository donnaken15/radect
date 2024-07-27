
{
	var argv = process.argv;
	if (argv.length <= 2) {
		console.log("radect - youtube chat viewer");
		console.log("node radect_youtube-chat [(...).rechat.json]");
		process.exit(1);
	}
}

const inspect = require('util').inspect;
var readFile;
var get_file_args, TimeFormat, DateFormat, pad2, plat, t, sep;
{
	var fs = require('fs');
	[readFile] = [fs.readFileSync];
	var util = require('./util.js');
	[
		get_file_args,
		TimeFormat,
		DateFormat,
		pad2,
		plat,
		t,
		sep
	]
		=
	[
		util.get_file_args,
		util.TimeFormat,
		util.DateFormat,
		util.pad2,
		util.plat,
		util.t,
		util.sep
	];
}

const colors = true;
function e(c) { return colors ? "\x1b["+c+"m" : ""; }
const fsopt = {encoding:'utf8', flag:'r'};

try {
	JSON = require("json5"); // bun
} catch {}

const imposters=JSON.parse(readFile(__dirname+sep+"imposters.json", fsopt));
const sus = {
	"name": null,
	"color": 97
};
var tz = new Date().getTimezoneOffset();

process.stdout.write(e(0));

var files = get_file_args(process.argv.slice(2));
for (var i = 0; i < files.length; i++)
{
	if (files.length > 1)
		console.log("\n"+files[i]+":");
	var file;
	if (/^https?:/i.test(files[i]))
		file = await (await fetch(files[i])).text();
	else
		file = readFile(files[i], fsopt);
	file.split('\n').forEach(
		(line) => {
			if (line === '')
				return;
			var root = JSON.parse(line);
			var data = root.replayChatItemAction;
			//console.log(data);
			var test = data.actions[0];
			if (test.hasOwnProperty('addChatItemAction'))
			Object.keys(test.addChatItemAction.item).forEach(
				(key) => {
					var obj = data.actions[0].addChatItemAction.item[key];
					var ts = new Date(parseInt(BigInt(
						obj.hasOwnProperty("timestampUsec") ? obj.timestampUsec : 0
					)/1000n) + tz);
					var tstxt = t(obj.timestampText);
					if (tstxt !== null)
						tstxt = tstxt.padStart(8,"00:00:00")+".000";
					var test = obj;
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
							console.error(inspect(obj, 10, null, true));
							break;
						default:
							console.error(e(91) + "uncaught " + key + e(0));
							console.error(inspect(obj, 10, null, true));
							break;
						case "liveChatPlaceholderItemRenderer":
						case "liveChatSponsorshipsGiftRedemptionAnnouncementRenderer":
						case "liveChatModeChangeMessageRenderer": // messages like slow mode
							break;
						case "liveChatTextMessageRenderer":
						case "liveChatPaidMessageRenderer":
						case "liveChatPaidStickerRenderer":
						case "liveChatMembershipItemRenderer":
						case "liveChatTickerPaidMessageItemRenderer":
						case "liveChatSponsorshipsGiftPurchaseAnnouncementRenderer":
							try {
								var gift = key === "liveChatSponsorshipsGiftPurchaseAnnouncementRenderer";
								if (gift)
									obj = obj.header.liveChatSponsorshipsHeaderRenderer;
								var userColor = sus.color;
								var userName = t(obj.authorName);
								if (userName === null)
									userName = e(91)+"?????"+e(0);
								var verified = false;
								var moderator = false;
								var real = false;
								{
									for (var chan in imposters) {
										if (userName.toLowerCase() == imposters[chan].name.toLowerCase())
										{
											if (obj.authorExternalChannelId == chan)
											{
												real = true;
												userColor = imposters[chan].color;
											}
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
													userColor = (real ? ("44;"+userColor) : 94);
													moderator = true;
													break;
												case "VERIFIED":
													userName += " \u2713";
													verified = true;
													break;
											}
										}
									);
								var message = "", prefix = "", prefix2 = "";
								var couldbeSCwoMSG = (
									obj.purchaseAmountText !== undefined ||
									obj.headerPrimaryText !== undefined ||
									obj.headerSubtext !== undefined
								);
								if (!gift)
								{
									if (!couldbeSCwoMSG || obj.message !== undefined)
										try
										{
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
											)
										} catch {
											console.error("uncaught");
											console.error(inspect(obj, 10, null, true));
										}
								}
								{
									prefix = "";
									prefix2 = "";
									var p2pad = 2;
									if (obj.headerPrimaryText !== undefined)
									{
										var months = /^Member\s+for\s+(\d+)\s+months?$/i.exec(
											obj.headerPrimaryText.runs.map(o=>o.text).join('')
										)[1];
										var nan = Number(months) === NaN;
										if (nan)
											months = "??";
										prefix2 += e(nan ? 91 : 96) + months;
										p2pad -= months.length;
									}
									else
									{
										if (obj.headerSubtext !== undefined)
										{
											// presume new member
											var months = "N";
											prefix2 += e(96) + months;
											p2pad -= months.length;
											message = e(96) + "became a new member ";
										}
									}
									if (obj.purchaseAmountText !== undefined)
										prefix += e(92) + 'sent ' + t(obj.purchaseAmountText) + ' ' + e(97);
								}
								if (gift)
								{
									if (obj.primaryText !== undefined)
									{
										var gifttext = /^Gifted\s+(\d+)\s+.*\smemberships$/i
											.exec(obj.primaryText.runs.map(o=>o.text).join(''));
										message = e(96) + "gifted " + gifttext[1] + ' memberships ';
									}
								}
								console.log(e(95)+DateFormat(ts),
											e(90)+(
												(data.videoOffsetTimeMsec !== undefined) ? // why
												(TimeFormat(parseInt(data.videoOffsetTimeMsec))) :
												(
													root.videoOffsetTimeMsec !== undefined ? // why
													(TimeFormat(parseInt(root.videoOffsetTimeMsec))) :
													(tstxt ?? "")
												)).padStart(13),
											//e(34)+obj.authorExternalChannelId,
											' '.repeat(p2pad)+prefix2,
											e(userColor)+userName+e(0),
											e(37)+prefix+message.slice(0, -1)+e(0));
								break;
							}
							catch (e) {
								console.error(e);
								console.error(inspect(obj, 10, null, true));
							}
							break;
					}
				}
			);
			else if (test.hasOwnProperty('replaceChatItemAction'))
			{
				//console.log(inspect(test, true, 20, true));
			}
		}
	);
	if (global.hasOwnProperty("Bun"))
		Bun.gc(true);
}
process.stdout.write(e(0));
process.stderr.write(e(0));
