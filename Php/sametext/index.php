<?php

	require_once('./_init.php');

	if( isset($_SESSION['username']) && $_SESSION['username'] ) {
		header('Location: /enroll.php');
	}

	if($_SERVER['REQUEST_METHOD'] === "POST") {
		$_SESSION['username'] = $_POST["username"];
		header('Location: /enroll.php');
	}
?>
<?php require_once('./partials/header.php'); ?>
<div class="container center-container">
	<div class="col-xs-12 col-sm-6">
		<h4> Enter an email to enroll or authenticate</h4>
		<p>If you are enrolling a new email/username, you will need it to test authentication afterwards.</p>
		<form method="post">
			<div class="input-group"><span class="input-group-addon">Your email</span>
				<input class="form-control" type="text" id="username" name="username" placeholder="username">
			</div>
			<div style="padding-top:20px;">
				<button class="btn btn-colors btn-s" role="button" id="btn_next" type="submit"><b>Next</b></button>
			</div>
		</form>
	</div>
</div>
<script>
	document.addEventListener('DOMContentLoaded', () => {
		document.getElementById('username').focus();
	});
</script>
<?php require_once('./partials/footer.php'); ?>