
export const plat = require("os").platform();
export function t(o,k='simpleText') { try { return o[k]; } catch { return null; } }
export function pad2(t,d='0') { return t.toString().padStart(2,d); }
export function TimeFormat(ms) {
	return (ms < 0 ? "-" : "") +
		pad2(Math.floor(Math.abs(ms) / 3600000)) + ':' +
		pad2(Math.floor((Math.abs(ms) / 60000) % 60)) + ':' +
		(Math.abs(ms)/1000 % 60).toFixed(3).padStart(6,'0');
}
export function DateFormat(date) {
	return pad2(date.getMonth()+1)+'/'+
			pad2(date.getDate()+1)+'/'+
			(date.getFullYear()).toString().substr(2,2)+' '+
			pad2(date.getHours())+':'+
			pad2(date.getMinutes())+':'+
			pad2(date.getSeconds());
}

var dirname, basename, readdir, exists, sep;
{
	var path = require('path');
	[dirname, basename, sep] = [path.dirname, path.basename, path.sep];
	// there has to be a way to do this where for each key in the array,
	// get the same name property from the object
	var fs = require('fs');
	[readdir, exists] = [fs.readdirSync, fs.existsSync];
}
export var sep;
const invpathchars = /[?|<>"]/g;
const patternfilt = /[.+^${}()[\]\\]/g;
const domainfilt = /^https?:\/\/+([A-Z0-9]+\.)?[A-Z0-9]+\.[A-Z]+\/+.*$/i;
const fileptc = /^file:\/\/+([A-Z]:\/)?(\/*[^:*?"<>|]+)$/i;
const wc = /\*/g;

const include_links = true;

// giga brain wildcard searching
export function get_file_args(a)
{
	var i = 0;
	return a.flatMap(f => {
		i++;
		if (invpathchars.test(f) || wc.test(dirname(f)))
		{
			console.error(new Error("Invalid characters in argument #"+i.toString()));
			return [];
		}
		if (wc.test(f))
		{
			// get wildcard pattern, and then retrieve array of files to be read from directory that is referenced
			var pattern = new RegExp("^"+basename(f).replace(patternfilt, '\\$&').replace(wc,'.*')+"$","i");
			return readdir(dirname(f)).filter(i => pattern.test(i));
		}
		{
			var remote = domainfilt.test(f);
			if (remote)
			{
				if (!include_links)
				{
					console.error(new Error("Remote files are not acceptable here: "+f));
					return [];
				}
				else
					return f;
			}
				// 0 IQ: read file index pages
		}
		if (!exists(f))
		{
			console.error(new Error("File does not exist: "+f));
			return [];
		}
		return f;
	});
}
