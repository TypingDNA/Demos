<!DOCTYPE html>

<head>
	<meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<link rel="stylesheet" href="//netdna.bootstrapcdn.com/bootstrap/3.1.1/css/bootstrap.min.css">
	<link rel="stylesheet" href="./css/style.css" type="text/css">
	<script src="./js/functions.js" type="application/javascript"></script>
	<script src="//typingdna.com/scripts/typingdna.js"></script>

	<script>
		session_id = "<?php echo session_id(); ?>"
	</script>

	<title>Enroll new user - TypingDNA</title>
</head>

<body style="height:100%; background:none transparent;">
	<div class="container" style="max-width:610px; padding-top:50px">

		<!-- Learn/save typing pattern #1 -->
		<div id="step_learn1" class="step" style="display:inline; opacity:1">
			<p><h4>Enrolling new user 1/2: Please type the text below</h4></p>
			<p><span id="pA1H" class="highlighted"></span><span id="pA1"></span></p>
			<br />
			<textarea rows="2" cols="100" class="form-control" id="enrolltext1" name="enrolltext1" onkeyup="highlight('pA1H','pA1', this)" placeholder="Type the text loaded above"></textarea>
			<br />
			<div><a class="btn btn-colors" onclick="nextFunction();" role="button" id="btn_learn1"><b>Next step</b></a></div>
		</div>

		<!-- Learn/save typing pattern #1 -->
		<div id="step_learn2" class="step">
			<p>
				<h4>Step 2/2: Please type one more text</h4></p>
			<p><span id="pA2H" class="highlighted"></span><span id="pA2"></span></p>
			<br />
			<textarea rows="2" cols="100" class="form-control" id="enrolltext2" name="enrolltext2" onkeyup="highlight('pA2H','pA2', this)" placeholder="Type the text loaded above"></textarea>
			<br />
			<div><a class="btn btn-colors" onclick="nextFunction();" role="button" id="btn_learn2"><b>Next step</b></a></div>
		</div>

		<!-- Finish learn -->
		<div id="finish_learn" class="step">
			<p>
				<h4>Done</h4></p>
			<div class="message">
				<p>The user is now enrolled</p>
			</div>
			<div><a class="btn btn-colors" onclick="restart();" role="button"><b>Start again</b></a></div>
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
		 * shows the first step of enrollment (1 of 2),
		 * self executed at start
		 *****************************************************/
		(function() {
			currentTypeArea = document.getElementById('enrolltext1');
			currentQuote =
					'This is your first text for enrollment, these texts can be edited by you as you want. '+
					'But for better accuracy we suggest the initial texts to be at least 170 characters long.';
			highlight('pA1H', 'pA1');
			currentTypeArea.focus();
			nextFunction = enrollStep2; /** sets the next function */
		})();

		/*****************************************************
		 * called after finishing the first enrollment step;
		 * if first text is ok it shows the second step
		 *****************************************************/
		function enrollStep2() {
			if (fastCompareTexts(document.getElementById('enrolltext1').value, currentQuote) > 0.7) {
				/** at least 70% of the words should be typed correctly */
				swapContent('step_learn1', 'step_learn2', function() {
						currentTypeArea = document.getElementById('enrolltext2');
						currentQuote =
								'You can use these texts to make sure the user agrees to your terms '+
								'explicitly or to communicate important matters. You should make these two '+
								'texts as different as possible.';
						highlight('pA2H', 'pA2');
						currentTypeArea.focus();
				});
				/**
				 * first recording, takes the typing pattern for the
				 * last max 200 typed chars, typically about 170-190 chars
				 */
				learn(200, function(result){
					/** optionally, you can show the next step only now (on callback) IF you get result.success === 1 */
					console.log(result.success);
				})
				nextFunction = enrollFinish;
			} else {
				alert('Too many typos, please re-type');
			}
		}

		/*****************************************************
		 * called after finishing the second learning step;
		 * if second text is ok, shows the finish page;
		 *****************************************************/
		function enrollFinish() {
			if (fastCompareTexts(document.getElementById("enrolltext2").value, currentQuote) > 0.7) {
				/** at least 70% of the words should be typed correctly */
				swapContent('step_learn2', 'step_loading', function() {
						currentTypeArea.blur(); /** removes focus */
						currentQuote = "";
					});
				/**
				 * a second "hybrid" recording, takes the typing pattern
				 * for the last max 300 chars (this is a more complex
				 * pattern as it contains more text typed in both phases
				 * and it's proven to be better in matching)
				 */
				learn(300, function(result){
					console.log(result.success);
					/** optionally, you can show the next step only now (on callback) IF you get result.success === 1 */
					swapContent('step_loading', 'finish_learn', function() {
					});
				});
			} else {
				alert('Too many typos, please re-type');
			}
		}

		function learn(count, callback) {
			var tp = tdna.get(count);
			var params = {
				step: 'enroll',
				tp: tp,
				session_id: session_id
			}
			ajaxCall(params,callback)
		}

		/*****************************************************
		 * checks if a mobile device is trying to take the
		 * test and shows the "mobile" div
		 ****************************************************/
		mobileAndTabletCheck(function(result){
			if (result == true) {
				swapContent('step_learn1', 'mobile', function() {
					console.error('no mobile support yet.');
					nextFunction = null;
				});
			}
		});

		/** checks if Enter is pressed on text forms and calls the next function */
		initControls();

	</script>
</body>

</html>
