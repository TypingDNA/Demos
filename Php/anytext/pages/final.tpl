<!DOCTYPE html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="./css/style.css" type="text/css">
	<script src="./js/functions.js" type="application/javascript"></script>
	<script>
		session_id = "<?php echo session_id(); ?>";
	</script>
	<title>Final - TypingDNA</title>

</head>

<body style="height:100%; background:none transparent;">
	<div class="container" style="max-width:610px; padding-top:50px">

		<!-- Select user -->
		<div id="step_start" class="step" style="display:inline; opacity:1">
			<p>
				<h4><?php echo $loginMessage ?></h4></p>
			<div><a class="btn btn-colors" onclick="restart();" role="button"><b>Start again</b></a></div>
		</div>

</body>

</html>
