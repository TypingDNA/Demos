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
  * $tdcp = new TypingDNAClientPHP('key','secret');
  * echo $tdcp->save($userid, $typingPattern);
  * echo $tdcp->verify($userid, $typingPattern, 2);
  *******************************************************/

	class TypingDnaClient
	{
	
		private $apiKey = '';
		private $apiSecret = '';
		private $typingDnaUrl = 'https://api.typingdna.com';
	
		public function __construct( $apiKey, $apiSecret ) {

			if(!$apiKey || !$apiSecret){
				throw new Exception('Missing TypingDNA client credentials');
			}
	
			$this->apiKey = $apiKey;
			$this->apiSecret = $apiSecret;
		}
		/*******************************************************
		 *          USE YOUR OWN apiKey & apiSecret
		 * The apiKey is used to give access, track, count and
		 * log each transaction, it can't be reset
		 *******************************************************/
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
		  $apiKey = $this->apiKey;
		  $apiSecret = $this->apiSecret;
		  $typingdna_url = urldecode($this->typingDnaUrl.'/save/'.$userid);
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
	  public function verify($userid, $tp, $quality = 2)
	  {
		  $apiKey = $this->apiKey;
		  $apiSecret = $this->apiSecret;
		  $typingdna_url = urldecode($this->typingDnaUrl.'/verify/'.$userid);
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

		  return json_decode( file_get_contents( $typingdna_url, false, stream_context_create($opts) ) );
	  }

	  /**
		 * Verify and enrolls patterns for users
		 * Usage: $tdcp->verify($userid, $typingPattern);
		 *
		 * @param $userid
		 * @param $tp
		 * @return mixed
		 **/
	  public function auto($userid, $tp)
	  {
		  $apiKey = $this->apiKey;
		  $apiSecret = $this->apiSecret;
		  $typingdna_url = urldecode($this->typingDnaUrl.'/auto/'.$userid);
		  $postdata = http_build_query( array( 'tp' => $tp ) );
		  $opts = array(
			  'http' => array(
				'method' => 'POST',
				'header' => "Content-type: "."application/x-www-form-urlencoded"."\r\n".
							'Authorization: Basic '.base64_encode("$apiKey:$apiSecret"),
				'content' => $postdata,
			  ),
		  );

		  return json_decode( file_get_contents( $typingdna_url, false, stream_context_create($opts) ) );
	  }
	
		/**
		 * Check user method for verifying how many previous recordings you have for a user
		 * Usage: $tdcp->checkuser($userid);
		 * @param $userid
		 * @return mixed
		 **/
	  public function checkuser($userid)
	  {
		  $apiKey = $this->apiKey;
		  $apiSecret = $this->apiSecret;
		  $typingdna_url = urldecode($this->typingDnaUrl.'/user/'.$userid);
		  $opts = array(
			  'http' => array(
				'method' => 'GET',
				'header' => 'Authorization: Basic '.base64_encode("$apiKey:$apiSecret"),
			  ),
		  );

		  return json_decode(file_get_contents($typingdna_url, false, stream_context_create($opts)));
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
		  $apiKey = $this->apiKey;
		  $apiSecret = $this->apiSecret;
		  $typingdna_url = urldecode($this->typingDnaUrl.'/user/'.$userid);
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
	}