// only tested on site in devtools console
// i can imagine CORS not allowing it anywhere else
// based on what i had to do to get yt-dl working for it
// got CORS error after 2 days of chats from capturing one user's chat

// watch list:
// log[log.length-1].content
// cursor_preview
// log
// JSON.stringify(log)

var _break = false;
var _continue = false;
var interval = 200;
var timeout = 5000;
if (!_continue) {
	var cursor_preview;
	var log = [];
}
var username = '';
const endpoint = 'https://kick.com/api/v2/channels/';
const delay = ms => new Promise(res => setTimeout(res, ms));
(async function() {
	var user = await (await fetch(endpoint+username)).json();
	var start_time = new Date(user.chatroom.created_at);
	console.log(user);
	var current_time = new Date();
	var cursor = _continue ? cursor_preview : current_time;
	if (!_continue) {
		var latest_msg = (await (await fetch(endpoint+user.chatroom.chatable_id+'/messages')).json());
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
			await delay(interval);
			cursor = new Date(cursor.getTime() - 60000)
		} catch {
			//console.error('rate limited??!?!! >:( '+obj.status.code);
			await delay(timeout);
		}
	}
	console.log('done');
})();
