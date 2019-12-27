$("#navCountry").on("click", function () {

	$("#mainCountry").collapse("show");
	$("#mainResourceType").collapse("hide");
	$("#mainUsers").collapse("hide");
	$("#mainJobs").collapse("hide");
	$("#mainInvoices").collapse("hide");
	$("#mainReports").collapse("hide");
	$("#mainVendors").collapse("hide");
	$("#appleCommunication").collapse("hide");

});

$("#navResourceType").on("click", function () {


	$("#mainCountry").collapse("hide");
	$("#mainResourceType").collapse("show");
	$("#mainUsers").collapse("hide");
	$("#mainJobs").collapse("hide");
	$("#mainInvoices").collapse("hide");
	$("#mainReports").collapse("hide");
	$("#mainVendors").collapse("hide");
	$("#appleCommunication").collapse("hide");
});

$("#navUsers").on("click", function () {


	$("#mainCountry").collapse("hide");
	$("#mainResourceType").collapse("hide");
	$("#mainUsers").collapse("show");
	$("#mainJobs").collapse("hide");
	$("#mainInvoices").collapse("hide");
	$("#mainReports").collapse("hide");
	$("#mainVendors").collapse("hide");
	$("#appleCommunication").collapse("hide");
});

$("#navJobs").on("click", function () {

	$("#mainCountry").collapse("hide");
	$("#mainResourceType").collapse("hide");
	$("#mainUsers").collapse("hide");
	$("#mainJobs").collapse("show");
	$("#mainInvoices").collapse("hide");
	$("#mainReports").collapse("hide");
	$("#mainVendors").collapse("hide");
	$("#appleCommunication").collapse("hide");
});

$("#navInvoices").on("click", function () {

	$("#mainCountry").collapse("hide");
	$("#mainResourceType").collapse("hide");
	$("#mainUsers").collapse("hide");
	$("#mainJobs").collapse("hide");
	$("#mainInvoices").collapse("show");
	$("#mainReports").collapse("hide");
	$("#mainVendors").collapse("hide");
	$("#appleCommunication").collapse("hide");
});

$("#navReports").on("click", function () {

	$("#mainCountry").collapse("hide");
	$("#mainResourceType").collapse("hide");
	$("#mainUsers").collapse("hide");
	$("#mainJobs").collapse("hide");
	$("#mainInvoices").collapse("hide");
	$("#mainReports").collapse("show");
	$("#mainVendors").collapse("hide");
	$("#appleCommunication").collapse("hide");
});

$("#navVendors").on("click", function () {

	$("#mainCountry").collapse("hide");
	$("#mainResourceType").collapse("hide");
	$("#mainUsers").collapse("hide");
	$("#mainJobs").collapse("hide");
	$("#mainInvoices").collapse("hide");
	$("#mainReports").collapse("hide");
	$("#mainVendors").collapse("show");
	$("#appleCommunication").collapse("hide");
});