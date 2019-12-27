// Switch to use the correct DB for each environment
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

module.exports = function NewRequest(job) {

	var emailHTML = `<!DOCTYPE html>
<html>
<head>
<title th:remove="all">Template for HTML email (simple)</title>
<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
<style>
.dot {
	height: 25px;
	width: 25px;
	background-color: #56AC2F;
	border-radius: 50%;
	display: inline-block;
}

.line {
	height: 50px;
	width: 10px;
	background-color: #56AC2F;
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

<div class="card-header" style="background: linear-gradient(to right, #56AC2F 0%, #A7E063 100%); color: #ffffff">
<h2 class="card-title" ><i class="fab fa-apple"></i> New Resource Request</h2>
</div>
<div class="card-body">

<h6 class="card-subtitle mb-2 text-muted">
<strong> ${ job.jobID }</strong>:${ job.vendor }
</h6>
<p>Please find below the details of a new request and a summary of related requests.</p>
<div class="card-text">
<table style="background: #FFFFFF">`;

	emailHTML += ``;
	job.jobDetails.forEach(function (jobDetail) {

		emailHTML += `<tr><td><span class="dot"></span></td>
	<td><strong> ${ jobDetail.Date }</strong></td></tr>
	<tr><td style="text-align: center"><span class="line"></span></td>
	<td style="vertical-align: top">${ jobDetail.country.split(':')[0] } : ${ jobDetail.pickUpLocation }<br/>`;

		jobDetail.resources.resourceElements.forEach(function (element, index) {

			for (i = 0; i < element.elementCount; i++) {
				emailHTML += `<i class="${element.icon}"></i> `;

			}

		});
		emailHTML += `</td></tr><tr><td><span class="dot"></span></td><td></td></tr>`;

	});
	emailHTML += `</table>

</div>
<a  class="card-link" href="${baseURL}vendor_communication.html?jobID=${job._id}">Submit Comments to Apple</a>
</div>
</div>
</div>

<div style="margin-top: 20px"></div>

<div class="container" style="margin-top: 20px">
<div class="card" style="width: 500px">
<div class="card-header" style="background: linear-gradient(to right, #56AC2F 0%, #A7E063 100%); color: #ffffff">
<h2 class="card-title" ><i class="fab fa-apple"></i> Summary</h2>
</div>
<div class="card-body">
<div class="card-text">`;

	job.jobDetails.forEach(function (jobDetail) {
		emailHTML += `<p><strong>Engineer:</strong> ${ job.users[0].full_name }<br/><strong>Pick Up Date:</strong> ${ jobDetail.Date } ${ jobDetail.pickUpTime!='undefined' ?  jobDetail.pickUpTime : ''}</p><p>`;

		jobDetail.resources.resourceElements.forEach(function (element) {

			emailHTML += `<strong>${ element.elementName }</strong>: <span> ${ element.elementCount }</span></br/>`
		});



		emailHTML += `<strong>Comments :</strong><span> ${ jobDetail.bookingComments }</span></p><hr/>`
	});
	emailHTML += `<a href="details.html" class="card-link" "${baseURL}/vendor_communication.html?jobID=${job._id}">Submit Comments to Apple</a>
			</div></div></div></body></html>`;

	return emailHTML;
}