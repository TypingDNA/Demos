<?php
    session_start();
    if ($_SESSION["typingResult"] == 1){
      $loginMessage = "You are logged in!";
    } else {
      $loginMessage = "You are NOT logged in!";
    }
    ob_start();
    include "./pages/final.tpl";
    $size = ob_get_length();
    header("Connection: close");
    header("Content-Length: $size");
    ob_flush();
    ob_end_clean();
    flush();
    exit;

