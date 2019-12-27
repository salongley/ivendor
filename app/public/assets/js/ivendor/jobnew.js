/*
 * This section deals with creating and interacting with the Jobs Input form
 *
 *
 *
 */



var jobsInput = new Vue({
    el: '#jobsInputModal',
    data() {
        return {
            job: { //This is the base Job Object
                _id: null,
                jobID: '',
                invoiceID: 'No',
                users: [],
                creator: '',
                isDraft: true,
                status: 'draft',
                sendRecap: false,
                vendor: '',
                finalComments: '',
                emailSent: false,
                cancelled: false,
                completed: false,
                isEdited: false,
                jobDetails: [], // array of job details containing info about each day of the job
                finalComments: '',
                vendorComments: [],
                appleEmails: '',
                vendorEmails: ''
            },
            jobDetail: { // This is a single day Job Detail used by security
                jobDetailID: '',
                pickUpLocation: '',
                Date: '',
                pickUpTime: '10:00',
                dropOffTime: '20:00',
                amendedDropoffTime: '',
                completed: false,
                country: '',
                bookingComments: '',
                resources: {}, // costed resource elements from vendor model
                addOns: {}
            },

            jobDetailMulipleDay: { // this is a Multiday Job used by Engineering
                jobDetailID: '',
                pickUpLocation: '',
                Date: '',
                endDate: '',
                completed: false,
                country: '',
                bookingComments: '',
                resources: {}, // costed resource elements from vendor model
                addOns: {}
            },
            vendorComment: { // this is the comments for two way comms with the vendor
                comments: '',
                date: new Date(),
                authorName: '',
                icon: ''
            },
            addOn: { // addons
                flightInfo: '',
                hotelInfo: '',
                overnightSecurity: false
            },
            resourceTypeCosted: { //This is the type of resource booked for the day
                resourceTypeName: '',
                isMultipleDay: false,
                resourceElements: [], // array of elements
                resourceTags: []
            },
            element: { // resources can have more than one element
                elementName: '',
                icon: '',
                elementCost: 0.0,
                elementCount: 0
            },
            tags: {
                tagName: '',
                tag: ''
            },
            newJobTemplate: { // blank job template to make a new black job when resetting
                _id: null,
                jobID: '',
                invoiceID: 'No',
                users: [],
                creator: '',
                status: 'draft',
                isDraft: true,
                sendRecap: false,
                vendor: '',
                finalComments: '',
                emailSent: false,
                cancelled: false,
                completed: false,
                isEdited: false,
                jobDetails: [], // array of job details containing info about each day of the job
                finalComments: '',
                vendorComments: [],
                appleEmails: '',
                vendorEmails: ''
            },
            users: [], // for selecting users
            countries: [], // stores all the countries
            vendors: [], // stores all the related to the job
            resourceTypes: [], // stores all resource types
            editing: false, // if the job is an edit of a previous job
            preview: false, // is the form in preview mode
            isMultipleDay: false, // is the resource type multi day. Determines which Job detail template to use
            OneToTen: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10], // for selects
            selectedResourceType: '', //value in the select
            selectedCountry: '', //value in the select
            selectedVendor: '', //value in the select
            currentResourceType: null, //all values of the chosen resourceType
            currentVendor: null, //all values of the chosen vendor
            vendorDisabled: true, //
            showFlights: false,
            showHotels: false,
            showOvernight: false,
            selectedUser: '',
            oldJob: null, // needed to store old job when editing so email can highligh changes when sent
            countryTimezonePairs: [],
            JobDay: 0, // section for modal view
            showAddons: false,
            JobsModalShow: false,
            currentEngineer: null, // loads details of who is logged in
        }

    },
    methods: {
        showModal: function () {
            this.JobsModalShow = true;
            //this.job = JSON.parse(JSON.stringify(this.newJobTemplate));
        },
        closeModal: function () {
            //closes for and resets it
            this.preview = false;
            this.JobsModalShow = false;
            this.jobDetailTemplate = this.jobDetail,
                this.resourceTemplate = this.resourceTypeCosted,
                this.job = JSON.parse(JSON.stringify(this.newJobTemplate));
            this.job.users.push(this.currentEngineer);
            this.selectedResourceType = '', //value in the select
                this.selectedCountry = '', //value in the select
                this.selectedVendor = '';
            this.selectedUser = '';
            JobTable.loadTable();
        },
        newJob: function () {
            this.JobsModalShow = true;

        },
        togglePreview: function () {
            //toggles preview to see summary
            this.preview = !this.preview;
            this.JobDay = -1;

        },
        addDay: function () {
            // adds a nother jobDetail to the job and copies data from previous one
            var newJobDetail = JSON.parse(JSON.stringify(this.jobDetail));
            this.job.jobDetails.push(newJobDetail);
            var nOfDays = this.job.jobDetails.length - 1;
            this.job.jobDetails[nOfDays].country = this.selectedCountry;
            this.job.jobDetails[nOfDays].resources = JSON.parse(JSON.stringify(this.job.jobDetails[nOfDays - 1].resources));
            this.job.jobDetails[nOfDays].addOns = JSON.parse(JSON.stringify(this.job.jobDetails[nOfDays - 1].addOns));

            this.job.jobDetails[nOfDays].Date = moment(this.job.jobDetails[nOfDays - 1].Date).add(1, "d");
            this.job.jobDetails[nOfDays].pickUpTime = this.job.jobDetails[nOfDays - 1].pickUpTime;
            this.job.jobDetails[nOfDays].dropOffTime = this.job.jobDetails[nOfDays - 1].dropOffTime;
            this.JobDay++;
        },
        //removes day
        removeDay(day) {
            if (this.job.jobDetails.length > 1) {
                this.job.jobDetails.splice(day, 1);
            }

        },
        /// gets users list
        getUsers: function () {
            var UserData = [];
            axios.get("/users/")
                .then(response => {
                    this.users = response.data;
                })
                .catch(function (error) {

                    console.log(error);
                });
        },
        // gets countries from DB
        getCountries: function () {
            var countryData = [];
            axios.get("/countries")
                .then(response => {

                    this.countries = response.data;
                    this.createCountryTimezoneItems(); // creates country time zone pairs as some big countries have multiple timezones
                })
                .catch(function (error) {

                    console.log(error);
                });
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
        // provides auto complete data for the text entry
        autoCompleteUsers(queryString, cb) {
            var users = this.users;
            var results = queryString ? users.filter((user, index, array) => {
                return (queryString.toUpperCase() === user.full_name.substr(0, queryString.length).toUpperCase());
            }) : users;
            // call callback function to return suggestions

            cb(results);

        },
        // when a user is selected it s added to the list of engineers
        selectedEngineer() {
            var userDetails = this.users.filter((user, index, array) => {
                return (this.selectedUser === user.full_name.substr(0, this.selectedUser.length));
            })

            this.job.users.push(userDetails[0]);
            this.selectedUser = '';
        },


        // allows removal of selected engineer
        removeUser(index) {
            this.job.users.splice(index, 1);
        },

        //gets resource types for select
        getResourceTypes: function () {
            var resourceData = [];
            axios.get("/resourceTypes")
                .then(response => {
                    this.resourceTypes = response.data;

                })
                .catch(function (error) {

                    console.log(error);
                });
        },

        changedResourceType() {

            if (this.selectedResourceType != '' && this.selectedCountry != '') {
                this.getVendors();
                this.vendorDisabled = false;


            } else {
                this.vendorDisabled = true;
            }
        },
        formatDate(date) {
            return moment(date, 'YYYY-MM-DD').format('MMM-DD');
        },
        changedCountry() {

            if (this.selectedResourceType != '' && this.selectedCountry != '') {
                this.getVendors();
                this.vendorDisabled = false;
            } else {
                this.vendorDisabled = true;
            }
        },
        // when vendor is selected then the type of resources offered in the selected country are stored
        // This is used to add the appropriate JobDetail type to the job along with the correct job elements
        setVendor: function () {
            var defaultLocation;
            if (this.selectedVendor != '') {
                axios.get("/vendors/" + this.selectedVendor)
                    .then(response => {
                        this.currentVendor = response.data;

                        this.job.vendor = this.selectedVendor;
                        for (var i = 0; i < this.currentVendor.countries.length; i++) {
                            if (this.currentVendor.countries[i].country == this.selectedCountry.split(":")[0]) {
                                defaultLocation = this.currentVendor.countries[i].defaultPickupLocation;
                                this.currentResourceType = JSON.parse(JSON.stringify(this.currentVendor.countries[i].resources));
                                this.job.appleEmails = this.currentVendor.countries[i].appleEmails;
                                this.job.vendorEmails = this.currentVendor.countries[i].vendorEmails;
                            }
                        }
                        if (this.currentResourceType.isMultipleDay) {
                            this.job.jobDetails.push(this.jobDetailMulipleDay);
                        } else {
                            this.job.jobDetails.push(this.jobDetail);
                        }
                        this.isMultipleDay = this.currentResourceType.isMultipleDay;

                        this.job.jobDetails[0].country = this.selectedCountry;
                        this.job.jobDetails[0].pickUpLocation = defaultLocation;
                        this.job.jobDetails[this.job.jobDetails.length - 1].resources = this.currentResourceType;
                        this.job.jobDetails[this.job.jobDetails.length - 1].addOns = this.addOn;


                    })
                    .catch(function (error) {

                        console.log(error);
                    });
            }
        },
        /// gets list of vendors based on country and resource chosen
        getVendors: function () {
            var country = this.selectedCountry.split(':')[0];
            var resourceType = this.selectedResourceType;
            if (country != '' && resourceType != '') {

                axios.get('/vendors/' + country + '/' + resourceType)
                    .then(response => {
                        this.vendors = response.data;

                    })
                    .catch(function (error) {

                        console.log(error);
                    });
            }

        },
        setAmendedDropOffTimeDefault(day) {
            if (this.isMultipleDay) {
                this.job.jobDetails[day].amendedDropoffTime = this.job.jobDetails[day].dropOffTime;
            }

        },

        estimatedTotalCost() {
            var totalCost = 0.0;
            for (var i = 0; i < this.job.jobDetails.length; i++) {
                for (var j = 0; j < this.job.jobDetails[i].resources.resourceElements.length; j++) {
                    totalCost = totalCost + (parseInt(this.job.jobDetails[i].resources.resourceElements.elementCost) * parseInt(this.job.jobDetails[i].resources.resourceElements.elementCount));
                }
            }
            return totalCost;
        },
        saveAndSend() {
            // sends a new or updated job

            for (var i = 0; i < this.job.users.length; i++) {
                this.job.appleEmails = this.job.appleEmails + "," + this.job.users[i].email;
            }
            this.job.status = "live";
            this.job.emailSent = true;
            if (this.editing) {
                axios.put("/jobs/" + this.job._id, this.job)
                    .then(response => {
                        this.mailJob(response.data, "update", this.job.appleEmails, this.job.vendorEmails);
                        this.preview = false;
                        this.job = JSON.parse(JSON.stringify(this.newJobTemplate));
                        this.editing = false;
                        this.closeModal();
                        JobTable.loadTable();

                    }).catch(function (error) {

                        console.log(error);
                    });
            } else {
                axios.post("/jobs", this.job)
                    .then(response => {
                        this.mailJob(response.data, "new", this.job.appleEmails, this.job.vendorEmails);
                        this.preview = false;
                        this.job = JSON.parse(JSON.stringify(this.newJobTemplate));
                        this.editing = false;
                        this.closeModal();
                        JobTable.loadTable();

                    }).catch(function (error) {

                        console.log(error);
                    });
            }

        }, // save as draft, either new or editing a draft
        saveAsDraft() {
            if (this.editing) {
                axios.put("/jobs/" + this.job._id, this.job)
                    .then(response => {

                        this.preview = false;
                        this.job = JSON.parse(JSON.stringify(this.newJobTemplate));
                        this.editing = false;
                        this.closeModal();
                        JobTable.loadTable();

                    }).catch(function (error) {

                        console.log(error);
                    });
            } else {
                axios.post("/jobs", this.job)
                    .then(response => {
                        this.job.status = "draft";
                        this.editing = false;
                        this.preview = false;
                        this.job = JSON.parse(JSON.stringify(this.newJobTemplate));
                        this.closeModal();
                        JobTable.loadTable();

                    }).catch(function (error) {

                        console.log(error);
                    });

            }

        },
        // mails the job
        mailJob(job_id, type, jobappleEmails, jobvendorEmails) {

            var emailData = {
                "appleEmails": jobappleEmails,
                "vendorEmails": jobvendorEmails,
                "oldJob": this.oldJob // needed if edited a sent job
            };

            axios.post(`/mail/${job_id}/${type}`, emailData)
                .then(response => {
                    JobTable.loadTable();

                }).catch(function (error) {

                    console.log(error);
                });

        },
        // loads the job and associated data needed into the editor
        importJobForEdit(job) {
            this.oldJob = job
            this.editing = true;
            this.selectedResourceType = job.jobDetails[0].resources.resourceTypeName;
            this.selectedCountry = job.jobDetails[0].country;
            this.getVendors();
            this.selectedVendor = job.vendor;

            axios.get("/vendors/" + this.selectedVendor)
                .then(response => {
                    this.currentVendor = response.data;

                    for (var i = 0; i < this.currentVendor.countries.length; i++) {
                        if (this.currentVendor.countries[i].country == this.selectedCountry.split(":")[0]) {
                            this.currentResourceType = JSON.parse(JSON.stringify(this.currentVendor.countries[i].resources));
                        }
                    }

                    this.job = job;

                })
                .catch(function (error) {

                    console.log(error);
                });

            this.showModal();
        }, // copies job, deletes IDs and loads it into the editor
        importJobForDuplicate(job) {
            job.jobID = '';
            job._id = null;
            this.selectedResourceType = job.jobDetails[0].resources.resourceTypeName;
            this.selectedCountry = job.jobDetails[0].country;
            this.getVendors();
            this.selectedVendor = job.vendor;
            for (var i = 0; i < job.jobDetails.length; i++) {
                job.jobDetails[i].jobDetailID = "";
            }
            axios.get("/vendors/" + this.selectedVendor)
                .then(response => {
                    this.currentVendor = response.data;

                    for (var i = 0; i < this.currentVendor.countries.length; i++) {
                        if (this.currentVendor.countries[i].country == this.selectedCountry.split(":")[0]) {
                            this.currentResourceType = JSON.parse(JSON.stringify(this.currentVendor.countries[i].resources));
                        }
                    }

                    this.job = job;

                })
                .catch(function (error) {

                    console.log(error);
                });

            this.showModal();
        },
        setCurrentUser() {
            if (currentUser.user != null) {
                this.currentEngineer = currentUser.user;
                this.job.users = [this.currentEngineer];
                this.job.creator = this.currentEngineer;
            }

        }

    },
    mounted() {
        this.getResourceTypes();
        this.getVendors();
        this.getCountries();
        this.getUsers();

    }


});

