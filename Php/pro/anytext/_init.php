<?php

$path = __DIR__ . '/.env';

if( !file_exists($path) || !is_readable($path) ) {
	die("Missing .env file!");
}

$lines = file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

foreach( $lines as $line ) {

	if( strpos(trim($line), '#') === 0 ) continue;

	list( $name, $value ) = explode('=', $line, 2);

	$name = trim( $name );
	$value = trim( $value );

	if( !array_key_exists( $name, $_SERVER ) && !array_key_exists( $name, $_ENV ) ) {
		putenv(sprintf('%s=%s', $name, $value));
	}
}

function generateUsernameHash( $username ) {
	return md5( $username.getenv('SECRET_KEY') );
}

require_once( __DIR__ . '/lib/TypingDnaClient.php');

session_start();