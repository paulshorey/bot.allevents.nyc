// world's smallest jQuery plugin:
if (window.jQuery) {
	jQuery.fn.reverse = [].reverse;
}

// ok, now...
var uu = new Object();

uu.hashId = function(str) {
	// unique
	var hash = 0;
	if (str.length == 0) {
		return hash;
	}
	for (i = 0; i < str.length; i++) {
		char = str.charCodeAt(i);
		hash = ((hash << 5) - hash) + char;
		hash = hash & hash; // Convert to 32bit integer
	}
	// ok
	return hash;
};

// html2dom = function(html) {
// 	var parser = new DOMParser();
// 	return parser.parseFromString(html, "text/html");
// },
// dom2html = function(dom) {
// 	var target = document.getElementById(dom);
// 	var wrap = document.createElement('div');
// 	wrap.appendChild(target.cloneNode(true));
// 	return wrap.innerHTML;
// },

// Test require
// { return 'CONGRATULATIONS!!! uu variable successfully required!'; },

// Strings
uu.str = Object({

	// Leading zero
	pad: function(str) {
		return str.length < 2 ? "0" + str.toString() : str;
	}

});

// Remove whitespace before/after
uu.trim = function(str, charlist) {
	var whitespace, l = 0,
		i = 0;
	str += '';

	if (!charlist) {
		// default list
		whitespace =
			' \n\r\t\f\x0b\xa0\u2000\u2001\u2002\u2003\u2004\u2005\u2006\u2007\u2008\u2009\u200a\u200b\u2028\u2029\u3000';
	} else {
		// preg_quote custom list
		charlist += '';
		whitespace = charlist.replace(/([\[\]\(\)\.\?\/\*\{\}\+\$\^\:])/g, '$1');
	}

	l = str.length;
	for (i = 0; i < l; i++) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(i);
			break;
		}
	}

	l = str.length;
	for (i = l - 1; i >= 0; i--) {
		if (whitespace.indexOf(str.charAt(i)) === -1) {
			str = str.substring(0, i + 1);
			break;
		}
	}

	return whitespace.indexOf(str.charAt(0)) === -1 ? str : '';
}

// Return text
uu.strip_tags = function(input, allowed) {
	allowed = (((allowed || '') + '')
			.toLowerCase()
			.match(/<[a-z][a-z0-9]*>/g) || [])
		.join(''); // making sure the allowed arg is a string containing only tags in lowercase (<a><b><c>)

	var tags = /<\/?([a-z][a-z0-9]*)\b[^>]*>/gi,
		commentsAndPhpTags = /<!--[\s\S]*?-->|<\?(?:php)?[\s\S]*?\?>/gi;

	return input.replace(commentsAndPhpTags, '')
		.replace(tags, function($0, $1) {
			return allowed.indexOf('<' + $1.toLowerCase() + '>') > -1 ? $0 : '';
		});
};

// Prepare for command line output
uu.val = function(_in) {
	// undefined
	if (_in === undefined) {
		return 0;
		// null
	} else if (_in === null) {
		return 0;
		// value
	} else {
		return _in;
	}
};

// Prepare for command line output
uu.consoleLog = function(_in) {
	console.log(
		JSON.stringify({
			"status": "log",
			"data": uu.consoleSimpleArray(_in)
		})
	);
};

// Show array values as strings, to remove cyclic or memory-hogging values
uu.consoleArray = function(_in) {
	return _in;
};

// Show array values as strings, to remove cyclic or memory-hogging values
// 1 level deep
uu.consoleSimpleArray = function(_in) {
	// ...
	var _out = [];
	var _i = 0;
	// array
	if (typeof _in === 'object') {
		for (_i in _in) {
			if (_in.hasOwnProperty(_i)) {
				_out.push([_i, _in[_i] + '']);
			}
		}
		// undefined
	} else if (_in === undefined) {
		_out = 'undefined';
		// null
	} else if (_in === null) {
		_out = 'null';
		// string
	} else {
		_out = _in + '';
	}
	// ...
	return _out;
};

// Show array values as strings, to remove cyclic or memory-hogging values
// 1 level deep
uu.consoleDoubleArray = function(_in) {
	// ...
	var _out = [];
	var _i = 0;
	// array
	if (typeof _in === 'object') {
		for (_i in _in) {
			if (_in.hasOwnProperty(_i)) {
				_out.push([_i, uu.consoleSimpleArray(_in[_i])]);
			}
		}
		// undefined
	} else if (_in === undefined) {
		_out = 'undefined';
		// null
	} else if (_in === null) {
		_out = 'null';
		// string
	} else {
		_out = _in + '';
	}
	// ...
	return _out;
};






