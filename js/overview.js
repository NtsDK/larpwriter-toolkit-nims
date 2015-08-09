Overview = {};

Overview.init = function(){
	var name=document.getElementById("gameNameInput");
	name.value = Database.Meta.name;
	name.addEventListener("change", Overview.updateName);
	
	var date=document.getElementById("gameDatePicker");
	date.value = Database.Meta.date;

	var opts = {
		lang : "ru",
		mask : true,
		onChangeDateTime : Overview.updateTime,
	};

	jQuery(date).datetimepicker(opts);

	var date=document.getElementById("preGameDatePicker");
	date.value = Database.Meta.preGameDate;
	
	var opts = {
			lang : "ru",
			mask : true,
			onChangeDateTime : Overview.updatePreGameDate,
	};
	
	jQuery(date).datetimepicker(opts);
	
	var descr=document.getElementById("gameDescription");
	descr.value = Database.Meta.description;
	descr.addEventListener("change", Overview.updateDescr);
	
	Overview.content = document.getElementById("overviewDiv");
};

Overview.refresh = function(){
};

Overview.updateName = function(event){
	Database.Meta.name = event.target.value;
};
Overview.updateTime = function(dp, input){
	Database.Meta.date = input.val();
};
Overview.updatePreGameDate = function(dp, input){
	Database.Meta.preGameDate = input.val();
};
Overview.updateDescr = function(event){
	Database.Meta.description = event.target.value;
};