/*
 * This section deals with creating and interacting with the Jobs Table
 *
 *
 *
 */



var JobTable = new Vue({
    el: '#jobsTable',
    data() {
        return {
            jobsData: null,
            paginatorPosition: 0,
            pageStep: 25,
            totalJobs: 0,
            showDeleteCancelConfirm: false, // dialog box for delete or cancel confirm
            jobForDelete: null,
            showDraftCancelConfirm: false, // show dialog to confirm draft job being made live and emails being sent
            jobForDraftRemoval: null,
            currentEngineer: null,
        }
    },
    methods: {
        //gets current users jobs and their proxies
        getMyJobs() {
            axios.get("/jobs/userjobs/" + this.currentEngineer.dsid)
                .then(response => {

                    this.jobsData = response.data;

                }).catch(function (error) {

                    console.log(error);
                });

        },
        //loads all jobs
        loadAllJobs() {
            var skip = this.paginatorPosition * this.pageStep;
            axios.get("/jobs/jobsPaging/" + skip + "/" + this.pageStep)
                .then(response => {
                    this.jobsData = response.data;

                })
                .catch(function (error) {

                    console.log(error);
                });
        },
        // determines which jobdata to load
        loadTable: function () {
            if (this.currentEngineer.role == 2) {
                this.loadAllJobs();
            } else {
                this.getMyJobs;
            }

        },
        //determines if a job is overdue
        overdue(job) {
            return new Date() > moment(job.jobDetails[job.jobDetails.length - 1].Date, "YYYY-MM-DD").endOf('day');

        },
        //calculated the job start date
        jobStartDate(job) {

            return moment(job.jobDetails[0].Date, 'YYYY-MM-DD').format('MMM-DD');


        },
        // used for giving the table rows the correct colours
        tableRowClassName({
            row,
            rowIndex
        }) {
            if (row.status == 'overdue') {
                return 'overdue-row';
            } else if (row.status == 'completed') {
                return 'completed-row';
            } else if (row.status == 'draft') {
                return 'draft-row'
            }
            return 'live-row';
        },

        //works out
        jobEndDate(job) {
            if (this.isMultipleDay) {
                return job.jobDetails[0].Date;
            } else {
                return moment(job.jobDetails[job.jobDetails.length - 1].Date, 'YYYY-MM-DD').format('MMM-DD');
            }


        },
        // works out when job starts
        relativeDate(job) {
            return moment(job.jobDetails[0].Date, 'YYYY-MM-DD').endOf('day').fromNow();
        },
        // week of the year
        jobWeek(date) {
            return moment(date, 'YYYY-MM-DD').format('ww');
        },

        jobDate(job) {
            return moment(job.jobDetails[0].Date, 'YYYY-MM-DD').format('MMM-DD');
        },
        // cost of job
        jobCost(job) {
            var cost = 0;
            job.jobDetails.forEach((jobDetail) => {
                jobDetail.resources.resourceElements.forEach((resourceElement) => {
                    cost = cost + resourceElement.elementCost;
                });
            });
            return cost;
        },
        // determines if it was vendor or apple who added last comment
        whoAddedLastComment(job) {
            if (job.vendorComments[job.vendorComments.length - 1].icon == '<i class="fab fa-apple"></i>') {
                return 'apple';
            } else {
                return 'vendor';
            }

        },
        //shows Add comment form
        addComment(job) {
            $("#mainCountry").collapse("hide");
            $("#mainResourceType").collapse("hide");
            $("#mainUsers").collapse("hide");
            $("#mainJobs").collapse("hide");
            $("#mainInvoices").collapse("hide");
            $("#mainReports").collapse("hide");
            $("#mainVendors").collapse("hide");
            $("#appleCommunicationPage").collapse("show");

            appleCommunication.getJob(job);
        },
        // takes 
        toggle_draft(job) {
            // this needs to send out emails when unchecked draft. confirms first
            this.jobForDraftRemoval = job;
            this.showDraftCancelConfirm = true;

            this.loadTable();
        },
        // incase they cancel at the confirm form
        cancelRemoveDraft() {
            this.jobForDraftRemoval = null;
            this.showDraftCancelConfirm = false;
            this.loadTable();
        },

        //sends a previously draft job
        makeDraftLive() {
            this.jobForDraftRemoval.status = "live";
            axios.put("/jobs/" + this.jobForDraftRemoval._id, this.jobForDraftRemoval)
                .then(response => {
                    this.mailJob(this.jobForDraftRemoval._id, "new", this.jobForDraftRemoval.appleEmails, this.jobForDraftRemoval.vendorEmails);
                    this.loadTable();
                    this.showDraftCancelConfirm = false;
                }).catch(function (err) {
                    console.log(err);
                });


        },
        // send jobs for recap processing
        sendRecap() {
            var recapJobs = [];
            for (var i = 0; i < this.jobsData.length; i++) {
                if (this.jobsData[i].sendRecap) {
                    recapJobs.push(this.jobsData[i]);
                }
            }
            if (recapJobs.length > 0) {
                recapEmail.createRecap(recapJobs);
            }
        },

        removeRecap() {
            for (var i = 0; i < this.jobsData.length; i++) {
                this.jobsData[i].sendRecap = false;


            }
        },
        // sends a job to be completed
        completeJob(job) {
            jobComplete.updateJobData(job);
            this.loadTable();
        },
        // shows form to delete job.
        confirmDelete(job) {
            this.showDeleteCancelConfirm = true;
            this.jobForDelete = job;
        },

        // cancels delete in cofirmaion
        cancelDelete() {
            this.jobForDelete = null;
            this.showDeleteCancelConfirm = false;
        },
        //actually deletes job
        deleteJob() {
            this.showDeleteCancelConfirm = false;
            // if is a draft and an email hasn't beem semt then delete
            if (this.jobForDelete.status == "draft") {
                axios.delete('/jobs/' + this.jobForDelete._id)
                    .then(response => {
                        this.loadTable();
                    })

            } else { //else send a cancel email and mark job as cancelled
                this.jobForDelete.status = "cancelled";
                this.mailJob(this.jobForDelete.job_id, 'cancel', this.jobForDelete.appleEmails, this.jobForDelete.vendorEmails);

                axios.put('/jobs/' + this.jobForDelete._id, this.jobForDelete)
                    .then(response => {
                        this.loadTable();
                    }).catch(function (error) {

                        console.log(error);
                    });
            }
            this.jobForDelete = null;

        },
        // mails the job
        mailJob(job_id, type, jobappleEmails, jobvendorEmails) {

            var emailData = {
                "appleEmails": jobappleEmails,
                "vendorEmails": jobvendorEmails,
                "oldJob": this.oldJob
            };

            axios.post(`/mail/${job_id}/${type}`, emailData)
                .then(response => {
                    return;

                }).catch(function (error) {

                    console.log(error);
                });

        },
        //sends job to editor
        editJob(job) {
            jobsInput.importJobForEdit(job);

        },
        // sends job to editor forduplication
        duplicateJob(job) {
            jobsInput.importJobForDuplicate(job);
        },
        updatePositionJobsTable(position) {
            if (position < 0) {
                this.paginatorPosition = 0;

            } else if (position * 25 > this.totalJobs) {
                this.paginatorPosition = position;
            }

            this.loadTable();
        },
        // gets total no. of jobs
        getTotalJobs() {
            axios.get("/jobs/totalJobs")
                .then(response => {
                    this.totalJobs = response.data;

                })
                .catch(function (error) {

                    console.log(error);
                });
        },
        // colour of table rows
        rowClass(job) {
            if (job.isDraft) {
                return 'table-light';
            } else if (job.cancelled) {
                return "table-dark";
            } else if (job.completed == false && this.overdue(job)) {
                return "table-danger";
            } else if (job.completed) {
                return "table-success";
            } else {
                return "table-warning";
            }
        },
        searchJobs() {
            var criteria = $("#jobSearchCriteria").val();
            var jobs = [];
            $.ajax({
                url: '/jobs/search/' + criteria,

                success: function (result) {

                    //make an array of vendor objects
                    $.each(result, function (i, job) {

                        jobs.push(job);
                    });
                    buildJobsTable(jobs);
                }
            });

        },
        formatDate(date) {
            return moment(date, 'YYYY-MM-DD').format('MMM-DD');
        },
        setCurrentUser() {
            this.currentEngineer = currentUser.user;
            this.loadTable();

        }
    },
    mounted() {
        this.loadTable();
        this.getTotalJobs();
        this.setCurrentUser();
    },

});


