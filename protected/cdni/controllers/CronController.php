<?php

	class CronController extends GxController {
		
		/**
		 * Index action of CronController
		 */
		public function actionIndex() {
			$modelLocal = new EndpointLocal;
			$modelLocal = EndpointLocal::getLocalEndpoint();	
			
			switch ($modelLocal->endpoint_gateway_type_id) {
				case 1:	// DUMMY
						Log::logging("CRON: we do nothing => DUMMY CDN");
					break;
					
				case 2: // CISCO CDS
						Log::logging("CRON: WILL BE Update List Content Origins");
						Log::logging("CRON: WILL BE Update List Delivery Services");
					break;
				
			}
			
			Log::logging("CRON: WILL BE Update CDNi interconnections");
			
		}
	}
?>
