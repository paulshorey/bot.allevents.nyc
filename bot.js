console.log(phantom);

var DT = new Date();
var FS = require('fs');
var FUN = require('./node_custom/fun.js');

// var pro = process = {};
// pro.fs = FS;
// pro.q = require('q');
// pro.fun = require("./node_custom/fun.js");
// pro.console = require("./node_custom/console.js").console;
// pro.console.log('hello');

var APP = {
	"sites_server": 'http://localhost:8000/sites',
	"path": '/www/bot.nyc',
	"path_in": '',
	"path_out": ''
};

var SITES = [];

var CASPER = require('casper').create({
	waitTimeout: 10000,
	stepTimeout: 10000,
	verbose: true,
	logLevel: 'debug',
	log_statuses: ['warning', 'error', 'info'],
	viewportSize: {
		width: 2000,
		height: 2000
	},
	pageSettings: {
		"userAgent": 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.10 (KHTML, like Gecko) Chrome/23.0.1262.0 Safari/537.10',
		"loadImages": false,
		"loadPlugins": false,
		"webSecurityEnabled": false,
		"ignoreSslErrors": true
	},
	onWaitTimeout: function(timeout, step) {
		this.log('onWaitTimeout\': "' + (this.site ? this.site.meta.link : '(site not defined)') + '" : ' + timeout + 'ms', "error");
		this.clear();
		this.page.stop();
	},
	onStepTimeout: function(timeout, step) {
		this.log('onStepTimeout\': "' + (this.site ? this.site.meta.link : '(site not defined)') + '" : ' + timeout + 'ms', "error");
		this.clear();
		this.page.stop();
	},
	onResourceReceived: function(timeout, step) {
		//this.log( 'onResourceReceived\': "' + ( this.site ? this.site.meta.link : '(site not defined)' ) + '" : ' + timeout + 'ms', "info" );
	},
	clientScripts: [
		APP.path + "/lib/jquery.js",
		APP.path + "/lib/underscore.js",
		APP.path + "/lib/uu.js"
	]
});

// events
CASPER.on('run.complete', function() {
	this.echo('Test completed');
	this.exit();
});
CASPER.on('remote.message', function(msg) {
	this.echo(msg);
	// msg = JSON.parse(msg);
	// if (msg && msg.status && msg.data) {
	// 	this.log(JSON.stringify(msg.data, null, " "));
	// }
});
CASPER.on("page.error", function(pageErr) {
	this.log('REMOTE ERROR :: ' + JSON.stringify(pageErr, null, " "), 'error');
});
CASPER.on('http.status.404', function(resource) {
	this.log('404 error: ' + resource.url, 'error');
});
CASPER.on('http.status.500', function(resource) {
	this.log('500 error: ' + resource.url, 'error');
});
CASPER.on('complete.error', function(err) {
	this.die("Complete callback has failed: " + err);
});

