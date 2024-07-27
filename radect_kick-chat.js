
{
	var argv = process.argv;
	if (argv.length <= 2) {
		console.log("radect - kick chat viewer");
		console.log("node radect_kick-chat [(...).json]");
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
	"moderator":	e('96') + "M",
	"broadcaster":	e('91') + "\u25BA"
};

console.log(e(0));

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
	JSON.parse(file).sort((a, b) =>
		new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
		// absurd // "IT'S ABSURD! IT'S ABSUURDD!!"
	).forEach((data) => {
		var ts = new Date(data.created_at);
		ts.setYear(ts.getFullYear() - 1); // wtf
		var userColor = 97;
		//console.log(data);
		var userName = "";
		var badges = "";
		var badgeCount = 0;
		if (data.sender !== null) {
			userName = data.sender.username;
			if (data.sender.color !== null)
			{
				userColor = "";
				if (isDarkColor(parseInt(data.sender.identity.color.substr(1),16))) // whatever
				{
					userColor += "100;";
				}
				userColor += "38;2";
				var colorHex = /^#([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})([0-9A-Fa-f]{2})$/g.exec(data.sender.identity.color);
				for (var i = 1; i < 4; i++)
				{
					userColor += ';'+parseInt(colorHex[i],16).toString();
				}
			}
			if (data.sender.identity.badges !== undefined)
			{
				badges = "";
				data.sender.identity.badges.forEach(
					(icon) => {
						var badgeitem = badgelist[icon.type];
						if (badgeitem !== undefined) {
							badgeCount++;
							badges += badgeitem;
						} else {
							console.log(icon);
						}
					}
				);
			}
			badges += e(0)+' ';
		}
		badges = " ".repeat(2-badgeCount) + badges;
		console.log(e(95)+DateFormat(ts),
					badges+e(userColor)+userName+e(0),
					e(37)+data.content);
	});
}
console.log(e(0));
