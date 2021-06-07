<?php

	require_once('./_init.php');

	if( !isset($_SESSION['username']) || !$_SESSION['username'] ) {
		header('Location: /');
	}

	$tdcp = new TypingDnaClient( getenv('TDNA_KEY'), getenv('TDNA_SECRET') );

	$user = $tdcp->checkuser( generateUsernameHash($_SESSION['username']) );

	if( $user->count < 2 ) {
		header('Location: /enroll.php');
	}
?>
<?php require_once('./partials/header.php'); ?>
<?php require_once('./partials/navigation.php'); ?>
<div class="container">
	<div id="verify-container" class="col-xs-6">
		<h4>Please type the text below (typos allowed):</h4>
		<p>
			<span class="highlighted" id="pAH"></span><span id="pA">Do not display similar texts to the enrollment ones. For best results, it is mandatory to have completely different samples for verification.</span>
		</p>
		<div style="max-width:600px;">
		<textarea class="form-control" rows="5" cols="100" id="inputtextbox" name="inputtextbox" oncopy="return false" onpaste="return false"
			placeholder="Type the text loaded above"></textarea>
		</div>
		<div class="action-container">
			<button class="btn btn-colors btn-s disabled" id="verify-btn">Verify</button>
			<button class="btn btn-colors btn-s disabled" id="reset-btn">Reset</button>
		</div>
	</div>
	<div id="stats-container" class="col-xs-6">
		<h4>Result:</h4>
		<div class="panel panel-default panel-result">
			<div class="panel-body">
				<div class="name">TypingDNA result<span id="result" class="result-green"></span></div>
				<div class="name">Confidence<span id="confidence" class="result"></span></div>
				<div class="name">Device<span id="device" class="result"></span></div>
				<div class="name">Enrollments<span id="enrollments" class="result"></span></div>
				<div class="name">Score<span id="score" class="result"></span></div>
			</div>
		</div>
		<p id="enrolled-text">This typing pattern has been automatically enrolled, as the score > 90</p>
	</div>
</div>
<script>

	const currentQuote = 'Do not display similar texts to the enrollment ones. For best results, it is mandatory to have completely different samples for verification.'; /** the text to be typed at a each step, to be set independently */
	const tdna = new TypingDNA();

	const reset = () => {

		const inputTextBox = document.querySelector('#inputtextbox');

		tdna.reset();

		inputTextBox.value = '';
		inputTextBox.disabled = false;
		document.querySelector('#verify-btn').classList.add('disabled');
		document.querySelector('#reset-btn').classList.add('disabled');
		document.querySelector('#stats-container').style.opacity = 0.6;
		document.querySelector('#enrolled-text').style.opacity = 0;
	}

	const submit = () => {

		// php doesn't know how to interpret application/json POST request
		const formData = new FormData();
		const verifyBtn = document.querySelector('#verify-btn');
		const resetBtn = document.querySelector('#reset-btn');

        formData.append('tp', tdna.getTypingPattern({ type: 0, length: 200, targetId: 'inputtextbox' }));

        verifyBtn.classList.add('disabled');
        document.querySelector('#inputtextbox').disabled = true;

		fetch('/api/verify.php', {
				method: 'POST',
				body: formData
			})
			.then(r => r.json())
			.then( ({ enrolled, user, verify }) => {

				const resultElement = document.querySelector("#result");

				resultElement.textContent = verify.result === 1 ? 'true' : 'false';
				resultElement.classList.remove(...resultElement.classList);
				resultElement.classList.add(verify.result === 1 ? 'result-green' : 'result-red');

				document.querySelector("#confidence").textContent = verify.confidence;
				document.querySelector("#device").textContent = 'desktop';
				document.querySelector("#enrollments").textContent = user.count;
				document.querySelector("#score").textContent = verify.score;

				document.querySelector("#stats-container").style.opacity = 1;

				if(enrolled) {
					document.querySelector('#enrolled-text').style.opacity = 1;
				}

				resetBtn.classList.remove('disabled');
			})
	}

	document.addEventListener('DOMContentLoaded', () => {

		const typingVisualizer = new TypingVisualizer();
		const inputTextBox = document.querySelector('#inputtextbox');
		const verifyBtn = document.querySelector('#verify-btn');
		const resetBtn = document.querySelector('#reset-btn');

		typingVisualizer.addTarget([ 'inputtextbox' ]);

		resetBtn.addEventListener('click', () => {
			reset();
		});

		verifyBtn.addEventListener('click', () => {
			submit();
		});

		inputTextBox.addEventListener('keyup', event => {

			if (event.keyCode === 13) return;

			const stackLength = getStackLen();
			const len = event.target.value.length || 0;

			document.querySelector('#pAH').innerHTML = currentQuote.slice(0, len);
			document.querySelector('#pA').innerHTML = currentQuote.slice(len);

			const fn = len > currentQuote.length * 0.9 && stackLength && stackLength > currentQuote.length * 0.9 ? 'remove': 'add';

			verifyBtn.classList[fn]('disabled');
		});

		inputTextBox.addEventListener('keydown', event => {

			if (event.keyCode !== 13) return;

			event.preventDefault();

			const stackLength = getStackLen();

			if( stackLength && stackLength < currentQuote.length * 0.9) return;

			if(fastCompareTexts(inputTextBox.value, currentQuote) <= 0.7) {
				alert('Too many typos, please re-type');
				return;
			}

			submit();
		});

		inputTextBox.focus();
	});
</script>
<?php require_once('./partials/footer.php'); ?>