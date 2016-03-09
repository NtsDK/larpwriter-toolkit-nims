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
		
		LocalDBMS.prototype.assignAdmin = function(name, callback){
			"use strict";
			this.database.ManagementInfo.admin = name;
			this.publishPermissionsUpdate();
			callback();
		};
		LocalDBMS.prototype.assignEditor = function(name, callback){
			"use strict";
			this.database.ManagementInfo.editor = name;
			this.publishPermissionsUpdate();
			callback();
		};
		LocalDBMS.prototype.removeEditor = function(callback){
			"use strict";
			this.database.ManagementInfo.editor = null;
			this.publishPermissionsUpdate();
			callback();
		};
		LocalDBMS.prototype.changeAdaptationRightsMode = function(mode, callback){
			"use strict";
			this.database.ManagementInfo.adaptationRights = mode;
			this.publishPermissionsUpdate();
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
			Utils.alert(strFormat(getL10n('function-must-be-overriden-on-server'), ['changePassword']));
			callback();
		};
		
		LocalDBMS.prototype.removeUser = function(name, callback){
			"use strict";
			delete this.database.ManagementInfo.UsersInfo[name];
			this.publishPermissionsUpdate();
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
			this.publishPermissionsUpdate();
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
			this.publishPermissionsUpdate();
			callback();
		};
		
		LocalDBMS.prototype.publishPermissionsUpdate = function() {
			// overrided by server
			Utils.alert(strFormat(getL10n('function-must-be-overriden-on-server'), ['publishPermissionsUpdate']));
		};
	};
	

	callback(accessManagerAPI);

})(function(api){
	typeof exports === 'undefined'? this['accessManagerAPI'] = api: module.exports = api;
});

		