/*
 * This section deals with the options to mark a job as complete
 *
 *
 *
 */



var jobComplete = new Vue({
    el: "#completeJob",
    data() {
        return {
            jobToBeCompleted: null,
            invoicesCompleteJobInputModal: false,
        }
    },
    methods: {
        closeModal: function () {
            this.invoicesCompleteJobInputModal = false;
        },
        updateJobData(job) {

            this.jobToBeCompleted = job;
            this.invoicesCompleteJobInputModal = true;
        },
        // confirm a job to be completed or not
        completeJob() {
            this.jobToBeCompleted.status = 'completed';

            axios.put("/jobs/" + this.jobToBeCompleted._id, this.jobToBeCompleted)
                .then(response => {
                    this.invoicesCompleteJobInputModal = true;
                })
                .catch(function (error) {
                    console.log(error);
                });
        },
        formatDate(date) {
            return moment(date).format("YYYY-MM-DD");
        }
    }
});

/*
 * This section deals with sending out recap emails to people
 *
 *
 *
 */
var recapEmail = new Vue({
    el: '#recapEmails',
    data: {

        jobs: [],

        showRecap: false,

    },
    methods: {
        cancelRecap: function () {

            this.jobs = [];
            this.showRecap = false;
            JobTable.removeRecap();
            JobTable.loadTable();

        },
        // goes through selected jobs and sends email
        sendRecap: function () {
            for (var i = 0; i < this.jobs.length; i++)
                var sendData = JSON.stringify({
                    "appleEmails": this.recapEmailData.CC,
                    "vendorEmails": this.recapEmailData.To
                });
            axios.post("/mail/" + this.recapEmailData.job.job_id + '/recap', sendData)
                .then(response => {
                    this.JobTable.loadTable();
                })
                .catch(function (error) {

                    console.log(error);
                });

            $('#recapModal').modal('hide');
        },
        createRecap(jobs) {
            this.showRecap = true;
            this.jobs = jobs;
        },
        jobStartDate(job) {
            return moment(job.jobDetails[0].Date, 'YYYY-MM-DD, hh:mm').format('YYYY-MM-DD');
        },
        jobEndDate(job) {
            return moment(job.jobDetails[job.jobDetails.length - 1].Date, 'YYYY-MM-DD, hh:mm').format('YYYY-MM-DD');
        }

    }
});


// show welcome and messages
var welcome = new Vue({

    el: "#Welcome",
    data() {
        return {
            incompleteJobsCount: 0,
            currentEngineer: null
        }
    },
    methods: {
        newJob: function () {
            jobsInput.newJob();
        },

        loadIncompleteJobs() {
            axios.get("/jobs/incompleteCount/" + this.currentEngineer.dsid)
                .then(response => {
                    this.incompleteJobsCount = response.data.count;

                }).catch(function (error) {

                    console.log(error);
                });
        },
        allJobs() {
            JobTable.loadTable();;
        },
        sendRecaps() {
            JobTable.sendRecap();
        }
    },
    mounted() {
        this.loadIncompleteJobs();
    }



});