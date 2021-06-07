<?php

require_once('../_init.php');

if( $_SERVER['REQUEST_METHOD'] !== "POST" ) {
	die('Method not allowed');
}

if( !isset($_SESSION['username']) ) {
	http_response_code(401);
	exit;
}

if( !isset( $_POST['tp'] ) || $_POST['tp'] === "null" ) {
	http_response_code(400);
	exit;
}

$enrolled = false;
$tp = $_POST['tp'];
$userId = generateUsernameHash( $_SESSION['username'] );

$tdcp = new TypingDnaClient( getenv('TDNA_KEY'), getenv('TDNA_SECRET') );

$verify = $tdcp->verify( $userId , $tp );

if( $verify->score >= 90) {

	$tdcp->save( $userId , $tp );

	$enrolled = true;
}

$user = $tdcp->checkuser( $userId );

header( 'Content-type: application/json' );

echo json_encode( [
	"enrolled" => $enrolled,
	"user" => (array)$user,
	"verify" => (array)$verify
] );

exit;