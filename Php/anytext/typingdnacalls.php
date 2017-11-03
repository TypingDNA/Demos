<?php
    session_start();
    /**  additionally you may want to verify any tokens that you've sent to the user */
    if ($_POST["session_id"] && session_id() == $_POST["session_id"]){
      require_once "./typingdnaclient.php";
      $tdcp = new TypingDNAClientPHP();
      switch($_POST["step"]){
        case "enroll":
          if(isset($_POST["tp"])){
            $tdcp->save($_SESSION["internalUserId"], $_POST["tp"]);
            echo json_encode(array("success"=>1));
            /**
             *  NOTE IF you didn't do this previously,
             * you should store the $_SESSION["internalUserId"] together with
             * any reference to your user like the $_POST["username"]
             */
          } else die(json_encode(array("success"=>0, "message"=>"Invalid typing pattern")));
        break;
        case "verify":
          if(isset($_POST["tp"])){
            $result = $tdcp->verify($_SESSION["internalUserId"], $_POST["tp"], 2);
            $_SESSION["typingResult"]=$result;
            if($result == 0){
              $_SESSION["typingFailedAttempts"]++;
              /**  additionally you should add a log in a database and verify later */
            }
            echo json_encode(array("success"=>1,"result"=>$result));
          } else die(json_encode(array("success"=>0, "message"=>"Invalid typing pattern")));
        break;
        case "checkuser":
          if(isset($_POST["username"])) {
            $someprivatekey = "8m7gy90u32aq9n432f9r3fkdjb6jjk9";
            $result = $tdcp->checkuser(md5($_POST["username"].$someprivatekey));
            echo json_encode(array("success" => 1, "result" => $result));
          }  else die(json_encode(array("success"=>0, "message"=>"Invalid user name")));
          break;
      }
    } else {
      die(json_encode(array("success"=>0, "message"=>"Invalid session id")));
    }
    exit;

