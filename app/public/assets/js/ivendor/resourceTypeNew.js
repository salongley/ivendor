var resourceTypeInput = new Vue({

	el: '#ResourceTypeDataEntry',
	data() {
		return {
			resourceType: {
				_id: null,
				resourceTypeName: '',
				isMultipleDay: false,
				resourceElements: [], // array of elements
			},

			resourceElement: {
				elementName: '',
				icon: ''
			},
			resourceTag: {
				resourceTypeName: '',
				tagName: '',
				tags: []
			},
			icons: [],
			resourceInputModalShow: false,
			resourceElementsSection: 0,
			isEditing: false,
			currentEngineer: null,
		}
	},
	methods: {

		showModal() {
			this.resourceInputModalShow = true;
			this.resourceType.resourceElements.push(JSON.parse(JSON.stringify(this.resourceElement)));
			this.resourceTag.tags.push('');;
		},
		closeModal() {
			this.resourceInputModalShow = false;
			this.resourceType.resourceTypeName = '';
			this.resourceType.isMultipleDay = false;
			this.resourceType.resourceElements = [];
			this.resourceType.resourceTags = [];
			ResourceTypeTable.loadTable();
		},

		saveResource() {
			if (this.isEditing) {
				axios.put('resourceTypes/' + this.resourceType._id, this.resourceType)
					.then(response => {
						ResourceTypeTable.loadTable();
						this.closeModal();
					}).catch(function (err) {
						console.log(err);
					});

				axios.post('tags/' + this.resourceTag._id, this.resourceTag)
					.then(response => {
						ResourceTypeTable.loadTable();
						this.closeModal();
					}).catch(function (err) {
						console.log(err);
					});
			} else {
				axios.post('resourceTypes', this.resourceType)
					.then(response => {
						ResourceTypeTable.loadTable();
						this.closeModal();
					}).catch(function (err) {
						console.log(err);
					});

				axios.post('tags', this.resourceTag)
					.then(response => {
						ResourceTypeTable.loadTable();
						this.closeModal();
					}).catch(function (err) {
						console.log(err);
					});
			}




		},
		editResource(resourceType) {
			this.resourceType = resourceType;
			this.resourceInputModalShow = true;
			this.isEditing = true;


		},
		setResourceTypeName() {
			this.resourceTag.resourceTypeName = this.resourceType.resourceTypeName;
		},
		addResourceElement() {
			this.resourceType.resourceElements.push(JSON.parse(JSON.stringify(this.resourceElement)));
			this.resourceElementsSection++;

		},
		removeResourceElement(index) {
			this.resourceType.resourceElements.splice(index, 1);

		},
		addTag() {
			this.resourceTag.tags.push('');
		},
		removeTag(index) {
			this.resourceTags.tags.splice(index, 1);
		},
		loadIcons() {
			axios.get('assets/iconList.json')
				.then(response => {
					this.icons = response.data;
				}).catch(function (err) {
					console.log(err);
				});
		},
		closePopOver(ref) {
			var child = this.$refs[ref].doClose();
		},
		setCurrentUser() {
			this.currentEngineer = currentUser.user;

		}

	},
	mounted() {
		this.loadIcons();

	},

});


var ResourceTypeTable = new Vue({

	el: '#resourceTypeTableData',
	data() {
		return {
			resourceTypes: null,
			confirmDeleteDialog: false,
			okToDelete: false,
			currentEngineer: null,
		}
	},
	methods: {
		loadTable() {
			axios.get('/resourceTypes')
				.then(response => {
					this.resourceTypes = response.data;
				}).catch(function (err) {
					console.log(err)
				});
		},
		editResource(resourceType) {
			resourceTypeInput.editResource(resourceType);
		},
		deleteResourceType(table) {
			this.confirmDeleteDialog = false;
			axios.delete('/resourceTypes/' + table.row._id)
				.then(response => {
					this.okToDelete = false;
					this.loadTable();
				}).catch(function (err) {
					console.log(err)
				});


		},
		closeDialog(popRef) {

			this.$refs['popover' + popRef].doClose();
		},
		setCurrentUser() {
			this.currentEngineer = currentUser.user;

		}

	},
	mounted() {
		this.loadTable();
	},


});