// 
//Set these in the rio.yml AND the apps.yml
var baseURL = '';

if (process.env.NODE_ENV == 'prod') {
	baseURL = 'https://ivendor-ivendor-prod.usspk05.app.apple.com/'

} else if (process.env.NODE_ENV == 'dev') {
	baseURL = 'https://ivendor-ivendor-dev.usspk05.app.apple.com/'

} else if (process.env.NODE_ENV == 'local') {

	baseURL = 'https://ivendor-ivendor-dev.usspk05.app.apple.com/';

} else {

	baseURL = 'http://localhost:8080'
}

module.exports = function UpdateRequest(job, oldJob) {


	var emailHTML = `<!DOCTYPE html>
<html>
<head>
<title th:remove="all">Template for HTML email (simple)</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style>
.dot {
	height: 25px;
	width: 25px;
	background-color: #FDBE2E;
	border-radius: 50%;
	display: inline-block;
}
.highlight {background-color: #FFFF88;
			font-weight:bold}

.line {
	height: 50px;
	width: 10px;
	background-color: #FDBE2E;
	border-radius: 5px;
	display: inline-block;
}
</style>

<link rel="stylesheet"
	href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.3/css/bootstrap.min.css"
	integrity="sha384-MCw98/SFnGE8fJT3GXwEOngsV7Zt27NXFoaoApmYm81iuXoPkFOJwJ8ERdknLPMO"
	crossorigin="anonymous">
<link rel="stylesheet"
	href="https://use.fontawesome.com/releases/v5.3.1/css/all.css"
	integrity="sha384-mzrmE5qonljUremFsqc01SB46JvROS7bZs3IO2EmfFsd15uHvIt+Y8vEf7N7fWAU"
	crossorigin="anonymous">
</head>
<body style="background: #F6F6F6">
<div class="container">
<div class="card" style="width: 500px">

<div class="card-header" style="background: linear-gradient(to right, #FDBE2E 0%, #FE854D 100%); color: #ffffff">
<h2 class="card-title" ><i class="fab fa-apple"></i> Updated Resource Request</h2>
</div>
<div class="card-body">

<h6 class="card-subtitle mb-2 text-muted">
<strong> ${ job.jobID }</strong>:${ job.vendor }
</h6>
<p>Please find below the details of a request which has been amended. Changes are highlighted.</p>
<div class="card-text">
<table style="background: #FAFAFA">`;

	emailHTML += ``;

	job.jobDetails.forEach(function (jobDetail, index) {

		emailHTML += `<tr><td><span class="dot"></span></td>
	<td><strong> ${ highlightChanges(job.jobDetails[index].Date, oldJob.jobDetails[index].Date) }</strong></td></tr>
	<tr><td style="text-align: center"><span class="line"></span></td>
	<td style="vertical-align: top">${ highlightChanges(job.jobDetails[index].country.split(':')[0],oldJob.jobDetails[index].country.split(':')[0]) } : ${  highlightChanges(job.jobDetails[index].pickUpLocation,oldJob.jobDetails[index].pickUpLocation) }<br/>`;

		job.jobDetails[index].resources.resourceElements.forEach(function (element, elIndex) {

			for (i = 0; i < job.jobDetails[index].resources.resourceElements[elIndex].elementCount; i++) {
				emailHTML += `<i class="${highlightChanges(job.jobDetails[index].resources.resourceElements[elIndex].icon,oldJob.jobDetails[index].resources.resourceElements[elIndex].icon)}"></i> `;

			}

		});
		emailHTML += `</td></tr><tr><td><span class="dot"></span></td><td></td></tr>`;

	});
	emailHTML += `</table>

</div>
<a  class="card-link" href="http://localhost:8080/vendor_communication.html?jobID=${job._id}">Submit Comments to Apple</a>
</div>
</div>
</div>

<div style="margin-top: 20px"></div>

<div class="container" style="margin-top: 20px">
<div class="card" style="width: 500px">
<div class="card-header" style="background: linear-gradient(to right, #FDBE2E 0%, #FE854D 100%); color: #ffffff">
<h2 class="card-title" ><i class="fab fa-apple"></i> Summary</h2>
</div>
<div class="card-body">
<div class="card-text">`;

	job.jobDetails.forEach(function (jobDetail, index) {
		emailHTML += `<p><strong>Engineer:</strong> ${ job.users[0].full_name }<br/><strong>Pick Up Date & Time:</strong> ${ highlightChanges(job.jobDetails[index].Date, oldJob.jobDetails[index].Date) }</p><p>`;

		job.jobDetails[index].resources.resourceElements.forEach(function (element, elIndex) {

			emailHTML += `<strong>${ highlightChanges(job.jobDetails[index].resources.resourceElements[elIndex].elementName, oldJob.jobDetails[index].resources.resourceElements[elIndex].elementName) }</strong>: <span> ${ highlightChanges( job.jobDetails[index].resources.resourceElements[elIndex].elementCount, oldJob.jobDetails[index].resources.resourceElements[elIndex].elementCount) }</span></br/>`
		});


		emailHTML += `<strong>Comments :</strong><span> ${ highlightChanges(job.jobDetails[index].bookingComments,oldJob.jobDetails[index].bookingComments) }</span></p><hr/>`
	});
	emailHTML += `<a href="details.html" class="card-link" "${baseURL}/vendor_communication.html?jobID=${job._id}">Submit Comments to Apple</a>
			</div></div></div></body></html>`;

	return emailHTML;
}

function highlightChanges(newElem, oldElem) {
	var oldText = oldElem,
		text = '',
		spanOpen = false;
	if (newElem.constructor !== String) {
		newElem = '' + newElem;
		oldText = '' + oldElem;
	}

	newElem.split('').forEach(function (val, i) {
		if (val != oldText.charAt(i)) {
			text += !spanOpen ? "<span class='highlighted'>" : "";
			spanOpen = true;
		} else {
			text += spanOpen ? "</span>" : "";
			spanOpen = false;
		}
		text += val;
	});
	return text;
}