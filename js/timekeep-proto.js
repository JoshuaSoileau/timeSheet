var timeKeep;

timeKeep = Class.create({
	initialize: function(){
		$('error').hide();
		this.initObservers();
		this.inputData = [];
		this.outputData = [];

		this.scope = this;
	},

	initObservers: function(){
		var submit = this.submit.bind(this);
		var that = this;
		// observer for clicking 'enter' on input field
		$$('input').each( function(el) {
			el.observe('keypress', function(ev) {
				// the key code for 'enter/return' is 13
				if(ev.keyCode === 13){
					submit();
				}
			});
		});
		// observer for pressing 'submit'
		$('hrSubmit').observe('click', function() {
			submit();
		});
		//observer for pressing blue 'clear' button for input forms on the left
		$('clearInputBTN').observe('click', function() {
			that.resetInputData();
		});
		// observer for green 'Add Another Row +' button
		$('addRowBTN').observe('click', function() {
			that.addInputRow();
		});
		// observer for pressing blue 'clear' button for output forms on the right
		$('clearOutputTables').observe('click', function() {
			that.resetOutputData();
		});
	},

	getRowHash: function(row, that) {
		var isValid = that.isValidRow(row);
		var task = (isValid) ? row.down('.taskInput').getValue() : 'Error: invalid row!';
		var notes = (isValid) ? row.down('.notesInput').getValue() : 'Error: invalid row!';
		var startTime = (isValid) ? row.down('.start').getValue() : 'Error: invalid row!';
		var endTime = (isValid) ? row.down('.end').getValue() : 'Error: invalid row!';
		var totalTaskTime = that.calcHours(startTime, endTime);

		var returnHash = {
			isValidInputRow: isValid,
			task: task,
			notes: notes,
			startTime: startTime,
			endTime: endTime,
			totalTaskTime: totalTaskTime
		};

		return returnHash;
	},

	isValidRow: function(row){
		var returnVal = 1;
		var slice1 = this.splitByDelimiter(row.down('.start').getValue());
		var slice2 = this.splitByDelimiter(row.down('.end').getValue());
		//alert('testing validity');
		// check if both start and end times are empty
		if(!(row.down('.start').getValue()) && !(row.down('.end').getValue())) {
			returnVal = 0;
		}
		//check if missing start or end time
		else if(!(row.down('.start').getValue() && row.down('.end').getValue())) {
			this.error('Error, You are missing a start or end time.');
			returnVal = 0;
		}
		//check if  start and end time are equal (or no time is spent on the task)
		else if((row.down('.start').getValue() === row.down('.end').getValue())) {
			this.error('Error, You are missing a start or end time.');
			returnVal = 0;
		}
		// check if value is in the form HH:MM
		else if(slice1.length != 2) {
			this.error('Error, please enter in format HH:MM');
			returnVal = 0;
		}
		// check if HH and MM are actually numbers, or just jibberish we can't process
		else if(isNaN(slice1[0])) {
			this.error('Error, please enter only valid numbers / colons in the form. You entered '+slice1[0]+'.');
			returnVal = 0;
		}
		else if(isNaN(slice1[1])) {
			this.error('Error, please enter only valid numbers / colons in the form. You entered '+slice1[1]+'.');
			returnVal = 0;
		}
		// check for values in range 1-12 for HH and 0-59 for MM
		else if(parseInt(slice1[0])>12 || parseInt(slice1[0])<1) {
			this.error('Error, please enter a valid HH value (1-12). You entered '+slice1[0]+'.');
			returnVal = 0;
		}
		else if(parseInt(slice1[1])>59 || parseInt(slice1[1])<0) {
			this.error('Error, please enter a valid MM value (0-59). You entered '+slice1[1]+'.');
			returnVal = 0;
		}


		// check if value is in the form HH:MM
		else if(slice2.length != 2) {
			this.error('Error, please enter in format HH:MM.');
			returnVal = 0;
		}
		// check if HH and MM are actually numbers, or just jibberish we can't process
		else if(isNaN(slice2[0])) {
			this.error('Error, please enter only valid numbers / colons in the form. You entered '+slice2[0]+'.');
			returnVal = 0;
		}
		else if(isNaN(slice2[1])) {
			this.error('Error, please enter only valid numbers / colons in the form. You entered '+slice2[1]+'.');
			returnVal = 0;
		}
		// check for values in range 1-12 for HH and 0-59 for MM
		else if(parseInt(slice2[0])>12 || parseInt(slice2[0])<1) {
			this.error('Error, please enter a valid HH value (1-12). You entered 1 - '+slice2[0]+'.');
			returnVal = 0;
		}
		else if(parseInt(slice2[1])>59 || parseInt(slice2[1])<0) {
			this.error('Error, please enter a valid MM value (0-59). You entered 2 - '+slice2[1]+'.');
			return 0;
		}
		// check if start time values are > end time values
		else if((parseInt(slice1[0].valueOf())>(parseInt(slice2[0].valueOf())+12))) {
			this.error('Error, start time is greater than end time.');
			returnVal = 0;
		}


		return returnVal;
	},

	// does math to calculate the # of hrs between startTime and endTime
	calcHours: function(startTime, endTime) {
		var start = this.splitByDelimiter(startTime);
		var end = this.splitByDelimiter(endTime);
		var sumHrs;

		if( (parseInt(start[0]) > parseInt(end[0])) ||
			(parseInt(start[0]) >= parseInt(end[0])) && (parseInt(start[1]) >= parseInt(end[1]))){
			var temp = parseInt(end[0]);
			end[0] = temp + 12;
			//alert('end bigger than beginning');
		}
		var hours = parseInt(end[0]) - parseInt(start[0]);
		var mins = parseInt(end[1]) - parseInt(start[1]);

		sumHrs = hours + (mins/60);

		return sumHrs.toFixed(2);
	},

	splitByDelimiter: function(input) {
		var ret = input.split(':');
		if(ret.length == 2){
			return new Array(ret[0], ret[1]);
		}
		ret = input.split('.');
		if(ret.length == 2) {
			return new Array(ret[0], ret[1]);
		}
		ret = input.split(',');
		if(ret.length == 2) {
			return new Array(ret[0], ret[1]);
		}
		if(input.length == 1) {
			return new Array(input, 0);
		}
		if(input.length == 3) {
			//alert(input);
			ret = new Array( input.substr(0,1), input.substr(1,2) );
			//alert(ret);
			return ret;
		}
		if(input.length == 4) {
			ret = new Array( input.substr(0,2), input.substr(2,2) );
			return ret;
		}
		return new Array(ret[0], 0);
	},

	addInputRow: function() {
		$('addRowTR').insert({
			before: '<tr><td><input class="start" type="text" placeholder="HH:MM"></td><td><input class="end" type="text" placeholder="HH:MM"></td><td class="taskTD"><input class="taskInput" type="text" placeholder="Enter Task..."></td><td class="notesTD"><input class="notesInput" type="text" placeholder="Enter Notes..."></td></tr>'
		});
		this.setInputData();
		$('error').hide();
	},

	addInputRow: function() {
		$('addRowTR').insert({
			before: '<tr><td><input class="start" type="text" placeholder="HH:MM"></td><td><input class="end" type="text" placeholder="HH:MM"></td><td class="taskTD"><input class="taskInput" type="text" placeholder="Enter Task..."></td><td class="notesTD"><input class="notesInput" type="text" placeholder="Enter Notes..."></td></tr>'
		});
		this.setInputData();
		$('error').hide();
	},

	addOutputRow: function() {
		$('hoursTable').insert("<tr><td><div class=\"time\"><span>Hours...</span></div></td><td><div class=\"taskOut\"><span>Task...</span></div></td><td><div class=\"notesOut\"><span>Notes...</span></div></td></tr>");
	},

	deleteOutputRow: function() {
		var that = this;
		$$('.delete').each( function(row, index) {
			if(row.hasClassName('pleaseDelete')) {
				row.removeClassName('pleaseDelete');
				row.up(2).remove();
				that.outputData.splice(index, 1);
			}
		});
		//this.print();
		if(this.outputData.length < 5) {
			this.addOutputRow();
		}
		this.updateTotalTime();
		this.drawPieGraph();
	},

	updateTotalTime: function() {
		var sum = 0;
		var that = this;
		this.outputData.each( function(row, index) {
			if(index < that.outputData.length) {
				var temp = parseFloat(sum, 10);
				sum = temp + parseFloat(row["totalTaskTime"], 10);
				//alert(temp+' + '+parseFloat(row.totalTaskTime, 10)+' = '+sum);
			}
		});
		$('totTime').update(parseFloat(sum, 10).toFixed(2));
	},

	setInputData: function() {
		var getRowHash = this.getRowHash;
		var that = this;
		// reset inputData to empty
		this.inputData = [];
		// then refill the inputData
		$('hoursBody').childElements().each( function(tst) {
			if(tst.identify() != 'addRowTR') {
				// NEED TO CHANGE THIS BC NO INPUTROW CLASS
				var row = new getRowHash(tst, that);
				if(row["isValidInputRow"]) {
					that.inputData.push(row);
				}
			}
		});
		$$('input').each( function(el) {
			el.stopObserving();
			el.observe('keypress', function(ev) {
				// the key code for 'enter/return' is 13
				if(ev.keyCode == 13){
					that.submit();
				}
			});
		});
	},

	setOutputData: function() {
		var that = this;
		this.inputData.each( function(inRow, inIndex) {
			//alert('in updateData() '+timeKeep.outputData.length);
			// if our output table is empty, put one item in it
			if(that.outputData.length === 0) {
				that.outputData.push(inRow);
			// otherwise, loop through output table and look for a matching 'task' and update it's time
			} else {
				that.outputData.each( function(outRow,outIndex) {
					if((inRow["task"]===outRow["task"])){
						//alert('tasks '+inIndex+' and '+outIndex+' are equal!');
						var temp = parseFloat(outRow["totalTaskTime"], 10);
						//alert('temp: '+temp);
						outRow["totalTaskTime"] = (temp + parseFloat(inRow["totalTaskTime"], 10)).toFixed(2);
						if(inRow["notes"]!=='') {
							if(outRow["notes"]==='') {
								outRow["notes"] = inRow["notes"];
							} else if(inRow["notes"] != outRow["notes"]){
								outRow["notes"] += ' - '+inRow["notes"];
							}
						}
						//alert(temp+' + '+inRow.totalTaskTime+' = '+outRow.totalTaskTime);
						throw $break;
					// else if we've found one we haven't been to before, insert the new task here
					} else if(outIndex === (that.outputData.length-1)){
						//alert('tasks are not equal :\' (');
						that.outputData.push(inRow);
					}
				});
			}
		});
		this.updateDisplay();
	},

	resetInputData: function() {
		// grab all the rows in input table, and remove extra ones
		var inputTable = $$('#timeTable tbody tr');
		if(inputTable.length > 4) {
			inputTable.each( function(node, i) {
				if(i>2 && node.identify() != 'addRowTR') node.remove();
			});
		}
		Form.reset('timeTable');
		$('error').hide();
	},

	resetOutputData: function() {
		// hide error message if it is there
		$('error').hide();
		// go through each table row and reset it to defaults
		this.outputData = [];
		var table = $$('#sumTable tbody tr');
		table.each( function(node, i) {
			if(node.hasClassName('added')) {
				node.down('.time').update('<span>Hours...</span>');
				node.down('.taskOut').update('<span>Task...</span>');
				node.down('.notesOut').update('<span>Notes...</span>');
				node.removeClassName('added');
			}
		});

		// check if additional rows were added to the table, and remove them
		// if they were
		if(table.length > 6) {
			table.each( function(node, i) {
				if(i>5) node.remove();
			});
		}

		// resets Total Time to 0
		$('totTime').update(0);
		$('myChart').update();

		return false;
	},

	printInputData: function() {
		var str = 'Print Table - \n';
		this.inputData.each( function(row, i) {
			str +='   Row '+i+', TotalTime: '+row["totalTaskTime"]+', Task: '+row["task"]+', Notes: '+row["notes"]+'\n';
		});
		alert(str);
	},

	printOutputData: function() {
		var str = 'Print OUTPUT Table - \n';
		timeKeep.outputData.each( function(row, i) {
			str +='   Row '+i+', TotalTime: '+row["totalTaskTime"]+', Task: '+row["task"]+', Notes: '+row["notes"]+'\n';
		});
		alert(str);
	},

	updateDisplay: function() {
		var that = this;
		// grab all the rows of the 'sum hours' table
		var table = $$('#sumTable tbody tr');
		if(table.length <= this.outputData.length) {
			this.addOutputRow();
		}
		table.each( function(row, index) {
			if(index < that.outputData.length) {
				//alert(index+' '+row.innerHTML);
				row.addClassName('added');
				row.down('.time').update('<span>'+that.outputData[index]["totalTaskTime"]+'</span><button class="btn btn-danger delete" onClick="return false;">-</button>');

				// create observers for 'delete' buttons on this new row
				$$('.delete').each( function(el) {
					el.stopObserving();
					el.observe('click', function(ev) {
						el.addClassName('pleaseDelete');
						that.deleteOutputRow();
					});
				});

				// add additional notes, if there are any
				if(that.outputData[index]["task"]) {
					row.down('.taskOut').update('<span>'+that.outputData[index]["task"]+'</span>');
				} else {
					row.down('.taskOut').update('<span>None</span>');
				}
				// add additional notes, if there are any
				if(that.outputData[index]["notes"]) {
					row.down('.notesOut').update('<span>'+that.outputData[index]["notes"]+'</span>');
				} else {
					row.down('.notesOut').update('<span>None</span>');
				}
			}
		});
		this.updateTotalTime();
		this.drawPieGraph();
	},

	drawPieGraph: function() {
		// collect the data to feed to the pie chart api
		var data = [];
		this.outputData.each( function(row, index) {
			data.push([row["task"], row["totalTaskTime"]]);
		});

		// generate the pie chart
		new Chartkick.PieChart("myChart", data);
	},

	error: function(message) {
		$('error').update(message);
		$('error').show();
	},

	submit: function() {
		$('error').hide();
		this.setInputData();
		this.setOutputData();
	}
});

Event.observe(window, 'load', function(){

	timekeeping = new timeKeep();

}.bind(window));