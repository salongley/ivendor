//Code related to adding, removing, and displaying Country data

class CountryController {

	constructor(){
		this.country = new Country();
		this.getCountries();


	}

	// this method constructs the country table
	 createTable(countries){



		 $('#CountryTableData').html('');

		//Uses the country data as JSON from the database. Constructs the table and then writes the data to the CountryTable Data div
		var tableData = `<table class="table table-striped"><tbody><tr class="info"><th>Country name</th><th>Timezone</th><th>GMT Offset</th><th>Region</th><th></th></tr>`;
		countries.forEach( function(country){
			tableData = tableData +  `<tr><td>${country.country}</td><td>${country.timezone}</td>
			<td>${country.gmtOffset} </td><td>${country.region}</td><td>
			<button type="button" class="btn btn-primary btn-xs" onclick="countryController.editCountry('${country.country}')"><i class="fa fa-edit"></i></span></button>
			<button type="button" class="btn btn-danger btn-xs" onclick="countryController.deleteCountry('${country.country}')"><i class="fa fa-trash-o"></i></span></button></td></tr>`;

		});

		$('#CountryTableData').html(tableData + `</tbody></table>`);


	}

	createForm(){
		// creates a modal form and binds the controls to the model via the form change function.

		var regions = new Map([['APAC','APAC'],['EU','EU'],['EMIA','EMIA'],['MEIAR','MEIAR'],['LATAM', 'LATAM'],['NMR', 'NMR']]);

		var body = textBox('country','Country Name','country name', 'oninput="countryController.formChange(this)"');
		body += textBox('timezone','Timezone','Europe/Paris', 'oninput="countryController.formChange(this)"');
		body += textBox('gmtOffset','GMT Offset','UTC +2:00', 'oninput="countryController.formChange(this)"');
		body += selectControl('region', 'Region', regions, 'onchange="countryController.formChange(this)"');

		var footer = `<div class="form-group">
					<button type="button" class="btn btn-primary" onclick='countryController.saveCountry()'>Add Country</button>
					<button type="button" class="btn" onclick='countryController.closeForm()'>Cancel</button>`;

		 var countryModal = modalGenerator('addCountryModal', 'New Country', body, footer);
		$('#countryDataEntry').html(countryModal);
	}

	showForm(){
		this.createForm();
		$('#addCountryModal').modal("show");
	}
	closeForm(){
		$('#addCountryModal').modal('hide');
	}

	formChange(element){

		this.country[element.id] = element.value;

	}

	// this method makes an ajax call for the countries and returns an array of country objects
	getCountries(){
		var countries = [];
		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function() {
			if (this.readyState == 4 && this.status == 200) {
				var results = JSON.parse(this.responseText);

				results.forEach( function(result){
					var newCountry = new Country();
					newCountry.country = result.country;
					newCountry.timezone = result.timezone;
					newCountry.gmtOffset = result.gmtOffset;
					newCountry.region = result.region;
					countries.push(newCountry);

				});

				countryController.createTable(countries);
			}
		}

		xhttp.open("GET", '/countries', true);
		xhttp.send();

	}



	// gets a single country based on its name and returns it.
	getCountry(countryID){
		var newCountry = new Country();
		$.ajax({
			url: '/countries/' + countryID,
			async:false,
			success : function(result, status){
				//make an array of country objects


					newCountry.country = result.country;
					newCountry.timezone = result.timezone;
					newCountry.gmtOffset = result.gmtOffset;
					newCountry.region = result.region;

				}

		});
		return newCountry;
	}
	// takes a country name and then deletes it.
	deleteCountry(countryID){
		$.ajax({
			url: '/countries/' + countryID,
			type: 'DELETE',
			complete: function(result, status){

				$('#countryAlerts').html(generateAlert(countryID +' record deleted!', 'success'));
				countryController.getCountries();
			}});


	}

	saveCountry(country){
		//validation, making sure the fields are filled in.

		 if (this.country.country =='' || this.country.timezone ==''  || this.country.gmtOffset ==''){

		 	//show warning in danger alert box

		 	$('#addCountryModalAlert').html(generateAlert('All fields must be completed!', 'danger'));


		 }
		 else {

			$.ajax({type: 'post',
				url: '/countries' ,
				data: JSON.stringify(this.country),
				dataType: 'json',
				async:true,
				contentType: 'application/json ; charset=utf-8',
				complete: (function(result, status){

					$('#countryAlerts').html(generateAlert(result.responseJSON.country +' added!', 'success'));


					$('#addCountryModal').modal('hide');
					countryController.getCountries();

				})
			});

		 }
		 this.getCountries();
	}

	editCountry(countryID){

		this.country = this.getCountry(countryID);
		this.createForm();

		$('#country').val(this.country.country) ;
		$('#timezone').val(this.country.timezone);

		$('#gmtOffset').val(this.country.gmtOffset);
		$('#region').val(this.country.region);
		$('#addCountryModal').modal("show");
	}

	cancelForm(){

		$('#addCountryModal').modal("hide");
	}

	getTimeZones(){
		var timezones = [];
		var countries = getCountries();
		for(var i =0; i < countries.length; i++){
			if(countries[i].country == mycountry){
				timezones.push(countries[i].timezone);
			}
		}

		return timezones;
	}
}

var countryController = new CountryController();
