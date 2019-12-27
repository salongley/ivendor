//Code related to adding, removing, and displaying Vendors and the countries they work in and resource costs.

class VendorController {

	constructor() {

		this.vendor = new Vendor();
		this.countryOptions = null;
		this.timezones = null
		this.resourceOptions = null;
		this.loadOptionData();
		this.getAllVendors();
		this.editing = false;
	}

	async loadOptionData() {
		this.countryOptions = await this.createCountryOptions();
		this.resourceOptions = await this.createResourceTypeOptions();
		this.timezones = await this.createTimezones();
	}

	createCountryOptions() {
		var countryMap = new Map();

		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				var results = JSON.parse(this.responseText);

				results.forEach(function (result) {

					countryMap.set(result.country+":"+result.timezone, result.country+" : "+result.timezone);

				});

			}
		}

		xhttp.open("GET", '/countries', true);
		xhttp.send();
		return countryMap;
	}

	createTimezones() {
		var timezoneMap = new Map();


		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				var results = JSON.parse(this.responseText);

				results.forEach(function (result) {

					timezoneMap.set(result.country, result.timezone);

				});

			}
		}

		xhttp.open("GET", '/countries', true);
		xhttp.send();
		return timezoneMap;
	}


	//creates the Resource Type Options for a select control. The elements combine the resource type and the element name and icon
	createResourceTypeOptions() {

		var resourceMap = new Map();

		var xhttp = new XMLHttpRequest();
		xhttp.onreadystatechange = function () {
			if (this.readyState == 4 && this.status == 200) {
				var results = JSON.parse(this.responseText);
				// process each record and make a new Resource Type before adding to an array
				results.forEach(function (result) {

					result.resourceElements.forEach(function (element) {

						resourceMap.set((result.resourceTypeName + ':' + element.elementName + ':' + element.icon), result.resourceTypeName + ' : ' + element.elementName);
					});
				});
			}
		}

		xhttp.open("GET", '/resourcetypes', true);
		xhttp.send();
		return resourceMap;
	}

	getAllVendors() {
		var vendors = [];
		$.ajax({
			url: '/vendors',
			async: false,
			complete: function (result) {

				//make an array of vendor objects
				$.each(result.responseJSON, function (i, vendor) {

					vendors.push(vendor);
				});
			}
		});
		this.displayAllVendors(vendors);
	}

	displayAllVendors(vendors) {

		var vendorData = '<div class="vendorInfo">';
		var row = '';

		vendors.forEach(function (vendor, i) {
			row = '<div class="vendorName"><h4>Vendor:<em> ' + vendor.vendorName + '</em></h4></div><div style="margin-bottom:10px" class="text-right"><button type="button" class="btn btn-primary btn-xs" onclick="vendorController.editVendor(\'' + vendor.vendorName + '\')"><i class="far fa-edit"></i></button><button type="button" class="btn btn-danger btn-xs" onclick="vendorController.deleteVendor(\'' + vendors[i].vendorName + '\')"><i class="far fa-trash-alt"></i></button></div><div class="vendorDetails">';
			row = row + '<h5>Countries</h5> <i id="showhideVendorDetails' + i + '" onclick="showHideVendorResourceDetails(' + i + ')" class="fas fa-angle-right fa-2x"></i>';
			row = row + '<div id="vendorDetailsResources' + i + '" class="collapse">';
			row = row + '<table class="table table-striped vendorDetailsResources"><tbody><tr class="info"><th>Countries</th><th>Details</th><th>Country Resources</th></tr>';

			vendor.countries.forEach(function (country) {
				row = row + '<tr><td>Country: ' + country.country + '<br \>Start Date: ' + country.startDate + '<br \>';
				row = row + 'End Date: ' + country.endDate + '<br \></td><td>';

				row = row + '<span class="spaceAround"><strong>Timezone</strong>: ' + country.timezone + '</span>';
				row = row + '<span class="spaceAround"><strong>Default Pickup Location</strong>: ' + country.defaultPickupLocation + '</span><br \>';
				row = row + '<span class="spaceAround"><strong>Vendor Emails</strong>: ' + country.vendorEmails + '</span>';
				row = row + '<span class="spaceAround"><strong>Apple Emails</strong>: ' + country.appleEmails + '</span><br \>';
				row = row + '<span class="spaceAround"><strong>Project Name</strong>: ' + country.projectName + '</span><br \></td><td>';

				country.resources.resourceElements.forEach(function (element) {
					row = row + '<div class="resources"><i class="' + element.icon + '"></i> ' + country.resources.resourceTypeName + ' : ' + element.elementName + ' : ' + element.elementCost + '<br \>';


				});
				row = row + '</td></tr>';
			});
			vendorData = vendorData + row + '</tbody></table></div></div>';


		});
		$('#VendorTableData').html(vendorData);
	}



	showHideVendorResourceDetails(id) {

		$('#vendorDetailsResources' + id).collapse('toggle');

		if ($('#showhideVendorDetails' + id).hasClass('fas fa-angle-right fa-2x')) {
			$('#showhideVendorDetails' + id).removeClass('fas fa-angle-right fa-2x');
			$('#showhideVendorDetails' + id).addClass('fas fa-angle-down fa-2x');

		} else {
			$('#showhideVendorDetails' + id).removeClass('fas fa-angle-down fa-2x');
			$('#showhideVendorDetails' + id).addClass('fas fa-angle-right fa-2x');

		}
	}
	createForm() {
		$('#vendorDataEntry').html('');
		var body = textBox('vendorName', 'Vendor Name', '', 'oninput="vendorController.formChange(this)"');
		body += `<div id="vendorCountries"></div>`;
		var footer = `<div class="form-group">
					<button type="button" class="btn btn-primary" onclick='vendorController.saveVendor()'>Add Vendor</button>
					<button type="button" class="btn" onclick='vendorController.closeForm()'>Cancel</button>`;

		var vendorModal = modalGenerator('addVendorModal', 'New Vendor', body, footer);
		$('#vendorDataEntry').html(vendorModal);
		this.insertVendorCountryForm();
	}




	deleteVendorCountryForm(country) {

		if (country > 0) {
			$('#country' + country + 'group').remove();
			this.vendor.countries.splice(country, 1);
		}

	}

	addCountryResourceElementInput(country) {


		this.vendor.countries[country].resources.resourceElements.push(new ElementCosts());

		var controlNo = this.vendor.countries[country].resources.resourceElements.length - 1;
		var element = `<div  id="country-` + country + `-resources-` + controlNo + `Controls"><div class="form-row"><div class="col">` + selectControl("country-" + country + "-resourceType-" + controlNo, "Resource Type", this.resourceOptions, 'onchange="vendorController.formChange(this)"') + `</div>`;
		element = element + `<div class="form-group">` + textBox("country-" + country + "-Cost-" + controlNo, "Cost", "0", 'oninput="vendorController.formChange(this)"') + `</div>`;
		element = element + `<div class="col align-self-center"><button onclick="vendorController.addCountryResourceElementInput(` + country + `)" class="btn btn-primary" type="button"><i class="fas fa-plus"></i></button><button onclick="vendorController.removeCountryResourceElementInput(` + country + `,` + controlNo + `)"class="btn btn-danger" type="button"><i class="far fa-trash-alt"></i></button></div></div></div></div></div>`;

		$('#country' + country + 'resources').append(element);


	}

	removeCountryResourceElementInput(country, controlNo) {

		if (controlNo > 0) {
			this.vendor.countries[country].resources.resourceElements.splice(controlNo, 1);

			$('#country-' + country + '-resources-' + controlNo + 'Controls').remove();
		}



	}

	showForm() {
		this.createForm();
		$('#addVendorModal').modal("show");
	}

	closeForm() {
		$('#addVendorModal').modal('hide');
	}

	formChange(element) {
		if (element.type == "select-one") {
			var property = element.id.split('-');
			if (property.length == 2) {
				var elementValues = element.value.split(':');
				this.vendor.countries[parseInt(property[1])].country = elementValues[0];
				this.vendor.countries[parseInt(property[1])].timezone = elementValues[1];
			} else {
				var elementValues = element.value.split(':');
				this.vendor.countries[parseInt(property[1])].resources.resourceTypeName = elementValues[0];
				this.vendor.countries[parseInt(property[1])].resources.resourceElements[parseInt(property[3])].elementName = elementValues[1];
				this.vendor.countries[parseInt(property[1])].resources.resourceElements[parseInt(property[3])].icon = elementValues[2];
			}
			//this.vendor.countries[count].timezone = this.timeszones.get(element.value);
		} else if (element.type == "text") {
			if (element.id.includes('Date')) {

				var property = element.id.split('-');
				this.vendor.countries[parseInt(property[1])][property[2].trim()] = moment(element.value, "YYYY-MM-DD").format("YYYY-MM-DD");
			}
			else if (element.id.includes("-")) {
				var property = element.id.split('-');

				if (property.length == 2) {
					this.vendor.countries[parseInt(property[1])][property[0].trim()] = element.value;
				} else if (property.length == 4) {
					this.vendor.countries[parseInt(property[1])].resources.resourceElements[parseInt(property[3])].elementCost = element.value;
				}


			}
			else {
				this.vendor.vendorName = element.value;
			}
		}
	}

	saveVendor() {

		//validation

		if (this.vendor.vendorName == '') {
			//show warning in danger alert box
			$('#vendorMessageModal').html('Vendor name, and Emails Must be completed!');
			$('#vendorAlertsModal').collapse('toggle');
			$('#vendorAlertsModal').removeClass('alert-success').addClass('alert-danger');
			// remove warning after 5 seconds and reset the alert style.
			window.setTimeout(function () {
				$('#vendorAlertsModal').collapse('toggle');
				$('#vendorAlertsModal').removeClass('alert-danger').addClass('alert-success');

			}, 5000);
		}
		else {

		}

		if (this.editing){
			

			//posts the results and displays a status message
			$.ajax({
				type: 'put',
				url: '/vendors/'+ this.vendor.vendorName,
				data: JSON.stringify(this.vendor),
				dataType: 'json',
				contentType: 'application/json ; charset=utf-8',
				complete: (function (result, status) {

					vendorController.getAllVendors();//reload vendor data
					vendorController.closeForm(); // close form
					vendorController.vendor = new Vendor();
				})

			});
			this.editing = false;

		} else {
			//posts the results and displays a status message
			$.ajax({
				type: 'post',
				url: '/vendors',
				data: JSON.stringify(this.vendor),
				dataType: 'json',
				contentType: 'application/json ; charset=utf-8',
				complete: (function (result, status) {

					vendorController.getAllVendors();//reload vendor data
					vendorController.closeForm(); // close form
					vendorController.vendor = new Vendor();
				})

			});

		}
		
	}





	editVendor(vendorID) {
		this.editing = true;
		//load vendor data based on id
		this.vendor = new Vendor();
		$.ajax({
			type: 'get',
			url: '/vendors/' + vendorID,
			async: false,
			dataType: 'json',
			contentType: 'application/json ; charset=utf-8'

		}).done(function (data, status) {


			//show modal form and fill in the details into the form
			vendorController.showForm();

			$('#vendorName:text').val(data.vendorName);

			//each vendor will have one or more countries associated with it.
			//This means that we need to count how many countries there are and add the appropriate number of country sections

			//count have many countries there are so we can add the correct number of country input elements
			var countryElements = data.countries.length;

			//cycle through each country in the vendor.countries
			for (var countryCounter = 0; countryCounter < countryElements; countryCounter++) {
				//add an extra country controls for every other country other than the first.
				if (countryCounter > 0) {

					vendorController.insertVendorCountryForm();
				}

				$('#vendorTimezone-' + countryCounter + ':text').val(data.countries[countryCounter].timezone);
				$('#vendorEmails-' + countryCounter + ':text').val(data.countries[countryCounter].vendorEmails);
				$('#appleEmails-' + countryCounter + ':text').val(data.countries[countryCounter].appleEmails);
				$('#projectName-' + countryCounter + ':text').val(data.countries[countryCounter].projectName);
				$('#defaultPickupLocation-' + countryCounter + ':text').val(data.countries[countryCounter].defaultPickupLocation);
				// set the values for the control for that country
				$('#country-' + countryCounter).val(data.countries[countryCounter].country+":"+data.countries[countryCounter].timezone);
				$('#country-' + countryCounter + '-startDate').val(data.countries[countryCounter].startDate);
				$('#country-' + countryCounter + '-endDate').val(data.countries[countryCounter].endDate);


				//Add number of extra elements for the country


				data.countries[countryCounter].resources.resourceElements.forEach(function (element, index) {
					//as one resource element is input is already there only add one in for subsequent ones
					if (index > 0) {

						vendorController.addCountryResourceElementInput(countryCounter);
					}
					$('#country-' + countryCounter + '-resourceType-' + index).val(data.countries[countryCounter].resources.resourceTypeName + ":" + data.countries[countryCounter].resources.resourceElements[index].elementName + ":" + data.countries[countryCounter].resources.resourceElements[index].icon);

					$('#country-' + countryCounter + '-Cost-' + index).val(data.countries[countryCounter].resources.resourceElements[index].elementCost);



				});



			}

			vendorController.vendor = JSON.parse(JSON.stringify(data));


		});
	}

	deleteVendor(vendorID) {
		$.ajax({
			url: '/vendors/' + vendorID,
			type: 'DELETE',
			success: function (result) {
				$('#vendorMessage').html("Deleting Vendor");
				$('#vendorAlerts').collapse('toggle');
				window.setTimeout(function () { $('#vendorAlerts').collapse('toggle') }, 2000);
				vendorController.getAllVendors();//reload vendor data
			}
		});

	}

	insertVendorCountryForm() {
		// if it is the first country then create a new one. Then append a new resource and the first element
		if (this.vendor.countries == [] || this.vendor.countries == null) {
			this.vendor.countries[0] = new VendorCountry();
			this.vendor.countries[0].resources = new ResourceTypeCosted();
			this.vendor.countries[0].resources.resourceElements.push(new ElementCosts());
		} else {
			this.vendor.countries.push(new VendorCountry());
			this.vendor.countries[this.vendor.countries.length - 1].resources = new ResourceTypeCosted();
			this.vendor.countries[this.vendor.countries.length - 1].resources.resourceElements.push(new ElementCosts());

		}

		var noOfCountries = this.vendor.countries.length - 1;
		var controlNo = 0;

		// add controls for new country
		var element = `<div id="country${noOfCountries}group" class="border border-secondary countryGroup" style="padding:10px;"><div class="form-row"><div class="col">`;
		element = element + selectControl("country-" + noOfCountries, "Country", this.countryOptions, 'onchange="vendorController.formChange(this)"');

		element = element + `</div><div class="col-3 align-self-center"><button onclick="vendorController.insertVendorCountryForm()" class="btn btn-primary" type="button" style="width:170px;"><i class="fas fa-plus"></i>Add Country</button><button onclick="vendorController.deleteVendorCountryForm(${noOfCountries})" class="btn btn-danger" type="button" style="width:170px;"><i class="far fa-trash-alt"></i>Remove Country</button></div></div>`;
		element = element + `<div class="form-row"><div class="col">` + textBox("vendorEmails-" + noOfCountries, "Vendor Emails", 'comma separated', 'onchange="vendorController.formChange(this)"') + `</div>`;
		element = element + `<div class="col">` + textBox("appleEmails-" + noOfCountries, "Apple Emails", "comma separated", 'onchange="vendorController.formChange(this)"') + `</div></div>`;
		element = element + `<div class="form-row"><div class="col">` + textBox("projectName-" + noOfCountries, "Project Name", "", 'onchange="vendorController.formChange(this)"') + `</div>`;
		element = element + `<div class="col">` + textBox("defaultPickupLocation-" + noOfCountries, "Default Pickup Location", "", 'onchange="vendorController.formChange(this)"') + `</div></div>`;
		element = element + `<div class="form-row"><div class="col">` + dateEntry("country-" + noOfCountries + "-startDate", "Start Date", 'onchange="vendorController.formChange(this)"') + `</div>`;
		element = element + `<div class="col">` + dateEntry("country-" + noOfCountries + "-endDate", "End Date", 'onchange="vendorController.formChange(this)"') + `</div></div>`;
		element = element + `<div class="col"><div id="country${noOfCountries}resources"><div id="country${noOfCountries}resources${controlNo}Controls"><div class="form-row"><div class="col">`;
		element = element + `<div class="form-group">` + selectControl("country-" + noOfCountries + "-resourceType-" + controlNo, "Resource Type", this.resourceOptions, 'onchange="vendorController.formChange(this)"') + `</div></div>`;
		element = element + `<div class="form-group">` + textBox("country-" + noOfCountries + "-Cost-" + controlNo, "Cost", "0", 'onchange="vendorController.formChange(this)"') + `</div>`;
		element = element + `<div class="col align-self-center"><button onclick="vendorController.addCountryResourceElementInput(${noOfCountries})" class="btn btn-primary" type="button"><i class="fas fa-plus"></i></button><button onclick="vendorController.removeCountryResourceElementInput(${noOfCountries},${controlNo})"class="btn btn-danger" type="button"><i class="far fa-trash-alt"></i></button></div></div></div></div></div>`;




		$('#vendorCountries').append(element);

	}
}


// get the timezone based on the country selected and add it to the hidden field
function saveTimeZone(countrySelected, controlNo) {
	// set timezone to the correct one for chosen country
	var timezone = '';
	//var countries = getAllCountriesData();
	$.each(countries, function (i, country) {
		if (country.country == countrySelected) {
			$('#vendorTimezone' + controlNo).val(country.timezone);
		}
	});

}

function showHideVendorResourceDetails(id) {

	$('#vendorDetailsResources' + id).collapse('toggle');

	if ($('#showhideVendorDetails' + id).hasClass('fas fa-angle-right fa-2x')) {
		$('#showhideVendorDetails' + id).removeClass('fas fa-angle-right fa-2x');
		$('#showhideVendorDetails' + id).addClass('fas fa-angle-down fa-2x');

	} else {
		$('#showhideVendorDetails' + id).removeClass('fas fa-angle-down fa-2x');
		$('#showhideVendorDetails' + id).addClass('fas fa-angle-right fa-2x');

	}

}


var vendorController = new VendorController();
