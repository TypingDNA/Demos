<?php

require_once('../_init.php');

if( $_SERVER['REQUEST_METHOD'] !== "POST" ) {
	die('Method not allowed');
}

if( !isset( $_SESSION['username'] ) ){
	http_response_code(401);
	exit;
}

if( !isset( $_POST['tp'] ) || $_POST['tp'] === "null" ) {
	http_response_code(400);
	exit;
}

$tp = $_POST['tp'];
$tdcp = new TypingDnaClient( getenv('TDNA_KEY'), getenv('TDNA_SECRET') );

$user = null;
$auto = $tdcp->auto( generateUsernameHash( $_SESSION['username'] ), $tp );

if( isset( $_POST['check_user'] ) && $_POST['check_user'] === "1" ) {
	$user = $tdcp->checkuser( generateUsernameHash( $_SESSION['username'] ) );
}

header('Content-type: application/json');

echo json_encode( [
	"user" => $user ? (array)$user : null,
	"auto" => (array)$auto
]);

exit;