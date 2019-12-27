//These are the data structures that map to the models in the Java back end


//country data model
class Country {
	constructor() {

		this.country = '';
		this.timezone = '';
		this.gmtOffset = '';
		this.region = '';
	}

}

class User {
	constructor() {

		this.user_id = 0;
		this.name = ''; // LDAP name
		this.full_name = '';
		this.preferred_name = '';
		this.dsid = ''; //apple directory personID
		this.role = ''; // number referring to role in the app
		this.email = '';
		this.contact_number = '';
		this.timezone = '';
		this.image_base_64 = '';
	}
}


//resouseTypes data models

class ResourceType {
	constructor() {

		this.resourceTypeName = '';
		this.isMultipleDay = false;
		this.resourceElements = []; // array of elements
		this.resourceTags = [];
	}


	//creates the Resource Type Options for a select control. The elements combine the resource type and the element name and icon

	keyValues() {
		var resourceMap = new Map();

		for (var j = 0; j < this.resourceElements.length; j++) {

			resourceMap.set((this.resourceTypeName + ':' + this.resourceElements[j].elementName + ':' + this.resourceElements[j].icon), this.resourceTypeName + ':' + this.resourceElements[j].elementName);
		}

		return resourceMap;
	}
}
// this one is used for the Vendors and the Jobs as it contains costs and a count of how many selected
class ResourceTypeCosted {
	constructor() {

		this.resourceTypeName = '';
		this.isMultipleDay = false;
		this.resourceElements = []; // array of elements
		this.resourceTags = [];
	}
	//creates the Resource Type Options for a select control. The elements combine the resource type and the element name and icon

	keyValues() {
		var resourceMap = new Map();

		for (var j = 0; j < this.resourceElements.length; j++) {

			resourceMap.set((this.resourceTypeName + '=' + this.resourceElements[j].elementName + '=' + this.resourceElements[j].icon), resourceTypeName + ' = ' + this.resourceElements[j].elementName);
		}


		return resourceMap;
	}


	getIcons() {
		icons = '';

		for (var j = 0; j < this.resourceElements.length; j++) {
			for (i = 0; i < this.resourceElements[j].elementCount; i++) {
				icons += `<i class="${ this.resourceElements[j].icon}"></i>`;
			}
		}

		return icons;
	}
}

class Element {
	constructor() {
		this.elementName = '';
		this.icon = '';
	}
}

class ElementCosts { // this is used as the element for the Vendor Resources as it has a cost type
	constructor() {
		this.elementName = '';
		this.icon = '';
		this.elementCost = 0.0;
		this.elementCount = 0;
	}
}


class Tag { // this is used to keep a track of the tags being used
	constructor() {

		this.tagName = '';
		this.resourceType = '';
		this.tag = '';
	}
}

class ResourceTag { // this is the tags  selected for the job
	constructor() {

		this.tagName = '';
		this.tags = [];
	}
}

//vendor data models
class Vendor {
	constructor() {

		this.vendorName = '';
		this.countries = []; //array of Vendor countries
	}

}

var emailAddress = function () {
	emailaddress: ''
}

class VendorCountry {
	constructor() {
		this.country = '';
		this.timezone = '';
		this.startDate = new Date();
		this.endDate = new Date();
		this.resources = {};
		this.defaultPickupLocation = '';
		this.projectName = '';
		this.timezone = '';
		this.vendorEmails = '';
		this.appleEmails = '';
	}

}

class AddOn {
	constructor() {
		this.flightInfo = '';
		this.hotelInfo = '';
		this.overnightSecurity = false;

	}

	icons() {
		icons = '';
		if (this.flightInfo != '') {
			icons += '<i class="fas fa-plane"></i>';
		}
		if (this.vendor != '') {
			icons += '<i class="fas fa-hotel"></i>';
		}
		if (this.overnightSecurity) {
			icons += '<i class="fas fa-moon"></i>';
		}
	}
}


class Job {
	constructor() {
		this._id;
		this.jobID = '';
		this.invoiceID = 'No';
		this.user = '';
		this.creator = '';
		this.isDraft = false;
		this.vendor = '';
		this.finalComments = '';
		this.creationEmailPending = true;
		this.cancelled = false
		this.recap = false;
		this.completed = false;
		this.isEdited = false;
		this.jobDetails = []; // array of job details containing info about each day of the job
		this.finalComments = '';
		this.vendorComments = [];
	}

}


class JobDetails {
	constructor() {
		this.jobDetailID = '';
		this.pickUpLocation = '';
		this.pickUpDateTime = '';
		this.dropoffDateTime = '';
		this.amendedDropoffTime = '';
		this.completed = false;
		this.country = '';
		this.bookingComments = '';
		this.resources = {}; // costed resource elements from vendor model
		this.addOns = {};
	}
}

class VendorComments {
	constructor() {

		this.jobID = '';
		this.comments = '';
		this.date = new Date();
		this.authorName = '';
		this.icon = '';
	}
}

class Invoice {
	constructor() {

		this.invoiceID = '';
		this.userID = '';
		this.date = new Date();
		this.cost = 0.0;
		this.jobs = [];
		this.invoiceComments = '';
	}
}