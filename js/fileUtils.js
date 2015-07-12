basicFileUtilsInit = function(){
	document.getElementById('fileinput').addEventListener('change',
			readSingleFile, false);
	
	var button = document.getElementById('saveFileButton');
	button.addEventListener('click', saveFile);
}

function readSingleFile(evt) {
	// Retrieve the first (and only!) File from the FileList object
	var f = evt.target.files[0];

	if (f) {
		var r = new FileReader();
		r.onload = function(e) {
			var contents = e.target.result;
//			alert("Got the file.n" + "name: " + f.name + "n" + "type: "
//					+ f.type + "n" + "size: " + f.size + " bytesn"
//					+ JSON.parse(contents)
//			// + "starts with: " + contents.substr(1, contents.indexOf("n"))
//			);
			Database = JSON.parse(contents);
			onLoad();
		}
		r.readAsText(f);
	} else {
		alert("Failed to load file");
	}
}

function saveFile() {
    window.open("data:application/json;charset=utf-8," + encodeURIComponent(JSON.stringify(Database, null, '  ')) );
}