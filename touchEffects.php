<!DOCTYPE html>
<!-- Conditional comment for mobile ie7 http://blogs.msdn.com/b/iemobile/ -->
<!--[if IEMobile 7 ]>		<html class="no-js iem7"> <![endif]-->
<!--[if (gt IEMobile 7)|!(IEMobile)]><!--> <html class="no-js"> <!--<![endif]-->
	<head>
		<meta charset="utf-8">
		
		<title>TouchEffects</title>
		
		<meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no">
		
		<link rel="stylesheet" href="css/reset.min.css">
		<link rel="stylesheet" href="css/touchtest.css">
		<link rel="stylesheet" href="css/touchEffectsTest.css">
		
		<script src="js/modernizr.custom.js"></script>
		<script src="js/jquery.min.js"></script>
	</head>
	
	<body>
		
	<ul class="swipeable">
		<?php
		$num_items = 3;
		for ($i=0; $i<$num_items; $i++) {
			?>
			<li class="swipeSleeve">
				<div class="swipeContainer">
					<div class="swipeContent">
						<div class="content1">
							this is li #<?php echo($i);?>-1
						</div>
						<div class="content2">
							this is li #<?php echo($i);?>-2
						</div>
					</div>
				</div>
			</li>
			<?php
		}
		?>
	</ul>
		<div class="feedback" id="log"></div>
		
		<script src="js/jquery.touchEvents.js"></script>
		<script src="js/initTouchEffects.js"></script>
	</body>
</html>

