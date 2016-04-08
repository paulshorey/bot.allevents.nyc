// window.document.body.scrollTop = Math.min( window.document.body.scrollTop+100,  $(document).height()-$(window).height() ) ;
// console.log('## "'+window.location.href+'" scroll='+window.document.body.scrollTop);

// $(window).ajaxSend(function() {
// 	console.log('## ajaxSend');
// });
// $(window).ajaxComplete(function() {
// 	console.log('## ajaxComplete');
// });

window.casbot = {};
window.casbot.haunt = function(EACH) {
	// idk
	if (!window.jQuery) {
		return false;
	} else if (!window.$) {
		window.$ = window.jQuery;
	}

	// items
	var elements = {};
	if (EACH.site.elements.item) {
		elements = $(EACH.site.elements.item);
	} else {
		// later automate
	}

	// more
	// find ">" link, assign to data.more

	// item
	if (elements) {
		EACH.items = [];
		var i = 0;
		elements.each(function() {
			i++;
			var item = {score:100};
			
			///////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////
			// MANUAL
			///////////////////////////////////////////////////////////////////
			// img // better to get automatically
			// title
			if (EACH.site.elements.title) {
				item.title = [];
			}
			// date
			if (EACH.site.elements.date) {
				item.date = [];
				if (typeof EACH.site.elements.date == 'string') {
					EACH.site.elements.date = {"0":EACH.site.elements.date};
				}
				for (var c in EACH.site.elements.date) {
					var elem = eval('$(this)'+EACH.site.elements.date[c]);
					if (elem) {
						var date = uu.trim(elem.text().replace(/[\s]+/g, ' '));
						item.date.push(date);
					}
				}
			}
			// link
			if (EACH.site.elements.link) {
				item.link = [];
			}
			
			///////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////
			// AUTO
			///////////////////////////////////////////////////////////////////
			// stack-cards (parse)
			var stack = {x:{}};
			if (!item.title) {
				stack.title = [];
				stack.x.title = {};
			}
			if (!item.date) {
				stack.date = [];
				stack.x.date = {};
			}
			if (!item.link) {
				stack.link = [];
				stack.x.link = {};
			}
			if (!item.img) {
				stack.img = [];
				stack.x.img = {};
				var img = ($(this).html().match(/["']([^"]*.jpg)["']/i)||[])[1];
				if (img) {
					stack.img.push(img);
					stack.x.img[img] = true;
				}
			}
			stack.i = 0;
			$(this).find('*').reverse().each(function() {

				// parse
				stack = pp.parseStack(EACH.site, stack, this);

				stack.i++;
			});

			///////////////////////////////////////////////////////////////////
			// shuffle-cards (sort)
			// title
			if (!item.title) {
				for (var card in stack.title) {
					// start from the lowest points (back of element)
					// compare current value, to all others with higher points (front of element)
					//console.log(card,stack.title[card]);
					var matches = [];
					for (var c in stack.title) {
						// compare to everything higher than itself
						if (parseInt(c) > parseInt(card)) {
							// if current fits into anything higher, remove current
							//console.log(parseInt(card) +' inside'+ parseInt(c) +' ? ' + stack.title[c].indexOf(stack.title[card]));
							if (stack.title[c].indexOf(stack.title[card]) != -1) {
								delete stack.title[card];
							}
						}
					}
				}
				stack.title.reverse();
			}
			// date
			if (!item.date) {
				for (var card in stack.date) {
					// start from the lowest points (back of element)
					// compare current value, to all others with higher points (front of element)
					//console.log(card,stack.title[card]);
					var matches = [];
					for (var c in stack.date) {
						// compare to everything higher than itself
						if (parseInt(c) > parseInt(card)) {
							// if current fits into anything higher, remove current
							//console.log(parseInt(card) +' inside'+ parseInt(c) +' ? ' + stack.title[c].indexOf(stack.title[card]));
							if (stack.date[c].indexOf(stack.date[card]) != -1) {
								delete stack.date[card];
							}
						}
					}
				}
				stack.title.reverse();
			}
			// link
			if (!item.link) {
				stack.link.reverse();
			}
			// img
			if (!item.img) {
				stack.img.reverse();
			}

			///////////////////////////////////////////////////////////////////
			// play-card (add to item)
			// title
			if (!item.title) {
				item.title = [];
				for (var card in stack.title) {
					if (stack.title[card]) {
						item.title.push(stack.title[card]);
					}
				}
			}
			// date
			if (!item.date) {
				item.date = [];
				for (var card in stack.date) {
					if (stack.date[card]) {
						item.date.push(stack.date[card]);
					}
				}
			}
			// link
			if (!item.link) {
				item.link = [];
				for (var card in stack.link) {
					var link = stack.link[card];
					// absolute
					if (link.indexOf(EACH.site.host)==0) {
						item.link.push(link);
					}
					// relative
					if (/^\//.test(link)) {
						// maybe
						item.link.push(EACH.site.host+link);
					} else if (link.length > 10 && !item.link) {
						// last resort
						item.link.push(EACH.site.host+'/'+link);
					}
				}
			}
			// img
			if (!item.img) {
				item.img = [];
				for (var card in stack.img) {
					var img = stack.img[card];
					if (img.substr(0,1)=='/' || img.substr(0,1)=='?') {
						img = EACH.site.host + img;
						item.img.push(img);
					}
				}
			}

			///////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////
			// FILTER
			// iterate each for each and if a value is the same in each, remove it for each

			///////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////
			// SCORE
			if (!item.title[0]) {
				return true;
			}
			if (!item.link[0] || item.link.length>3) {
				item.score -= 1;
			}
			if (!item.img[0]) {
				item.score -= 1;
			}
			if (item.date[0]) {
				item.score += 1;
			}
			if (item.score < 100) { // discard if missing both image and link
				return true;
			}

			///////////////////////////////////////////////////////////////////
			///////////////////////////////////////////////////////////////////
			// DONE
			EACH.items.push(item);
			
		});
	}

	return EACH;

}