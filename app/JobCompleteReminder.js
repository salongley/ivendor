



module.exports = function JobCompleteReminder(details){

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
		<h2 class="card-title" ><i class="fab fa-apple"></i> Job requires completion!</h2>
</div>
<div class="card-body">

<h6 class="card-subtitle mb-2 text-muted">
<strong> ${ details.jobID }</strong>
</h6>
<p>${ details.comments }</p>

</div>

</div>
</div>
</div>


</body></html>`;

return emailHTML;
							}

