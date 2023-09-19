// only tested on site in devtools console
// i can imagine CORS not allowing it anywhere else
// based on what i had to do to get yt-dl working for it

var _break = false;
var cursor_preview;
var log = [];
var username = '';
const delay = ms => new Promise(res => setTimeout(res, ms));
(async function() {
	var user = await (await fetch('https://kick.com/api/v2/channels/'+username)).json();
	var start_time = new Date(user.chatroom.created_at);
	console.log(user);
	var current_time = new Date();
	var cursor = current_time;
	var latest_msg = (await (await fetch('https://kick.com/api/v2/channels/'+user.chatroom.chatable_id+'/messages')).json());
	if (latest_msg.data.messages.length > 0) {
		cursor = new Date(latest_msg.data.messages[latest_msg.data.messages.length-1].created_at);
		console.log(cursor);
		latest_msg.data.messages.forEach(
			msg => {
				console.log(msg);
				if (!log.find(x => x.id === msg.id))
					log.push(msg);
			}
		);
		console.log(latest_msg);
	}
	for (; cursor > start_time;) {
		if (_break)
			return;
		cursor_preview = cursor;
		try {
			var obj = (await (
				await fetch('https://kick.com/api/v2/channels/'+
				user.chatroom.chatable_id+'/messages?start_time='+
				cursor.toISOString())).json());
			if (obj.status.code === 200)
			{
				if (obj.data.messages.length > 0)
				{
					console.log(cursor.toISOString()+':');
					obj.data.messages.forEach(
						msg => {
							console.log(msg);
							if (!log.find(x => x.id === msg.id))
								log.push(msg); else console.warn('dupe msg');
						}
					);
				}
			}
			else
				console.error(obj);
			await delay(200);
			cursor = new Date(cursor.getTime() - 60000)
		} catch {
			//console.error('rate limited??!?!! >:( '+obj.status.code);
			await delay(5000);
		}
	}
	console.log('done');
})();
