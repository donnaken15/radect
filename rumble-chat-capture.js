import {$, sleep} from 'bun';
import {events, stream} from 'fetch-event-stream';
var link = process.argv[2];
if (!link)
{
	console.error("No stream link specified");
	process.exit(1);
}
else if (/^v[a-z0-9]{5,}/i.test(link))
	link = "https://rumble.com/"+link;
else if (!/^https?:\/\//i.test(link))
	link = "https://rumble.com/c/"+link+"/live";
console.log("Loading... ("+link+")");
var inf = JSON.parse((await $`yt-dlp --playlist-end 1 --dump-json ${link}`.text()).trim());
var id = parseInt(inf.id.substring(1), 36);
var url = 'https://web7.rumble.com/chat/api/chat/'+id+'/stream';
var stop = new AbortController();
var res = await fetch(url, {method: "GET", signal: stop.signal});
if (!res.ok)
{
	console.error(res);
	process.exit(1);
}
/*var input = process.stdin;
input.setRawMode(true);
input.resume();
input.removeAllListeners('data');
input.on('data', k=>{
	console.log(k);
	switch (k.length)
	{
		case 1:
			switch (k[0]) // * can this be condensed
			{
				case 3:
					stop.abort();
					break;
			}
			break;
	}
});*/
process.on('exit', ec=>stop.abort());
console.log("Stream loaded");
const dots = numbers => numbers.map(s=>s.toString().padStart(2,'0')).join('.');
var	now = new Date(), output = Bun.file(inf.uploader+"_"+inf.id+"_"+
	dots([(1900+now.getYear()),(now.getMonth()+1),(now.getDate())])+"-"+
	dots([now.getHours(),now.getMinutes(),now.getSeconds()])+".json");
var writer = output.writer();
var str = events(res, stop.signal);
function prettify(data)
{
	var list = [];
	data.messages.forEach(m=>{
		var user = data.users.find(u=>u.id===m.user_id);
		var msg = {...m};
		msg.user = user;
		list.push(msg);
	});
	return list;
}
for await (var evt of str)
{
	//console.log(evt);
	var data = JSON.parse(evt.data);
	var proc = prettify(data.data);
	switch (data.type)
	{
		case "init":
			console.log("Init: "+data.data.messages.length+" messages");
			break;
		case "messages":
			console.log("Messages: "+data.data.messages.length+" messages");
			break;
		default:
			console.error("Uncaught type "+data.type);
			continue;
	}
	writer.write(proc.map(JSON.stringify).join('\n')+'\n');
	writer.flush();
	delete evt.data;
	if (Object.keys(evt).length > 0)
		console.log(evt);
}
writer.end();

