// only tested on site in devtools console
// i can imagine CORS not allowing it anywhere else
// based on what i had to do to get yt-dl working for it
// got CORS error after 2 days of chats from capturing one user's chat

// watch list:
// [log.length, log[log.length-1].content]
// [_started.toLocaleString(), new Date().toLocaleString(), cursor_preview.toLocaleString()]
// [last_error.status.message, last_error.time.toLocaleString(), _beginning.toLocaleString()]

var _break = false;
var _continue = false;
var _catchup = false;
var _started;
var _beginning;
var interval = 200;
var timeout = 5000;
var last_error = {status: {message:null}, time: "N/A"};
if (!_continue) {
	var cursor_preview;
	var log = [];
}
var username = '';
const endpoint = 'https://kick.com/api/v2/channels/';
const delay = ms => new Promise(res => setTimeout(res, ms));
(async function() {
	while (!username.trim()) {
		console.error(new Error('invalid username'));
		username = prompt('Enter username:');
	}
	_break = false;
	var user = await (await fetch(endpoint+username)).json();
	var start_time = _beginning = new Date(user.chatroom.created_at);
	console.log(user);
	var cursor = _continue ? cursor_preview : (_started = new Date());
	if (!_continue)
	{
		var latest_msg = (await (await fetch(endpoint+user.chatroom.chatable_id+'/messages')).json());
		if (latest_msg.data.messages.length > 0) {
			cursor = new Date(latest_msg.data.messages[latest_msg.data.messages.length-1].created_at);
			//console.log(cursor);
			latest_msg.data.messages.forEach(
				msg => {
					//console.log(msg);
					if (!log.find(x => x.id === msg.id))
						log.push(msg);
				}
			);
			//console.log(latest_msg);
		}
	}
	async function collect(chatroom, time) {
		var obj = (await (await fetch(
			'https://kick.com/api/v2/channels/'+chatroom+'/messages?start_time='+time.toISOString()
		)).json());
		if (obj.status.code === 200) {
			if (obj.data.messages.length > 0) {
				//var display = [];
				obj.data.messages.forEach(msg => {
					if (!log.find(x => x.id === msg.id))
					{
						log.push(msg);
						//display.push(msg);
					} else console.warn('dupe msg: '+msg.id);
				});
				/**if (display.length > 0)
					console.log(...(display.map(e =>
						"\n@ "+new Date(e.created_at).toLocaleString()+" "+
						e.sender.username.padStart(29)+": "+e.content)));/**/
			}
		}
		else
		{
			last_error = obj;
			last_error["time"] = new Date();
			if ((obj ?? {status: {
					message: "NULL OBJECT!!"
				}}).status.message !== "No messages found")
				console.error(obj);
		}
	}
	if (!_catchup) {
		for (; cursor > start_time;) {
			if (_break)
				return;
			cursor_preview = cursor;
			try {
				await collect(user.chatroom.chatable_id, cursor);
				await delay(interval);
				cursor = new Date(cursor.getTime() - 60000)
			} catch {
				//console.error('rate limited??!?!! >:( '+obj.status.code);
				await delay(timeout);
			}
		}
		cursor = _started;
	}
	{
		_catchup = true;
		for (; cursor < new Date();) { // catch up // copy paste feels iffy
			if (_break)
				return;
			cursor_preview = cursor;
			try {
				await collect(user.chatroom.chatable_id, cursor);
				await delay(interval);
				cursor = new Date(cursor.getTime() + 60000)
			} catch {
				await delay(timeout);
			}
		}
	}
	console.log('done');
})();


if (false)
{
	// copy code to save session/page
	_break = true; // wait a few seconds just to not miss something
	_continue = true;
	var dl = document.createElement('a');
	dl.href = "data:application/json,"+encodeURIComponent(JSON.stringify({
		username: username, cursor_preview: cursor_preview, _started: _started, log: log
	})); // i hate this
	dl.innerText = "SAVE ME!!!";
	dl.download = username+"_kick_chat.json";
	dl.click();
	
	
	
	
	
	
	// restore session, using hosted file above
	var test = await (await fetch("http://localhost/kick_chat_incomplete.json")).json();
	[username, cursor_preview, _started, log, _continue] =
	[test.username, new Date(test.cursor_preview), new Date(test._started), test.log, true];
}
