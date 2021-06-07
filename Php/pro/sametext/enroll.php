<?php

	require_once('./_init.php');

	if( !isset($_SESSION['username']) || !$_SESSION['username'] ) {
		header('Location: /');
	}

	$tdcp = new TypingDnaClient( getenv('TDNA_KEY'), getenv('TDNA_SECRET') );

    $user = $tdcp->checkuser( generateUsernameHash($_SESSION['username']) );

    if( $user->count >= 3 ) {
    	header('Location: /verify.php');
    }
?>
<?php require_once('./partials/header.php'); ?>
<?php require_once('./partials/navigation.php'); ?>
<div class="container center-container">
	<div class="col-xs-12 col-sm-6">
		<h4>Enrolling new user step <span id="enrollment-count">1</span> of 3: Please type the text below</h4>
		<p>
			<span class="highlighted" id="pAH"></span><span id="pA">We need you to type this text in order to make sure it is you.</span>
		</p>
		<textarea class="form-control" rows="1" cols="100" id="inputtextbox" oncopy="return false" onpaste="return false"
			placeholder="Type the text loaded above"></textarea>
		<div class="action-container">
			<button class="btn btn-colors btn-s disabled" id="add-enrollment">Add enrollment</button>
		</div>
	<div>
</div>
<script>

	let enrollmentCount = 1;
	const currentQuote = 'We need you to type this text in order to make sure it is you.'; /** the text to be typed at a each step, to be set independently */
	const tdna = new TypingDNA();

	tdna.addTarget('inputtextbox');

	const reset = () => {
		tdna.reset();
		document.querySelector('#inputtextbox').value = '';
	}

	const submit = () => {

		// php doesn't know how to interpret application/json POST request
		const formData = new FormData();

        formData.append('tp', tdna.getTypingPattern({ type: 1, text: currentQuote, targetId: 'inputtextbox' }));

		fetch('/api/enroll.php', {
				method: 'POST',
				body: formData
			})
			.then(r => r.json())
			.then( response => {

				if(enrollmentCount === 3) {
					window.location.reload();
					return;
				}

				document.querySelector("#enrollment-count").textContent = ++enrollmentCount;

				reset();
			})
	}

	document.addEventListener('DOMContentLoaded', () => {

		const typingVisualizer = new TypingVisualizer();
		const inputTextBox = document.querySelector('#inputtextbox');
		const submitButton = document.querySelector('#add-enrollment');

		typingVisualizer.addTarget([ 'inputtextbox' ]);

		submitButton.addEventListener('click', () => {
			submit();
		});

		inputTextBox.addEventListener('keyup', event => {

			const stackLength = getStackLen();
			const len = event.target.value.length || 0;

			document.querySelector('#pAH').innerHTML = currentQuote.slice(0, len);
			document.querySelector('#pA').innerHTML = currentQuote.slice(len);

			const fn = len > currentQuote.length * 0.9 && stackLength && stackLength > currentQuote.length * 0.9 ? 'remove': 'add';

			document.querySelector('#add-enrollment').classList[fn]('disabled');
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