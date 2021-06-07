<nav class="container-fluid">
	<div class="user-info">
		<div class="username-container">
			<span id="username">Username: <?= $_SESSION['username'] ?></span>
			<span id="username">UserId: <?= generateUsernameHash( $_SESSION['username'] )?></span>
		</div>
		<a class="btn btn-default" href="/logout.php">Logout</a>
	</div>
</nav>