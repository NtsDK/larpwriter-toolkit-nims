DBMS = {};

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
	if(storyName == null){
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