// ok, now...
var pp = new Object();

pp.parseImg = function(site, item, element) {
	item.img = {
		src: '',
		width: 0
	};
	var img = {
		src: '',
		width: 0
	};
	// this
	if ($(element).is('img')) {
		item.img = {
			"src": $(element).attr('src'),
			"width": $(element).width() || 0
		};
		item.title = $(element).attr('title') || $(element).attr('alt') || 'Image';
		item.link = item.img.src;
	} else {
		// child
		$(element).find('img').each(function() {
			img = {
				"src": $(this).attr('src'),
				"width": $(this).width() || 0
			};
			if (img.src && img.width >= 100 && img.width > item.img.width) {
				item.img = img;
			}
		});
		// background
		if (!item.img.src) {
			if ($(element).css('background-image')) {
				img = {
					"src": $(element).css('background-image'),
					"width": $(element).width() || 0
				};
				img.src = (img.src.match(/(?:url\()([^\)]+)[\)]/) || [])[1];
				if (img.src && img.width >= 100 && img.width > item.img.width) {
					item.img = img;
				}
			}
		}
		// child background
		if (!item.img.src) {
			$(element).find('*').each(function() {
				if ($(this).css('background-image')) {
					img = {
						"src": $(this).css('background-image'),
						"width": $(this).width() || 0
					};
					img.src = (img.src.match(/(?:url\()([^\)]+)[\)]/) || [])[1];
					if (img.src && img.width >= 100 && img.width > item.img.width) {
						item.img = img;
					}
				}
			});
		}
	}
	if (!item.img.src) {
		item.img = {};
	}
};

pp.parseStack = function(site, stack, element) {
	var text = uu.trim(element.innerText.replace(/[\s]+/g, ' '));
	var length = text.length;

	// link
	if (stack.link && element.tagName == 'A' && element.href && element.href.length > 12) {
		var score = stack.i;
		if (element.href.indexOf(site.link)!=-1) {
			score += 100;
		} else if (element.href.indexOf('/')===0) {
			score += 50;
		}
		stack.link[score] = element.href;
		return;
	}

	// date
	if (stack.date && length > 10 && length < 50 && text.match(/[0-9]/g).length >= 2) { // not too long // at least 2 numbers
		if (
			/[0-9]{2}[,\ \/]{1,2}[0-9]{2,}/.test(text) ||
			/[0-9][:]{1}[0-9]{2,}/.test(text) ||
			/^(Mon|Tue|Wed|Thu|Fri|Sat|Sun)/i.test(text) ||
			/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)/i.test(text) ||
			/(January|February|March|April|May|June|July|August|September|October|November|December)/i.test(text)
		) {
			var score = stack.i;
			stack.date[score] = text;
			return;
		}
	}

	// title
	if (stack.title && text.length > 10) { // not too short // better than old title // not parent
		var score = stack.i;
		// social?
		if (length < 80 && text.match(/(Twitter|Facebook|Google|Tumblr|Share|URL)/i)) {
			return;
		}
		// title?
		switch (element.tagName) {
			case 'H1':
				score += 100;
				break;
			case 'H2':
				score += 90;
				break;
			case 'H3':
				score += 80;
				break;
			case 'H4':
				score += 70;
				break;
			case 'H5':
				score += 60;
				break;
			case 'H6':
				score += 50;
				break;
			case 'P':
				score += 40;
				break;
			case 'BLOCKQUOTE':
				score += 30;
				break;
		}
		// UPPER case prefered
		var upp = (text.substr(0,50).match(/[A-Z]/g)||'').length||0;
		var low = (text.substr(0,100).match(/[^A-Z]/g)||'').length||0;
		if (upp > low) {
			var x = 10;
			if (length > 10 && length < 50) {
				x = 50 - length;
			}
			score += (upp - low) * x;
		}
		// shorter is better
		if (length > 10 && length < 100) {
			score += 100 - length;
		}
		// 40 perfect, 20-90 ok
		if (length == 50) {
			score += 100;
		} else if (length > 20 && length < 40) {
			score += (length-20)*5;
		} else if (length > 40 && length < 90) {
			score += (100 - ((length-40)*2));
		}
		
		stack.title[score] = text;
		return;
	}

};
