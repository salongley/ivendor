//Code related to adding, removing, and displaying Country data

var countryApp = new Vue({
	el: "#countryInput",
	data: {
		country: {
			country: '',
			timezone: '',
			gmtOffset:'',
			region: ''
		},
		editing: false,
		alertMessage : ""
	},
	methods: {
		showModal : function(){
			$('#countryInputModal').modal('show')
		},
		closeModal : function(){
			$('#countryInputModal').modal('hide');
			this.country = {
					country: '',
					timezone: '',
					gmtOffset:'',
					region: ''
				}
				this.editing = false;
		},
		addCountry : function(){
			if(this.editing){
				axios.put('/countries/'+ this.country._id ,  this.country )
				.then(function (response) {
					// handle success
					this.countryApp.editing = false;
					this.countryApp.closeModal();
					this.countryTableVue.loadTable();
				})
				.catch(function (error) {
					// handle error
					console.log(error);
				})
				
				
			} else {
				axios.post('/countries', {data: JSON.stringify(this.country)})
				.then(function (response) {
					// handle success
					this.countryApp.closeModal();
					this.countryTableVue.loadTable();
				})
				.catch(function (error) {
					// handle error
					console.log(error);
				})

			}

		}

	}
});


var countryTableVue = new Vue({
	el: "#countryTable",
	data() { return {
		countries: null,
		alertMessage : ""
	}
	},
	methods: {
			loadTable: function(){
				axios.get("/countries")
				.then (function (response) {
					this.countryTableVue.countries = response.data;

				})
				.catch(function (error){

					console.log(error);
				});
			},

			editCountry(country){
				axios.get("/countries/"+country)
				.then (function (response) {
					
					this.countryApp.country = response.data;
					this.countryApp.editing = true;
					this.countryApp.showModal();
					
				})
				.catch(function (error){

					console.log(error);
				});
				}, 
			deleteCountry(country){
				axios.delete("/countries/"+country)
				.then (function (response) {
					this.countryTableVue.loadTable();	
				})
				.catch(function (error){

					console.log(error);
				});
			}
		}, 
	

	mounted(){
		this.loadTable();
	}

			
});
			