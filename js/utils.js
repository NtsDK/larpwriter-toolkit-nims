Utils = {};

Utils.addView = function(rootObject, name, view, displayName, navigationId, contentAreaId, mainPage){
	view.init();
//	var viewContent = initializer();
	rootObject.views[name] = view;
	var navigation = document.getElementById(navigationId);
	var button = document.createElement("button");
	button.appendChild(document.createTextNode(displayName));
	navigation.appendChild(button)
	
	var onClickDelegate = function(view){
		return function(){
			var contentArea = document.getElementById(contentAreaId);
			removeChildren(contentArea);
			contentArea.appendChild(view.content);
			rootObject.currentView = view;
			view.refresh();
		};
	}
	
	button.addEventListener("click", onClickDelegate(view));
	if(mainPage){
		var contentArea = document.getElementById(contentAreaId);
		contentArea.appendChild(view.content);
		rootObject.currentView = view;
//		view.refresh();
	}
};

//Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};

if(document.getElementsByClassName) {

	getElementsByClass = function(classList, node) {    
		return (node || document).getElementsByClassName(classList)
	}

} else {

	getElementsByClass = function(classList, node) {			
		var node = node || document,
		list = node.getElementsByTagName('*'), 
		length = list.length,  
		classArray = classList.split(/\s+/), 
		classes = classArray.length, 
		result = [], i,j
		for(i = 0; i < length; i++) {
			for(j = 0; j < classes; j++)  {
				if(list[i].className.search('\\b' + classArray[j] + '\\b') != -1) {
					result.push(list[i])
					break
				}
			}
		}
	
		return result
	}
}

function charOrdA(a, b) {
	a = a.toLowerCase();
	b = b.toLowerCase();
	if (a > b)
		return 1;
	if (a < b)
		return -1;
	return 0;
};

function eventsByTime(a, b) {
	a = new Date(a.time);
	b = new Date(b.time);
	if (a > b)
		return 1;
	if (a < b)
		return -1;
	return 0;
};



removeChildren = function(myNode){
	if(!myNode){
		return;
	}
	while (myNode.firstChild) {
	    myNode.removeChild(myNode.firstChild);
	}
};

function isEmpty(obj){
    return (Object.getOwnPropertyNames(obj).length === 0);
};

function clone(o) {
	if (!o || 'object' !== typeof o) {
		return o;
	}
	var c = 'function' === typeof o.pop ? [] : {};
	var p, v;
	for (p in o) {
		if (o.hasOwnProperty(p)) {
			v = o[p];
			if (v && 'object' === typeof v) {
				c[p] = clone(v);
			} else {
				c[p] = v;
			}
		}
	}
	return c;
};