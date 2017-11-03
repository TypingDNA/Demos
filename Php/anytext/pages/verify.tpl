<!DOCTYPE html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="./css/style.css" type="text/css">
	<script src="./js/functions.js" type="application/javascript"></script>
	<script src="//typingdna.com/scripts/typingdna.js"></script>
	<script>
		session_id = "<?php echo session_id(); ?>";
	</script>
	<title>Verify user - TypingDNA</title>
</head>

<body style="height:100%; background:none transparent;">
	<div class="container" style="max-width:610px; padding-top:50px">

		<!-- Verify typing pattern #1 -->
		<div id="step_verify1" class="step" style="display:inline; opacity:1">
			<p>
				<h4>Verifying user: Please type the text below</h4></p>
			<p>
                <span id="pA1H" class="highlighted"></span><span id="pA1"></span>
            </p>
			<br />
			<textarea rows="2" cols="100" class="form-control" id="verifytext1" name="verifytext1" onkeyup="highlight('pA1H','pA1', this)" placeholder="Type the text loaded above"></textarea>
			<br />
			<div>
                <a class="btn btn-colors" onclick="nextFunction();" role="button" id="btn_verify1"><b>Next step</b></a>
            </div>
		</div>

		<!-- Verify typing pattern #2 (SECOND PASS) -->
		<!-- This step only happens, as a second chance, if the first verification fails -->
		<div id="step_verify2" class="step">
			<p>
				<h4>Step 2/2: Please type one more text</h4></p>
			<p><span id="pA2H" class="highlighted"></span><span id="pA2"></span></p>
			<br />
			<textarea rows="2" cols="100" class="form-control" id="verifytext2" name="verifytext2" onkeyup="highlight('pA2H','pA2', this)" placeholder="Type the text loaded above"></textarea>
			<br />
			<div><a class="btn btn-colors" onclick="nextFunction();" role="button" id="btn_verify2"><b>Next step</b></a></div>
		</div>

		<!-- Loading -->
		<div id="step_loading" class="step">
			<br />
			<p>Loading...</p>
		</div>

		<!-- Mobile device detected -->
		<div id="mobile" class="step">
			<p>
				<h4>Mobile device detected</h4></p>
			<div class="message">
				<p>We're sorry but mobile devices are not supported yet.</p>
			</div>
		</div>
	</div>

	<script>
		tdna = new TypingDNA(); /** creates an instance of the TypingDNA typing pattern recording class */
		tdna.start(); /** starts the recording of a new typing pattern, will call tdna.reset() to reset later */
		var tp = ''; /** the typing pattern String variable to be recorded and to be sent to the server/API */
		var currentQuote = ''; /** the text to be typed at a each step, to be set independently */
		var nextFunction; /** a proxy for the next function in chain */

		/*****************************************************
		 * shows the first step of verification (1 of max 2),
		 * self executed at start
		 *****************************************************/
		(function() {
			currentTypeArea = document.getElementById('verifytext1');
			currentQuote =
					'Do not display similar texts to the enrollment ones. '+
					'For best results, it is mandatory to have completely different samples for verfication.';
			highlight('pA1H', 'pA1');
			currentTypeArea.focus();
			nextFunction = verifyStep1; // sets the next function
		})();

		/*****************************************************
		 * called when finishing typing the first text
		 ****************************************************/
		function verifyStep1() {
			if (fastCompareTexts(document.getElementById("verifytext1").value, currentQuote) > 0.7) {
				/** at least 70% of the words should be typed correctly */
                swapContent('step_verify1', 'step_loading');
				var tp = tdna.get(300);
				var params = {
					step: 'verify',
					tp: tp,
					session_id: session_id
				}
				/** call the API */
				ajaxCall(params, function(result){
					if (result && result.result === 0) {
						/** result is 0, make another verification */
						showVerifyStep2();
					} else {
						/**
						 * the typingResult and typingFailedAttempts variables are
						 * already set in the php $_SESSION by typingdnacalls.php
						 */
						document.location = 'final.php';
					}
                });
			} else {
				alert('Too many typos, please re-type');
			}
		}

		/*****************************************************
		 *  called from verify(1) ONLY if first step fails, otherwise it redirects to the final page
		 ****************************************************/
		function showVerifyStep2() {
			swapContent('step_loading', 'step_verify2', function() {
				currentTypeArea = document.getElementById('verifytext2');
				currentQuote = "The second text can be much shorter as we're only adding depth to the first typing pattern.";
				highlight('pA2H', 'pA2');
				currentTypeArea.focus();
				nextFunction = verifyFinish;
			});
		}

		/*****************************************************
		 * called after finishing the second verification step;
		 * shows the finish page
		 ****************************************************/
		function verifyFinish() {
			if (fastCompareTexts(document.getElementById('verifytext2').value, currentQuote) > 0.7) {
				/** at least 70% of the words should be typed correctly */
				swapContent('step_verify2', 'step_loading');
				var tp = tdna.get(300);
				var params = {
					step: 'verify',
					tp: tp,
					session_id: session_id
				}
				ajaxCall(params, function(result){
					/**
					 * the typingResult and typingFailedAttempts variables are
					 * already set in the php $_SESSION by typingdnacalls.php
					 */
					document.location = 'final.php';
				});
			} else {
				alert('Too many typos, please re-type');
			}
		}

		/*****************************************************
		 * checks if a mobile device is trying to take the
		 * test and shows the "mobile" div
		 ****************************************************/
        mobileAndTabletCheck(function(result){
            if (result == true) {
                swapContent('step_verify1', 'mobile', function() {
                    console.error('no mobile support yet.');
                });
            }
        });

		/** checks if Enter is pressed on text forms and calls the next function */
		initControls();

	</script>
</body>

</html>
