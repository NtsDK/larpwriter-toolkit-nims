/*Copyright 2015 Timofey Rechkalov <ntsdk@yandex.ru>, Maria Sidekhmenova <matilda_@list.ru>

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
   limitations under the License. */


(function(callback){

	function accessManagerAPI(LocalDBMS, CommonUtils) {
		
		LocalDBMS.prototype.getUsersInfo = function(callback){
			"use strict";
//			if(!this.database.ManagementInfo){
//				this.database.ManagementInfo = {};
//				var ManagementInfo = this.database.ManagementInfo;
//				ManagementInfo.UsersInfo = {};
//				var that = this;
//				that.createUser("admin", "password", function(err){
//					if(err) {callback(err); return;}
//					ManagementInfo.admin = "admin";
//					ManagementInfo.editor = null;
//					ManagementInfo.adaptationRights = "ByStory";
//					that.createUser("user", "password", function(err){
//						if(err) {callback(err); return;}
//						callback(null, {
//							usersInfo : ManagementInfo.UsersInfo,
//							admin : ManagementInfo.admin,
//							editor : ManagementInfo.editor,
//							adaptationRights : ManagementInfo.adaptationRights
//						});
//					});
//				});
//			}
			var ManagementInfo = this.database.ManagementInfo;
			callback(null, {
				usersInfo : ManagementInfo.UsersInfo,
				admin : ManagementInfo.admin,
				editor : ManagementInfo.editor,
				adaptationRights : ManagementInfo.adaptationRights
			});
		};
		
		LocalDBMS.prototype.getUserCharacterNamesArray = function(callback) {
		    "use strict";
		    callback(null, Object.keys(this.database.Characters).sort(CommonUtils.charOrdA));
		};
	
		LocalDBMS.prototype.getUserStoryNamesArray = function (callback) {
		    "use strict";
		    callback(null, Object.keys(this.database.Stories).sort(CommonUtils.charOrdA));
		};
		
		LocalDBMS.prototype.assignAdmin = function(name, callback){
			"use strict";
			this.database.ManagementInfo.admin = name;
			callback();
		};
		LocalDBMS.prototype.assignEditor = function(name, callback){
			"use strict";
			this.database.ManagementInfo.editor = name;
			callback();
		};
		LocalDBMS.prototype.removeEditor = function(callback){
			"use strict";
			this.database.ManagementInfo.editor = null;
			callback();
		};
		LocalDBMS.prototype.changeAdaptationRightsMode = function(mode, callback){
			"use strict";
			this.database.ManagementInfo.adaptationRights = mode;
			callback();
		};
		
		LocalDBMS.prototype.isUserNameUsed = function(name, callback){
			"use strict";
			callback(null, this.database.ManagementInfo.UsersInfo[name] !== undefined);
		};
		
		LocalDBMS.prototype.createUser = function(name, password, callback){
			"use strict";
			this.database.ManagementInfo.UsersInfo[name] = {
				name : name,
				stories : [],
				characters : []
			};
			callback();
		};
		
		LocalDBMS.prototype.changePassword = function(userName, newPassword, callback){
			"use strict";
			callback();
		};
		
		LocalDBMS.prototype.removeUser = function(name, callback){
			"use strict";
			delete this.database.ManagementInfo.UsersInfo[name];
			callback();
		};
		
		LocalDBMS.prototype.removePermission = function(userName, storyNames, characterNames, callback){
			"use strict";
			var ManagementInfo = this.database.ManagementInfo;
			if(characterNames.length != 0){
				ManagementInfo.UsersInfo[userName].characters = ManagementInfo.UsersInfo[userName].characters.filter(function(charName){
					return characterNames.indexOf(charName) === -1;
				});
			}
			
			if(storyNames.length != 0){
				ManagementInfo.UsersInfo[userName].stories = ManagementInfo.UsersInfo[userName].stories.filter(function(storyName){
					return storyNames.indexOf(storyName) === -1;
				});
			}
			
			callback();
		};
		
		LocalDBMS.prototype.assignPermission = function(userName, storyNames, characterNames, callback){
			"use strict";
			var ManagementInfo = this.database.ManagementInfo;
			if(characterNames.length != 0){
				characterNames.forEach(function(charName){
					if(ManagementInfo.UsersInfo[userName].characters.indexOf(charName) === -1){
						ManagementInfo.UsersInfo[userName].characters.push(charName);
					}
				});
				
				Object.keys(ManagementInfo.UsersInfo).forEach(function(name){
					if(name === userName){
						return;
					}
					
					ManagementInfo.UsersInfo[name].characters = ManagementInfo.UsersInfo[name].characters.filter(function(charName){
						return characterNames.indexOf(charName) === -1;
					});
				});
			}
			
			if(storyNames.length != 0){
				
				storyNames.forEach(function(storyName){
					if(ManagementInfo.UsersInfo[userName].stories.indexOf(storyName) === -1){
						ManagementInfo.UsersInfo[userName].stories.push(storyName);
					}
				});
				
				Object.keys(ManagementInfo.UsersInfo).forEach(function(name){
					if(name === userName){
						return;
					}
					
					ManagementInfo.UsersInfo[name].stories = ManagementInfo.UsersInfo[name].stories.filter(function(storyName){
						return storyNames.indexOf(storyName) === -1;
					});
				});
			}
			
			callback();
		};
		
		if(typeof exports !== 'undefined' || MODE === "NIMS_SERVER"){
			function isAdmin(db, username){
				return db.ManagementInfo.admin === username;
			};
			
			function isEditor(db, username){
				return db.ManagementInfo.editor === username;
			};

			function existsEditor(db){
				return db.ManagementInfo.editor !== null;
			};
			
			LocalDBMS.prototype.hasPermission = function(command, args, user){
				if(!user){
					return false;
				}
				
				switch(command){
				case "setDatabase": // resetting database
				case "assignAdmin": // access management
				case "assignEditor":
				case "changeAdaptationRightsMode":
				case "createUser":
				case "changePassword":
				case "removeUser":
				case "setMetaInfo": // meta data
				case "createProfileItem": // profile configuring
				case "swapProfileItems":
				case "removeProfileItem":
				case "changeProfileItemType":
				case "renameProfileItem":
				case "updateDefaultValue":
					return isAdmin(this.database, user.name);
				case "removeEditor":
					return isAdmin(this.database, user.name) || isEditor(this.database, user.name);
				}
				return true;
			};
		} else {
			LocalDBMS.prototype.hasPermission = function(command, args, user){
				return true;
			};
		}
	};
	

	callback(accessManagerAPI);

})(function(api){
	typeof exports === 'undefined'? this['accessManagerAPI'] = api: module.exports = api;
});

		



