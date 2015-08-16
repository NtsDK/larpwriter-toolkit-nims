DBMS = {};

DBMS.createCharacter = function(name) {
	Database.Characters[name] = {
		name : name,
		bio : ""
	};
};

DBMS.renameCharacter = function(fromName, toName) {
	var data = Database.Characters[fromName];
	data.name = toName;
	Database.Characters[toName] = data;
	delete Database.Characters[fromName];

	for ( var storyName in Database.Stories) {
		var story = Database.Stories[storyName];
		if (story.characters[fromName]) {
			var data = story.characters[fromName];
			data.name = toName;
			story.characters[toName] = data;
			delete story.characters[fromName];

			for (var i = 0; i < story.events.length; ++i) {
				var event = story.events[i];
				if (event.characters[fromName]) {
					var data = event.characters[fromName];
					event.characters[toName] = data;
					delete event.characters[fromName];
				}
			}
		}
	}
};

DBMS.removeCharacter = function(name) {
	delete Database.Characters[name];
};

DBMS.getCharacterNamesArray = function() {
	var characterArray = [];

	for ( var name in Database.Characters) {
		characterArray.push(name);
	}

	characterArray.sort(charOrdA);
	return characterArray;
};

DBMS.getStoryCharacterNamesArray = function(storyName) {
	var characterArray = [];

	var localCharacters;
	if (storyName == null) {
		localCharacters = Stories.CurrentStory.characters;
	} else {
		localCharacters = Database.Stories[storyName].characters;
	}
	for ( var name in localCharacters) {
		characterArray.push(name);
	}

	characterArray.sort(charOrdA);
	return characterArray;
};

DBMS.getStoryNamesArray = function(storyName) {
	var stroyNamesArray = [];

	for ( var name in Database.Stories) {
		stroyNamesArray.push(name);
	}

	stroyNamesArray.sort(charOrdA);
	return stroyNamesArray;
};