<?php

require_once('../_init.php');

if( $_SERVER['REQUEST_METHOD'] !== "POST" ) {
	die('Method not allowed');
}

if( !isset($_SESSION['username']) ) {
	http_response_code( 401 );
	exit;
}

if( !isset( $_POST['tp'] ) || $_POST['tp'] === "null" ) {
	http_response_code(400);
	exit;
}

$tp = $_POST['tp'];
$userId = generateUsernameHash( $_SESSION['username'] );
$tdcp = new TypingDnaClient( getenv('TDNA_KEY'), getenv('TDNA_SECRET') );

$response = $tdcp->save( $userId, $tp);

header('Content-type: application/json');

echo json_encode( [
	"status" => "ok"
] );

exit;