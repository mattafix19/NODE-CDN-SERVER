<?php

	class GeoLocationController extends GxController {
		
		public function accessRules() {
			return array(
				array('allow',  // allow logged in users to perform all actions
					'actions'=>array('index'),
					'users'=>array('*'),
				),
			);
		}
		
		
		/**
		 * 
		 */
		public function actionIndex() {
			Log::logging("Comes request: " . "http://". $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
			Log::logging("Raw post data of request:" . "php://input");
		}
	}

?>