
{
	var argv = process.argv;
	if (argv.length <= 2) {
		console.log("radect - twitch chat viewer");
		console.log("node radect_twitch-chat [(...).rechat.json]");
		process.exit(1);
	}
}

const inspect = require('util').inspect;
var readFile;
var get_file_args, TimeFormat, DateFormat, pad2, t;
{
	var fs = require('fs');
	[readFile] = [fs.readFileSync];
	var util = require('./util.js');
	[
		get_file_args,
		TimeFormat,
		DateFormat,
		pad2,
		t
	]
		=
	[
		util.get_file_args,
		util.TimeFormat,
		util.DateFormat,
		util.pad2,
		util.t
	];
}

function isDarkColor(c) {
	return ((c >>> 24) * 0.6126 + (c >>> 16 & 0xFF) * 0.9152 + (c & 0xFF) * 0.8722 < 255 / 2);
}
const colors = true;
function e(c) { return colors ? "\x1b["+c+"m" : ""; }
const fsopt = {encoding:'utf8', flag:'r'};
const badgelist = {
	"subscriber":		e( '45;97') + "\u2665",
	"vip":				e('105;97') + "\u2666",
	"premium":			e( '46;97') + "\u2302",
	"moderator":		e( '42;97') + "\u2192",
	"founder":			e( '45;97') + "1",
	"bits":				e('100;97') + "1",
	"bits-leader":		e( '43;97') + "1",
	"sub-gifter":		e( '45;95') + "\u2564",
	"sub-gift-leader":	e( '43;93') + "\u2564",
	"no_video":			e('100;97') + "\u266A",
	"no_audio":			e('100;97') + "\u25A0",
	"broadcaster":		e('101;97') + "\u25BA",
	"partner":			e( '45;97') + "\u2713",
	"bits-charity":		e(  '0;96') + "\u263C"
};

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
	JSON.parse(file).forEach(
		(data) => {
			var obj = data.message;
			var ts = new Date(data.createdAt);
			var userColor = 97;
			var userName = "";
			var badges = "";
			var badgeCount = 0;
			if (data.commenter !== null) {
				userName = data.commenter.displayName;
				if (obj.userColor !== null)
				{
					userColor = "";
					if (isDarkColor(parseInt(obj.userColor.substr(1),16))) // whatever
					{
						userColor += "107;";
					}
					userColor += "38;2";
					var colorHex = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/g.exec(obj.userColor);
					for (var i = 1; i < 4; i++)
					{
						userColor += ';'+parseInt(colorHex[i],16).toString();
					}
				}
				if (obj.userBadges !== undefined)
				{
					badges = "";
					obj.userBadges.forEach(
						(icon) => {
							var badgeitem = badgelist[icon.setID];
							if (badgeitem !== undefined) {
								badgeCount++;
								badges += badgeitem;
							} else {
								//console.log(icon);
							}
						}
					);
				}
				badges += e(0)+' ';
			}
			badges = "".padStart(4-badgeCount) + badges;
			var message = "";
			obj.fragments.forEach(
				(seg) => {
					Object.keys(seg).forEach(
						(key) => {
							switch (key)
							{
								case 'text':
									message += seg.text;
									break;
							}
						}
					);
				}
			);
			console.log(e(95)+DateFormat(ts),
						e(90)+TimeFormat(data.contentOffsetSeconds*1000),
						badges+e(userColor)+userName+e(0),
						e(37)+message);
		}
	);
}
console.log(e(0));