// helpers
CASPER.log = function(message, status) {
	// default
	if (!status) {
		status = 'debug';
	}
	// always
	if (!this.options.log_statuses) {
		this.options.log_statuses = ['error'];
	} else if (this.options.log_statuses.indexOf('error') < 0) {
		this.options.log_statuses.push('error');
	}
	// skip
	if (this.options.log_statuses.indexOf(status) < 0) {
		return false;
	}
	// format
	if (typeof message === 'object') {
		message = JSON.stringify(Object.keys(message), null, ' ');
	} else if (typeof message === 'function') {
		message = JSON.stringify(message, null, ' ');
	} else {
		message = message;
	}
	// log
	if (!this.log.messages[message.replace(/\"*\'*\\*/g, '')]) {
		if (status == 'error') {
			message = '[ERROR]       ' + message;
			// write
			FS.write(
				'errors/' + DT.getFullYear() + '.' + this.str.pad(DT.getMonth()) + '.' + this.str.pad(DT.getDate()) + ' ' + this.str.pad(DT.getHours()) + ':' + this.str.pad(DT.getMinutes()) + ':' + this.str.pad(DT.getSeconds()) + ':' + DT.getMilliseconds() + ' .txt',
				JSON.stringify(Object.keys(this.log.messages), null, ' ') + " \n" + message,
				'w'
			);
		} else if (status === 'warning') {
			message = '[WARNING]     ' + message;
		} else if (status === 'info') {
			message = '[INFO]        ' + message;
		}
		if (status === 'debug') {
			message = '[DEBUG]       ' + message;
		}
		this.log.messages[message.replace(/\"*\'*\\*/g, '')] = true;
		this.echo(message, status.toUpperCase());

	}
};
CASPER.log.warnings = [];
CASPER.log.messages = [];
CASPER.str = Object({
	pad: function(str) {
		str = str.toString();
		var strlen = str.length || 1;
		return (strlen < 2 ? "0" + str : str);
	}
});
CASPER.hash = function(data, length) {
	if (typeof(data) == "string" && typeof(length) == "number") {
		var hash = 0;
		var i = 0;

		if (length > data.length || length === 0) {
			length = data.length;
		}

		for (i; i < length; i++) {
			hash = hash + data.charCodeAt(i);
			hash = hash + (hash << 10);
			hash = hash ^ (hash >> 6);
		}

		hash = hash + (hash << 3);
		hash = hash ^ (hash >> 11);
		hash = hash + (hash << 15);

		if (hash < 0) {
			hash = hash * -1;
		}

		return hash.toString(16);
	} else {
		throw "Inputted data must be string and inputted length must be number. Given: data: " + data + ", length: " + length;
	}
};


///////////////////////////////////////////////////////////////////
// SITES
///////////////////////////////////////////////////////////////////
CASPER.start();
CASPER.thenOpen('http://localhost:8000/sites', {
	method: 'post',
	data: JSON.stringify({}, null, '\t'),
	headers: {
		'Content-type': 'application/json'
	}
}, function(headers) {
	var sites = JSON.parse(this.getPageContent());
	this.echo('getted sites = ');
	this.echo(FUN.stringify_once(sites));

	var SITES = [];
	for (var s in sites) {
		SITES.push(sites[s]);
	}
	CASPER.eachThen(SITES, function(response) {
		this.site = {};
		this.site.items = [];
		this.site.meta = JSON.parse(FUN.stringify_once(response.data));
		this.site.meta.link = this.site.meta.link;

		// site
		this.thenOpen(this.site.meta.link, function(headers) {
			this.echo('meta.url');

			// site - eItem
			CASPER.waitForSelector(this.site.meta.eItem, function(what) {
				this.echo('site.eItem');
				this.site.items = this.evaluate(function(site) {

					var itemsindex = [];
					var items = [];
					$(site.meta.eItem).each(function() {

						///////////////////////////////////////////////////////////////////
						// ITEM
						var item = {};

						///////////////////////////////////////////////////////////////////
						// IMG
						item.img = {};
						item.img.src = '';
						item.img.width = 0;

						// this is img
						if ($(this).is('img')) {
							// img (new) vs img (old)
							img = {
								"src": uu.val($(this).attr('src')),
								"width": uu.val($(this).width())
							};
							if (img.src && img.width > item.img.width) {
								// new is better
								item.img = img;
								// format
								item.img.src = uu.parseUrl(item.img.src);
							}
						} else {
							// child <img>s
							$(this).find('img').each(function() {
								// img (new) vs img (old)
								img = {
									"src": uu.val($(this).attr('src')),
									"width": uu.val($(this).width())
								};
								if (img.src && img.width > item.img.width) {
									// new is better
									item.img = img;
									// format
									//item.img.src = uu.parseUrl(item.img.src);
								}
							});
							// child background-images
							if (!item.img.src || item.img.width < 50) {
								$(this).find('*').each(function() {
									// img (new) vs img (old)
									img = {
										"src": uu.val($(this).css('background-image')),
										"width": uu.val($(this).width())
									};
									if (img.src && img.width > item.img.width) {
										// new is better
										item.img = img;
										// format
										item.img.src = uu.parseUrl(item.img.src);
									}
								});
							}
							// background-image
							if (!item.img.src || item.img.width < 50) {
								// img (new) vs img (old)
								img = {
									"src": uu.val($(this).css('background-image')),
									"width": uu.val($(this).width())
								};
								if (img.src && img.width > item.img.width) {
									// new is better
									item.img = img;
									// format
									item.img.src = uu.parseUrl(item.img.src);
								}
							}
						}
						if (!item.img.src) {
							item.img = {};
						}

						///////////////////////////////////////////////////////////////////
						// body
						text = uu.strip_tags($(this).html(), '<a>');
						if (text) {
							// ...
							text_lines = text.split('\n');
							// multiple lines
							if (text_lines) {
								item.body = '';
								for (var line in text_lines) {
									// ...
									t = uu.trim(text_lines[line]);
									t_len = t.length;
									// title
									if (t_len > 33) {
										if (item.body === '' && t_len < 200) {
											item.body += "<p>" + t + "</p>\n";
										} else {
											item.body += "<p>" + t + "</p>\n";
										}
									}
								}
								// one line
							} else {
								// ...
								t = trim(text);
								t_len = t.length;
								// title
								if (t_len > 33) {
									item.body = "<p>" + t + "</p>\n";
								}
							}
						}

						///////////////////////////////////////////////////////////////////
						// save
						if (item.body) {
							item.url = uu.parseUrl(item.body);
						}
						items.push(item);

					});
					return items;

				}, this.site);


				///////////////////////////////////////////////////////////////
				// SITE SAVE
				if (this.site.items) {
					var post = {};
					post.site = this.site;
					// post
					CASPER.thenOpen('http://localhost:8000/site', {
						method: 'post',
						data: JSON.stringify(post, null, '\t'),
						headers: {
							'Content-type': 'application/json'
						}
					}, function(headers) {
						this.echo('posted site = ');
						this.echo(FUN.stringify_once(post));
					});
				}

			});

		});

	});


});
CASPER.run();
