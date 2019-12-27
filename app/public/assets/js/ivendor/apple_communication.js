var appleCommunication = new Vue({

	el: "#appleCommunication",
	data() {
		return {
			job: null,
			vendorComment: { // this is the comments for two way comms with the vendor
				comments: '',
				date: new Date(),
				authorName: '',
				icon: '<i class="fas fa-building"></i>'
			},
		}
	},
	methods: {
		getJob(job) {
			this.job = job;
			this.vendorComment.authorName = currentUser.user.full_name;
		},
		saveComments() {

			this.job.vendorComments.push(this.vendorComment);
			axios.put('/jobs/' + id, this.job).then(response => {
				this.getJob();
			}).catch(function (err) {
				console.log(err);
			})

		},
		formatDate(date) {
			return moment(date).format("YYYY-MM-DD");
		},
		getQueryVariable(variable) {
			var query = window.location.search.substring(1);
			var vars = query.split("&");
			for (var i = 0; i < vars.length; i++) {
				var pair = vars[i].split("=");
				if (pair[0] == variable) {
					return pair[1];
				}
			}
			return (false);
		},

	},
	mounted() {
		this.getJob();
	}
});