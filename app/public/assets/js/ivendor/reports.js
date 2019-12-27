var app = new Vue({
    el: "#charts",
    data() {
        return {
            jobsByDay: [],
            jobsByMonth: [],
            jobsByStatus: [],
            jobsByCountry: [],
            jobsByInvoiceStatus: [],
            jobsByVendor: [],
            jobsByEngineer: [],
            invoiceTotals: [],
            months: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sept', 'Oct', 'Nov', 'Dec']
        }
    },
    methods: {
        getJobsByDay() {
            axios.get('/reports/jobsByDay').then(response => {

                var results = response.data;
                for (var i = 0; i < results.length; i++) {
                    this.jobsByDay.push([moment(results[i]._id.date).format("YYYY-MM-DD"), results[i].count])
                }


            }).catch(function (err) {
                console.log(err);
            });

        },
        getJobsByMonth() {
            axios.get('/reports/jobsByMonth').then(response => {

                var results = response.data;
                for (var i = 0; i < results.length; i++) {
                    this.jobsByMonth.push([this.months[results[i]._id.month - 1], results[i].count])
                }


            }).catch(function (err) {
                console.log(err);
            });

        },
        getJobsByStatus() {
            axios.get('/reports/jobsByStatus').then(response => {

                var results = response.data;
                for (var i = 0; i < results.length; i++) {
                    this.jobsByStatus.push([results[i]._id.status, results[i].count])
                }


            }).catch(function (err) {
                console.log(err);
            });
        },
        getJobsByCountry() {
            axios.get('/reports/jobsByCountry').then(response => {

                var results = response.data;
                for (var i = 0; i < results.length; i++) {
                    this.jobsByCountry.push([results[i]._id.country.split(':')[0], results[i].count]);
                }


            }).catch(function (err) {
                console.log(err);
            });
        },
        getJobsByInvoiceStatus() {
            axios.get('/reports/jobsByInvoiceStatus').then(response => {

                var results = response.data;
                for (var i = 0; i < results.length; i++) {
                    this.jobsByInvoiceStatus.push([results[i]._id.status, results[i].count]);
                }


            }).catch(function (err) {
                console.log(err);
            });
        },
        getJobsByVendor() {
            axios.get('/reports/jobsByVendor').then(response => {

                var results = response.data;
                for (var i = 0; i < results.length; i++) {
                    this.jobsByVendor.push([results[i]._id.vendor, results[i].count]);
                }


            }).catch(function (err) {
                console.log(err);
            });
        },
        getJobsByEngineer() {
            axios.get('/reports/jobsByEngineer').then(response => {

                var results = response.data;
                for (var i = 0; i < results.length; i++) {
                    this.jobsByEngineer.push([results[i]._id.engineer, results[i].count]);
                }


            }).catch(function (err) {
                console.log(err);
            });
        },
        getInvoiceTotals() {
            axios.get('/reports/InvoiceTotals').then(response => {

                var results = response.data;
                for (var i = 0; i < results.length; i++) {
                    console.log(results[i]);
                    this.invoiceTotals.push([this.months[results[i]._id.month - 1], results[i].cost]);
                }


            }).catch(function (err) {
                console.log(err);
            });
        },
        applyFilter() {

        },

    },
    mounted() {
        this.getJobsByDay();
        this.getJobsByMonth();
        this.getJobsByStatus();
        this.getJobsByCountry();
        this.getJobsByInvoiceStatus();
        this.getJobsByVendor();
        this.getJobsByEngineer();
        this.getInvoiceTotals();

    }
})