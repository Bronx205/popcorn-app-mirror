var Utils = {};
var request = require('request');
var AdmZip = require('adm-zip');
var fs = require('fs');
var Q = require('q');
var async = require('async');
var path = require('path');
var mkdirp = require('mkdirp');

var externalPlayers = ['VLC', 'MPlayer OSX Extended', 'MPlayer', 'mpv'];
var playerCmds = [];
var playerSwitches = [];
playerCmds['VLC'] = '/Contents/MacOS/VLC';
playerCmds['MPlayer OSX Extended'] = '/Contents/Resources/Binaries/mpextended.mpBinaries/Contents/MacOS/mplayer';

playerSwitches['VLC'] = ' --no-video-title-show --sub-filter=marq --marq-marquee="Streaming From Popcorn Time" --marq-position=8 --marq-timeout=3000 --sub-file=';
playerSwitches['MPlayer OSX Extended'] = ' -font "/Library/Fonts/Arial Bold.ttf" -sub ';
playerSwitches['MPlayer'] = ' -sub ';
playerSwitches['mpv'] = ' -sub ';

var searchPaths = {};
searchPaths.linux = ['/usr/bin', '/usr/local/bin'];
searchPaths.mac = ['/Applications'];
searchPaths.windows = ['"C:\\Program Files\\"', '"C:\\Program Files (x86)\\"'];

Utils.downloadSubtitle = function(data, callback) {
	var subUrl = data.url;
	var filePath = data.filePath;
	var fileFolder = path.dirname(filePath);
	var fileExt = path.extname(filePath);
	var subExt = subUrl.split('.').pop();
	var out = '';
	var req = null;
	var newName = filePath.substring(0,filePath.lastIndexOf(fileExt)) + '.srt';

	try {
		mkdirp.sync(fileFolder);
	} catch(e) {
		// Ignore EEXIST
	}
	if(subExt === 'zip') {
		var zipPath = filePath.substring(0,filePath.lastIndexOf(fileExt)) + '.zip';

		var unzipPath = filePath.substring(0,filePath.lastIndexOf(fileExt));
		unzipPath = unzipPath.substring(0, unzipPath.lastIndexOf(path.sep));
		
		out = fs.createWriteStream(zipPath);
		req = request(
			{
				method: 'GET',
				uri: subUrl,
			}
		);

		req.pipe(out);
		req.on('end', function() {
			var zip = new AdmZip(zipPath),
			zipEntries = zip.getEntries();
			zip.extractAllTo(/*target path*/unzipPath, /*overwrite*/true);
			fs.unlink(zipPath, function(err){});
			win.debug('Subtitle extracted to : '+ unzipPath);
			var files = fs.readdirSync(unzipPath);
			for(var f in files) {
				if(path.extname(files[f]) === '.srt') {
					break;
				}
			}
			fs.renameSync(path.join(unzipPath, files[f]), newName);
			return callback(newName);
		});
	}
	else if(subExt === 'srt') {
		var srtPath = filePath.substring(0,filePath.lastIndexOf(fileExt)) + '.srt';
		out = fs.createWriteStream(srtPath);
		req = request(
			{
				method: 'GET',
				uri: subUrl,
			}
		);

		req.pipe(out);
		req.on('end', function() {
			win.debug('Subtitle downloaded to : '+ srtPath);
			return callback(srtPath);
		});
	}
	else {
		return callback();
	}
};

Utils.findExternalPlayers = function() {
	var defer = Q.defer();
	var folderName = '';
	var players = [];
	var search = Utils.toLowerCaseArray(externalPlayers.slice(0));
	async.each(searchPaths[Settings.os], function(folderName, pathcb) {
			console.log('Scanning: '+ folderName);
			var appIndex = -1;
			fs.readdir(folderName, function(err, data) {
				if(err  || !data.length) {
					pathcb(err);
				}
				if(data) {
					async.each(
						data, 
						function(d, cb) {
							var app = d.replace('.app', '').replace('.exe', '').toLowerCase();
							appIndex = search.indexOf(app);
							if(appIndex !== -1) {
								players.push({name: externalPlayers[appIndex], path: folderName + '/' + d});
							}
							cb();
						},
						function(err, data) {
							pathcb();
						}
					);
				}
			});
		},
		function(err) {
			if(err) {
				defer.reject(err);
			}
			else {
				defer.resolve(players);
			}
		});
	return defer.promise;
};

Utils.getPlayerName = function(loc) {
	return path.basename(loc).replace(path.extname(loc), '');
};

Utils.getPlayerCmd = function(loc) {
	var name = Utils.getPlayerName(loc);
	return playerCmds[name];
};

Utils.getPlayerSwitch = function(loc) {
	var name = Utils.getPlayerName(loc);
	for(var p in externalPlayers) {
		if(name.toLowerCase() === externalPlayers[p].toLowerCase()) {
			return playerSwitches[externalPlayers[p]];
		}
	}
	return '';
};

Utils.toLowerCaseArray = function(arr) {
    var i = arr.length;
    while ( --i >= 0 ) {
        if ( typeof arr[i] === 'string' ) {
            arr[i] = arr[i].toLowerCase();
        }
    }
    return arr;
};