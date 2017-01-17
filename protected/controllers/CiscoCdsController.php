<?php

	class CiscoCdsController extends GxController {
		
		/**
		 * 
		 */
		public function actionIndex() {
			$url = "Comes request: " . "http://". $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
			file_put_contents(__DIR__."/url.txt",$url . ' Date:' . time());
			
			file_put_contents(__DIR__."/post.txt",serialize($_POST));
			
			file_put_contents(__DIR__."/headers.txt",serialize(apache_request_headers()));
			Log::logging('DEBUUG: ' . $url);
		}
		
		
	}

?>