<?php
    session_start();
    /*******************************************
     * reset the typing result for demo purpose
     *******************************************/
    $_SESSION["typingResult"] = 0;
    if(!isset($_SESSION["typingFailedAttempts"])) {
      $_SESSION["typingFailedAttempts"] = 0;
    }
    /*******************************************
     * THE START PAGE IS FOR DEMO ONLY,
     * USUALLY YOU'LL COMBINE THIS WITH A LOGIN/CREATE ACCOUNT PAGE
     *******************************************/
    ob_start();
    include "./pages/index.tpl";
    $size = ob_get_length();
    header("Connection: close");
    header("Content-Length: $size");
    ob_flush();
    ob_end_clean();
    flush();
    exit;
