var vendorInput = new Vue({

	el: '#vendorInput',

	data() {
		return {
			vendor: {
				vendorName: '',
				countries: [], //array of Vendor countries
			},
			vendorCountry: {
				country: '',
				timezone: '',
				startDate: new Date(),
				endDate: new Date(),
				resources: {},
				defaultPickupLocation: '',
				projectName: '',
				vendorEmails: '',
				appleEmails: '',
			},
			resourceType: {
				resourceTypeName: '',
				isMultipleDay: false,
				resourceElements: [], // array of elements
			},
			elements: {
				elementName: '',
				icon: '',
				elementCost: 0.0,
				elementCount: 0,
			},
			showVendorModal: false,
			isEditing: false,
			countries: null, // list of countries
			resourceTypes: null, // list of resource Types
			countryTimezonePairs: [],
			resourceElementOptions: [],
			selectedCountry: '', //selected country
			countrySection: 0, // for accordian view showing countries in input
			resourceTypeSelected: '',
		}
	},
	methods: {

		showModal() {
			this.showVendorModal = true
			this.vendor.countries.push(JSON.parse(JSON.stringify(this.vendorCountry)));
			this.vendor.countries[0].resources = JSON.parse(JSON.stringify(this.resourceType));
			this.vendor.countries[0].resources.resourceElements.push(JSON.parse(JSON.stringify(this.elements)));
		},
		closeModal() {
			this.showVendorModal = false;
			this.vendor.countries = [];
			this.vendor.vendorName = '';
			this.selectedCountry = '';
			this.resourceTypeSelected = '';
		},
		editVendor(vendor) {
			this.isEditing = true;
			this.vendor = vendor;
			this.showVendorModal = true
		},
		addCountry() {
			this.selectedCountry = '';
			var countryCount = this.vendor.countries.length;
			this.vendor.countries.push(JSON.parse(JSON.stringify(this.vendorCountry)));
			this.vendor.countries[countryCount].resources = JSON.parse(JSON.stringify(this.resourceType));
			this.vendor.countries[countryCount].resources.resourceElements.push(JSON.parse(JSON.stringify(this.elements)));
			this.countrySection++;
		},
		removeCountry(index) {
			this.vendor.countries.splice(index, 1);
		},
		getCountries() {
			axios.get("/countries")
				.then(response => {
					this.countries = response.data
					this.createCountryTimezoneItems();
				}).catch(function (err) {
					console.log(err);
				})
		},
		// auto complete countries
		autoCompleteCountries(queryString, cb) {
			var countries = this.countryTimezonePairs;
			var results = queryString ? countries.filter((country, index, array) => {
				return (queryString.toUpperCase() === country.country.substr(0, queryString.length).toUpperCase());
			}) : countries;
			// call callback function to return suggestions


			cb(results);

		},
		createCountryTimezoneItems() {

			for (var i = 0; i < this.countries.length; i++) {
				this.countryTimezonePairs.push({
					'country': this.countries[i].country + ':' + this.countries[i].timezone
				});
			}

		},

		addResource(index) {
			this.vendor.countries[0].resources.resourceElements.push(JSON.parse(JSON.stringify(this.elements)));
		},
		removeResource(index, el) {
			this.vendor.countries[index].resources.resourceElements.split(el, 1);
		},
		resourceChanged(index) {
			var resourceType = this.resourceTypes.filter(resource => resource.resourceTypeName == this.vendor.countries[index].resources.resourceTypeName)[0];
			this.resourceElementOptions = resourceType.resourceElements;
		},
		elementChanged(index, el) {
			var resource = this.resourceTypes.filter(resource => resource.resourceTypeName == this.vendor.countries[index].resources.resourceTypeName)[0];
			var element = resource.resourceElements.filter(element => element.elementName == this.vendor.countries[index].resources.resourceElements[el].elementName)[0];
			this.vendor.countries[index].resources.resourceElements[el].icon = element.icon;
		},
		changedCountry(index) {
			this.vendor.countries[index].country = this.selectedCountry.split(':')[0];
			this.vendor.countries[index].timezone = this.selectedCountry.split(':')[1];

		},
		getResourceTypes() {
			axios.get("/resourceTypes")
				.then(response => {
					this.resourceTypes = response.data

				}).catch(function (err) {
					console.log(err);
				});
		},
		saveVendor() {
			if (this.isEditing) {
				axios.put("/vendors/" + this.vendor._id, this.vendor)
					.then(response => {
						vendorTable.loadTable();
						this.closeModal();
						this.isEditing = false;
					}).catch(function (err) {
						console.log(err);
					})
			} else {
				axios.post("/vendors", this.vendor)
					.then(response => {
						vendorTable.loadTable();
						this.closeModal();
					}).catch(function (err) {
						console.log(err);
					})
			}
		},
	},
	mounted() {
		this.getCountries();
		this.getResourceTypes();
	}

})



var vendorsTable = new Vue({

	el: '#VendorTable',

	data() {
		return {
			vendors: null,
			vendorSection: 0, // needed to determine which vendor section to show.
		}
	},
	methods: {
		getVendors() {
			axios.get("/vendors")
				.then(response => {
					this.vendors = response.data

				}).catch(function (err) {
					console.log(err);
				})
		},
		editVendor(vendor) {
			vendorInput.editVendor(vendor);
		},
		deleteVendor(vendor) {
			axios.delete("/vendors/" + vendor._id)
				.then(response => {
					this.getVendors();

				}).catch(function (err) {
					console.log(err);
				})
		},
		formatDate(date) {
			return moment(date).format("YYYY-MM-DD");
		},
	},
	mounted() {
		this.getVendors();
	}

})