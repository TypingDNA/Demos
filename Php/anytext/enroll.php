<?php

	require_once('./_init.php');

	if( !isset($_SESSION['username']) || !$_SESSION['username'] ) {
		header('Location: /');
	}

	$tdcp = new TypingDnaClient( getenv('TDNA_KEY'), getenv('TDNA_SECRET') );

    $user = $tdcp->checkuser( generateUsernameHash($_SESSION['username']) );

    if( $user->count >= 2 ) {
    	header('Location: /verify.php');
    }
?>
<?php require_once('./partials/header.php'); ?>
<?php require_once('./partials/navigation.php'); ?>
<div class="container center-container">
	<div class="col-xs-12 col-sm-6">
		<h4>Enrolling new user <span id="enrollment-count">1</span>/3: Please type the text below</h4>
		<p>
			<span id="pAH" class="highlighted"></span><span id="pA"></span>
		</p>
		<textarea class="form-control" rows="5" cols="100" id="inputtextbox" oncopy="return false" onpaste="return false"
			placeholder="Type the text loaded above"></textarea>
		<div class="action-container">
			<button class="btn btn-colors btn-s disabled" id="add-enrollment">Add enrollment</button>
		</div>
	<div>
</div>
<script>

	let enrollmentCount = 0;
	const tdna = new TypingDNA();
	const quotes = [
		'Life is not a matter of place, things or comfort; rather, it concerns the basic human rights of family, country, justice and human dignity.',
		'Don Knotts was a really big influence, especially on the Steve Allen show. I mean, look at the guy, his entire life is in his face.',
		'For me, the original play becomes an historical document: This is where I was when I wrote it, and I have to move on now to something else.'
	]

	tdna.addTarget('inputtextbox');

	const getCurrentQuote = () => quotes[enrollmentCount]

	const reset = () => {
		tdna.reset();
		document.querySelector('#inputtextbox').value = '';
		document.querySelector('#inputtextbox').focus();
		document.querySelector('#pAH').innerHTML = '';
		document.querySelector('#pA').innerHTML = getCurrentQuote();
	}

	const submit = () => {

		// php doesn't know how to interpret application/json POST request
		const formData = new FormData();

        formData.append( 'tp', tdna.getTypingPattern({ type: 0, length: 200, targetId: 'inputtextbox' }) );

		fetch( '/api/auto.php', {
				method: 'POST',
				body: formData
			})
			.then( r => r.json() )
			.then( response => {

				// reload current page and let php redirect to verify.php page
				if( enrollmentCount === quotes.length - 1 ) {
					window.location.reload();
					return;
				}

				document.querySelector("#enrollment-count").textContent = (++enrollmentCount) + 1;

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

			document.querySelector('#pAH').innerHTML = getCurrentQuote().slice(0, len);
			document.querySelector('#pA').innerHTML = getCurrentQuote().slice(len);

			const fn = len > getCurrentQuote().length * 0.9 && stackLength && stackLength > getCurrentQuote().length * 0.9 ? 'remove': 'add';

			document.querySelector('#add-enrollment').classList[fn]('disabled');
		});

		inputTextBox.addEventListener('keydown', event => {

			if (event.keyCode !== 13) return;

			event.preventDefault();

			const stackLength = getStackLen();

			if( stackLength && stackLength < getCurrentQuote().length * 0.9) return;

			if(fastCompareTexts(inputTextBox.value, getCurrentQuote()) <= 0.7) {
				alert('Too many typos, please re-type');
				return;
			}

			submit();
		});

		reset();
	});
</script>
<?php require_once('./partials/footer.php'); ?>