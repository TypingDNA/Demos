<?php
/**
 * a PHP implementation for the TypingDNA.com Auth API.
 *
 * @version 2.1
 *
 * @author Raul Popa
 * @copyright TypingDNA.com, SC TypingDNA SRL
 * @license http://www.apache.org/licenses/LICENSE-2.0
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

 /*******************************************************
  *         Typical usage
  * require_once 'typingdnaclient.php';
  * $tdcp = new TypingDNAClientPHP();
  * echo $tdcp->save($userid, $typingPattern);
  * echo $tdcp->verify($userid, $typingPattern, 2);
  *******************************************************/

    class TypingDNAClientPHP
    {
    /*******************************************************
     *          USE YOUR OWN apiKey & apiSecret
     * The apiKey is used to give access, track, count and
     * log each transaction, it can't be reset
     *******************************************************/
      private static $apiKey = '*************';
      private static $apiSecret = '*************';
      private static $typingdnaurl = 'https://api.typingdna.com';
      //private static $typingdnaurl = 'https://tdna-api.azurewebsites.net';
    /*******************************************************
     * Note: you can use the alternative Azure link above
    *******************************************************/

        /**
         * Save method for saving new patterns,
         * for new or existing users
         * Usage: $tdcp->save($userid, $typingPattern);
         *
         * @param $userid
         * @param $tp
         * @return mixed
         **/
      public function save($userid, $tp)
      {
          $apiKey = self::$apiKey;
          $apiSecret = self::$apiSecret;
          $typingdna_url = urldecode(self::$typingdnaurl.'/save/'.$userid);
          $postdata = http_build_query(
              array(
                  'tp' => $tp,
              )
          );
          $opts = array(
              'http' => array(
                'method' => 'POST',
                'header' => "Content-type: "."application/x-www-form-urlencoded"."\r\n".
                            'Authorization: Basic '.base64_encode("$apiKey:$apiSecret"),
                'content' => $postdata,
              ),
          );
          $context = stream_context_create($opts);
          $response = json_decode(file_get_contents($typingdna_url, false, $context));
          /*************************************************
           * Returns success: 1 for success, 0 for not or
           * returns the error if applicable
           *************************************************/
          return $response->{'success'};
      }

        /**
         * Verify patterns, for existing users
         * Usage: $tdcp->verify($userid, $typingPattern, $quality);
         *
         * @param $userid
         * @param $tp
         * @param int $quality
         * @return mixed
         **/
      public function verify($userid, $tp, $quality = 1)
      {
          $apiKey = self::$apiKey;
          $apiSecret = self::$apiSecret;
          $typingdna_url = urldecode(self::$typingdnaurl.'/verify/'.$userid);
          $postdata = http_build_query(
              array(
                  'tp' => $tp,
                  'quality' => $quality,
              )
          );
          $opts = array(
              'http' => array(
                'method' => 'POST',
                'header' => "Content-type: "."application/x-www-form-urlencoded"."\r\n".
                            'Authorization: Basic '.base64_encode("$apiKey:$apiSecret"),
                'content' => $postdata,
              ),
          );
          $context = stream_context_create($opts);
          $response = json_decode(file_get_contents($typingdna_url, false, $context));
          /*************************************************
           * Returns a result: 1 for true match, 0 for false
           * match or returns the error if applicable
           *************************************************/
          if ( intval($response->{'success'} === 0)) {
              return $response->{'message'};
          } else {
              return $response->{'result'};
          }
      }

        /**
         * Check user method for verifying how many previous recordings you have for a user
         * Usage: $tdcp->checkuser($userid);
         * @param $userid
         * @return mixed
         **/
      public function checkuser($userid)
      {
          $apiKey = self::$apiKey;
          $apiSecret = self::$apiSecret;
          $typingdna_url = urldecode(self::$typingdnaurl.'/user/'.$userid);
          $opts = array(
              'http' => array(
                'method' => 'GET',
                'header' => 'Authorization: Basic '.base64_encode("$apiKey:$apiSecret"),
              ),
          );
          $context = stream_context_create($opts);
          $response = json_decode(file_get_contents($typingdna_url, false, $context));
          /*************************************************
           * Returns an integer representing the number of
           * previous typing patterns recorded (at least 2
           * would be needed for good quality matching)
           *************************************************/
          return $response->{'count'};
      }

        /**
         * Check user method for verifying how many previous recordings you have for a user
         * Usage: $tdcp->deleteuser($userid);
         *
         * @param $userid
         * @return mixed
         **/

      public function deleteuser($userid)
      {
          $apiKey = self::$apiKey;
          $apiSecret = self::$apiSecret;
          $typingdna_url = urldecode(self::$typingdnaurl.'/user/'.$userid);
          $opts = array(
              'http' => array(
                'method' => 'DELETE',
                'header' => 'Authorization: Basic '.base64_encode("$apiKey:$apiSecret"),
              ),
          );
          $context = stream_context_create($opts);
          $response = json_decode(file_get_contents($typingdna_url, false, $context));
          /*************************************************
           * Returns an integer representing the number of
           * deleted typing patterns or an error if applicable
           *************************************************/
          return $response->{'deleted'};
      }

        /**
         * Match method allows you to compare any two typing patterns,
         * returns a match score (a percentage between 0 and 100)
         * We recommend using our save and verify methods instead, explained above
         * Usage: $tdcp->match($newtp, $oldtp, $quality);
         *
         * @param $newtp
         * @param $oldtp
         * @param int $quality
         * @return mixed
         **/

      public function match($newtp, $oldtp, $quality = 1)
      {
          $apiKey = self::$apiKey;
          $apiSecret = self::$apiSecret;
          $typingdna_url = urldecode(self::$typingdnaurl.'/match');
          /*************************************************
           * The data to be sent to the server, you can send
           * a new typing pattern along with one older typing pattern
           *************************************************/
          $postdata = http_build_query(
              array(
                  'tp1' => $newtp,
                  'tp2' => $oldtp,
                  'quality' => $quality,
              )
          );
          $opts = array(
              'http' => array(
                'method' => 'POST',
                'header' => 'Authorization: Basic '.base64_encode("$apiKey:$apiSecret"),
                'content' => $postdata,
              ),
          );
          $context = stream_context_create($opts);
          $response = json_decode(file_get_contents($typingdna_url, false, $context));
          /*************************************************
           * Returns a result: 1 for true match, 0 for false
           * match or returns the error if applicable
           *************************************************/
          return $response->{'result'};
      }
    }
