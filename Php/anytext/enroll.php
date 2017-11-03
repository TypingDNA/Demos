<?php
    session_start();
    /** reset the typing result for demo purpose */
    $_SESSION["typingResult"]=0;
    /********************************************************
     * generate a userid for the user and keep it in the session
     * DO NOT pass it to the browser, you will use the $_SESSION["internalUserId"] to enroll the user with TypingDNA
     *******************************************************/
    $username = $_GET["user"];
    /********************************************************
     * this is only a sample of generating an id from a username and a key,
     * you can perform any kind of key generation here
     *******************************************************/
    $someprivatekey = "8m7gy90u32aq9n432f9r3fkdjb6jjk9";
    $_SESSION["internalUserId"] = md5($username.$someprivatekey);
    ob_start();
    include "./pages/enroll.tpl";
    $size = ob_get_length();
    header("Connection: close");
    header("Content-Length: $size");
    ob_flush();
    ob_end_clean();
    flush();
    exit;
