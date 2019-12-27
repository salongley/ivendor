// comma key code that is used to trigger when comma separated jobs are entered
Vue.config.keyCodes.comma = 188;



// this vue element deals with showing the Input form and data binding with the model
var invoicesApp = new Vue({
	el: "#invoicesInput",
	data: {
		invoice: {
			invoiceID: '',
			userID: '',
			date: new Date(),
			cost: 0.0,
			jobs: [],
			invoiceComments: ''
		},
		editing: false,
		alertMessage: "",
		searchedJobs: [],
		jobID: '',
		jobToBeCompleted: {},
		toggledisplay: false,
		currentEngineer: null
	},
	methods: {
		showModal: function () {
			$('#invoicesInputModal').modal('show');

			$('[data-toggle="tooltip"]').tooltip();
		},

		closeModal: function () {
			$('#invoicesInputModal').modal('hide');
			this.invoice = {
				invoiceID: '',
				userID: '',
				date: new Date(),
				cost: 0.0,
				jobs: [],
				invoiceComments: ''
			}
			this.editing = false;
		},
		toggle_display: function () {
			this.toggledisplay = !this.toggledisplay;
		},

		addInvoice: function () {

			this.invoice.jobs = this.searchedJobs;


			for (var i = 0; i < this.searchedJobs.length; i++) {
				if (this.searchedJobs[i].completed == false) {
					$('#invoicesInputModalAlert').collapse('show');
					$('#invoicesInputModalAlert > span').html("All jobs need to be confirmed as complete before the invoice can be submitted!");
					return;
				}
			}

			if (this.invoice.invoiceID == '' || this.invoice.cost == 0.0 || this.invoice.jobs.length == 0 || this.invoice.invoiceComments == '') {
				$('#invoicesInputModalAlert').collapse('show');
				$('#invoicesInputModalAlert > span').html("All fields need to be completed before the invoice can be submitted!");
				return;
			}

			for (var i = 0; i < this.searchedJobs.length; i++) {
				this.searchedJobs[i].invoiceID = this.invoice.invoiceID;
			}


			if (this.editing) {
				axios.put('/invoices/' + this.invoice._id, this.invoice)
					.then(function (response) {
						// handle success
						this.invoicesApp.invoicesApp.editing = false;
						this.invoicesApp.invoicesApp.closeModal();
						this.invoicesTableVue.loadTable();
					})
					.catch(function (error) {
						// handle error
						console.log(error);
					})


			} else {

				axios.post('/invoices', this.invoice)
					.then(function (response) {
						// handle success
						this.invoicesApp.closeModal();
						this.invoicesTableVue.loadTable();
					})
					.catch(function (error) {
						// handle error
						console.log(error);
					})

			}
			// update jobs to show invoice number
			for (var i = 0; i < this.searchedJobs.length; i++) {
				this.searchedJobs[i].invoiceID = this.invoice.invoiceID;
				axios.put('/jobs/' + this.searchedJobs[i]._id, this.searchedJobs[i])
					.then(function (response) {
						// handle success
						return;
					})
					.catch(function (error) {
						// handle error
						console.log(error);
					})
			}
		},
		// search for job id entered and add to selected list
		addSearchedJob: function () {
			if (this.jobID.length >= 4) {

				axios.get('/jobs/jobsInvoice/' + this.jobID)
					.then(function (response) {

						this.invoicesApp.searchedJobs = response.data;

					})
					.catch(function (error) {
						// handle error
						console.log(error);
					});
			}
		},

		// removes a job from selected list
		removeJobFromSearchedJobs(index) {
			this.searchedJobs.splice(index, 1);
			var jobs = this.jobID.split(",");
			jobs.splice(index, 1);
			jobs.sort();
			this.jobID = jobs.join();
		},
		// shows job complete form for incomplete job to allow confirm
		completeJobFromSearchedJobs(index) {
			axios.get('/jobs/' + this.searchedJobs[index]._id)
				.then(response => {

					jobComplete.updateJobData(response.data);


				})
				.catch(function (error) {
					// handle error
					console.log(error);
				});
		},
		sendEmail: function () {
			sendEmailIncompleteJobs.showEmailForm(this.searchedJobs);

		},
		setCurrentUser() {
			this.currentEngineer = currentUser.user;
			this.invoice.userID = currentUser.user.full_name;
		}

	}
});

// this vue element deals with displaying the table and passing edit and delete messages to the Invoices App
var invoicesTableVue = new Vue({
	el: "#invoiceTable",
	data() {
		return {
			invoices: null,
			alertMessage: ""
		}

	},
	methods: {
		loadTable: function () {
			axios.get("/invoices")
				.then(function (response) {
					this.invoicesTableVue.invoices = response.data;

				})
				.catch(function (error) {

					console.log(error);
				});
		},
		editInvoice(_id) {
			axios.get("/invoices/" + invoiceNo)
				.then(function (response) {

					this.invoicesApp.invoice = response.data;
					this.invoicesApp.editing = true;
					this.invoicesApp.showModal();

				})
				.catch(function (error) {

					console.log(error);
				});
		},
		deleteInvoice(_id) {
			axios.delete("/invoices/" + _id)
				.then(function (response) {

				})
				.catch(function (error) {

					console.log(error);
				});
		},
		showInvoiceSummary(element) {
			$('#summary' + element).collapse('toggle')
		},
		formatDate(date) {
			return moment(date, 'YYYY-MM-DD').format('MMM-DD');
		},
		formatDateYear(date) {
			return moment(date, 'YYYY-MM-DD').format('MMM-DD YYYY');
		},

	},
	mounted() {
		this.loadTable();
	}
});


var sendEmailIncompleteJobs = new Vue({
	el: "#emailIncompleteJobFromInvoice",
	data() {
		return {
			emailData: null
		}
	},
	methods: {
		sendEmail: function () {

			axios.post("/mail/reminder", this.emailData)
				.then(function (response) {
					//send a reminder email.
					console.log(response);
					$('#emailIncompleteJobFromInvoice').modal("hide");
					this.emailData = null;
				})
				.catch(function (error) {

					console.log(error);
				});

		},

		showEmailForm(jobs) {
			// go through the list of jobs selected and collect the ids of those that are incomplete
			myemailData = [];

			for (var i = 0; i < jobs.length; i++)
				if (jobs[i].completed == false) {

					myemailData.push({
						emailTo: 'test@apple.com', //jobs[i].usersEmails,
						emailCC: '',
						comments: 'These jobs are incomplete. We have received an invoice for these jobs but they need to marked as complete, with comments before it can be paid. Please mark the jobs as complete.',
						jobID: jobs[i].jobID
					});
					this.emailData = myemailData;
					$('#emailIncompleteJobFromInvoice').modal("show");

				}
		},
		closeModal() {
			$('#emailIncompleteJobFromInvoice').modal("hide");
		},

	},

});