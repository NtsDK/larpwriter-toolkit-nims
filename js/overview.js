Overview = {};

Overview.init = function(){
	var overviewDiv = document.createElement("div");
	overviewDiv.id = overviewDiv;
	overviewDiv.appendChild(document.createTextNode("Overview"));
	
	Overview.content = overviewDiv;
//	return overviewDiv;
}

Overview.refresh = function(){}