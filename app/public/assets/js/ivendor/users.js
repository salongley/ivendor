var currentUser = new Vue({
    el: "#userData",
    data() {
        return {

            users: [],
            user: {
                _id: null,
                name: '', // LDAP name
                full_name: '',
                preferred_name: '',
                dsid: '', //apple directory personID
                email: '',
                contact_number: '',
                timezone: '',
                image_base64: '',
                role: 0, // role 0 normal user, role 1 can invoice, role 2 admin
                proxies: [], // who else I can see
            },
            selectedUser: null,
        }
    },

    methods: {
        getUsers: function () {
            var UserData = [];
            axios.get("/users")
                .then(response => {
                    this.users = response.data;
                })
                .catch(function (error) {

                    console.log(error);
                });
        },
        setCurrentUser() {

            this.user = this.users.filter(user => user.dsid == this.selectedUser)[0];
            jobsInput.setCurrentUser();
            JobTable.setCurrentUser();
            ResourceTypeTable.setCurrentUser();
            editUser.setCurrentUser();

        },

        autoCompleteUsers(queryString, cb) {
            var users = this.users;
            var results = queryString ? users.filter((user, index, array) => {
                return (queryString === user.full_name.substr(0, queryString.length));
            }) : users;
            cb(results);

        },
    },
    mounted() {
        this.getUsers();
    }
});



var editUser = new Vue({
    el: '#editUser',
    data() {
        return {
            currentEngineer: {
                _id: null,
                name: '', // LDAP name
                full_name: 'Steve Lomgley',
                preferred_name: '',
                dsid: '', //apple directory personID
                email: '',
                contact_number: '',
                timezone: '',
                image_base64: '',
                role: 0, // role 0 normal user, role 1 can invoice, role 2 admin
                proxies: [], // who else I can see
            },

            UserIdPairs: [],
            proxies: [],
            users: [],
            selectedUser: null, // used to pick a user to change permissions stores DSID
            selectedUserDetails: null, // the users complete data
            permissions: [{
                key: 0,
                label: 'User'
            }, {
                key: 1,
                label: 'Invoice'
            }, {
                key: 2,
                label: 'Admin'
            }]
        }
    },

    methods: {
        getUsers: function () {
            var UserData = [];
            axios.get("/users")
                .then(response => {
                    this.users = response.data;
                    this.UserIdPairs = this.generateUserIdPairs();
                })
                .catch(function (error) {

                    console.log(error);
                });
        },
        saveProxies() {
            axios.put("/users/" + this.currentEngineer._id, this.currentEngineer)
                .then(response => {

                })
                .catch(function (error) {

                    console.log(error);
                });
        },
        savePermissions() {
            axios.put("/users/" + this.selectedUserDetails._id, this.selectedUserDetails)
                .then(response => {
                    this.selectedUserDetails = null;
                })
                .catch(function (error) {

                    console.log(error);
                });
        },
        cancelPermissions() {
            this.selectedUserDetails = null;
        },
        autoCompleteUsers(queryString, cb) {
            var users = this.users;
            var results = queryString ? users.filter((user, index, array) => {
                return (queryString === user.full_name.substr(0, queryString.length));
            }) : users;
            // call callback function to return suggestions

            cb(results);

        },
        selectedEngineer() {

            this.selectedUserDetails = this.users.filter((user, index, array) => {
                return (this.selectedUser === user.full_name.substr(0, this.selectedUser.length));
            })[0];
            this.selectedUser = '';

        },
        generateUserIdPairs() {
            var pairs = []
            for (var i = 0; i < this.users.length; i++) {
                pairs.push({
                    label: this.users[i].full_name,
                    key: this.users[i].dsid,
                    value: this.users[i].dsid,
                });
            }
            return pairs;
        },
        setCurrentUser() {
            this.currentEngineer = currentUser.user;
        }
    },
    mounted() {
        this.getUsers();
    },


})