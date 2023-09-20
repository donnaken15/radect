
{
	var argv = process.argv;
	if (argv.length <= 2) {
		console.log("radect - kick chat viewer");
		console.log("node radect_kick-chat [(...).json]");
		return;
	}
}

function TimeFormat(s) {
	return pad2(Math.floor(s / 3600)) + ':' +
		pad2(Math.floor((s / 60) % 60)) + ':' +
		(s % 60).toString().padStart(2,'0');
}
function DateFormat(date) {
	return pad2(date.getMonth()+1)+'/'+
			pad2(date.getDate()+1)+'/'+
			(date.getFullYear()+1).toString().substr(2,2)+' '+
			pad2(date.getHours())+':'+
			pad2(date.getMinutes())+':'+
			pad2(date.getSeconds());
}
function isDarkColor(c) {
	return ((c >>> 24) * 0.6126 + (c >>> 16 & 0xFF) * 0.9152 + (c & 0xFF) * 0.8722 < 255 / 2);
}
function pad2(t,d='0') { return t.toString().padStart(2,d); }
const colors = true;
function e(c) { return colors ? "\x1b["+c+"m" : ""; }
function t(o) { return o.simpleText; }
const fs = require('fs');
const fsopt = {encoding:'utf8', flag:'r'};
const badgelist = {
	"moderator":	e('96') + "M",
	"broadcaster":	e('91') + "\u25BA"
};

console.log(e(0));
JSON.parse(fs.readFileSync(process.argv[2], fsopt)).sort((a, b) => {
	return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
}).forEach((data) => {
	var ts = new Date(data.created_at);
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
	badges = "".padStart(2-badgeCount) + badges;
	console.log(e(95)+DateFormat(ts),
				badges+e(userColor)+userName+e(0),
				e(37)+data.content);
});
console.log(e(0));
