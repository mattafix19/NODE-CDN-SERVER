<?php

	class DummyCdnController extends GxController {
		
		public function accessRules() {
			return array(
				array('allow',  // allow logged in users to perform all actions
					'actions'=>array('index', 'route'),
					'users'=>array('*'),
				),
			);
		}
		
		/**
		 * index DummyCdn
		 * 
		 */
		public function actionIndex() {

			$modelLocal = EndpointLocal::getLocalEndpoint();
			$requestUrl = "http://". $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI'];
			
			//firstly we need get indetificator of contentOrigin 
			//indetificator is after .../dummyCdn/route/*indentificator*/pathToContent
			//ex.:	147.175.15.42/CDNi2/dummyCdn/route/rfqdn1/test.m3u8
			
			Log::logging("DEBUG: DummyCDN request: $requestUrl");
			
			$indetificator = '';
			$contentUrl = '';
			$requestFqdn = '';
			$protocol = '';
			
			$position = strpos($requestUrl, '/dummyCdn/');
			$identificatorContent = substr($requestUrl, $position+10);
			
			$explode = explode('/', $identificatorContent);
			foreach ($explode as $key => $value) {
				// first parameter is our indentificator
				if($indetificator == '') $indetificator = $value;
			}
			
			
			$contentUrl = substr($identificatorContent, strlen($indetificator));	// +1 becaouse '/'
			$requestFqdn = substr($requestUrl, 0, strpos($requestUrl, '/'.$indetificator.'/') + strlen($indetificator) + 1);
			
			$explode = explode('://', $requestFqdn);
			foreach ($explode as $key => $value) {
				if($protocol == ''){
					// first iteration
					$protocol = $value;
				} else {
					if ($requestFqdn == $protocol. '://' .$value) {
						// second iteration
						$requestFqdn = $value;
					} else {
						// error at url => can not exist two times at URL '://'
						die();
					}
				}
			}
			
			$protocol = $protocol . '://';			
//			echo $protocol. '<br />';
//			echo $requestFqdn. '<br />';
//			echo $contentUrl;
			
			
			$listOrigin = EndpointLocal::getListContentOrigin();
			// we can handle something, what we havent got at content origin
			// our content origin is at LocalAssociateOriginToFqdn
			$modelsAction = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
			foreach ($modelsAction as $keyModelAction => $valueModelAction) {
					
				// $paramas => array[]['name'] array[]['originServer'] array[]['fqdn']
				$params = unserialize( $valueModelAction->params );
				
				$requestedContetOriginExist = FALSE; 
				//Log::logging('DEBUG: ' . print_r($params, TRUE));
				foreach ($params as $keyPar => $valuePar) {
					// we find for match for ex.: 'fqdn' => '147.175.15.42/CDNi2/dummyCdn/rfqdn1'
					
					//Log::logging('DEBUG: ' . $valuePar['fqdn'] . ' ' . $requestFqdn);
					
					if( $valuePar['fqdn'] == $requestFqdn ) {
						// if we have got match, we can handle request, else we stop app. 
						// start logic of redirecting
						
						$requestedContetOriginExist = TRUE;
						
						$fqdn = '';
						$redirectTo = '';
						
						$remoteAdd = $_SERVER['REMOTE_ADDR'];
						$remoteAddLong = ip2long($remoteAdd);
								
						
						// firstly find footprint between own
						
						$arrayFootprints = Footprint::model()->findAllByAttributes( array('endpoint_id' => $modelLocal->id ));
						foreach ($arrayFootprints as $keyFootprit => $footprint) {
						
							if($fqdn != '') continue;
							
							if($remoteAddLong >= $footprint->subnet_num && $remoteAddLong < ($footprint->subnet_num + pow(2, 32 - $footprint->prefix) )){
								// 	IP address match ... request will be handle by dummyCdn ... aka redirect to origin server
								$fqdn = $valuePar['originServer'];
							}
						}
						
						
						if($fqdn == ''){
							// still we dont know, who handle request
							// secondly find footprint between interconnections.
							//	get endpointRemotes wich are downstream CDN.
							$modelsEndRe = EndpointRemote::model()->findAllByAttributes(array('endpoint_status_id' => '6'));
							foreach ($modelsEndRe as $keyEndRe => $modelEndRe) {

								$arrayFootprints = Footprint::model()->findAllByAttributes( array('endpoint_id' => $modelEndRe->id ));
								foreach ($arrayFootprints as $keyFootprit => $footprint) {

									if($fqdn != '') continue;
									//Log::logging('iteration 2 ' . $remoteAddLong . ' > ' . $footprint->subnet_num . ' && ' . $remoteAddLong . ' < ' . ($footprint->subnet_num + pow(2, 32 - $footprint->prefix) ) );
									if($remoteAddLong >= $footprint->subnet_num && $remoteAddLong < ($footprint->subnet_num + pow(2, 32 - $footprint->prefix) )){
										// 	IP address match 
										//	now, we have to fing fqdn assign to content origin in remote CDN
										$modelCdniAction = CdniAction::model()->findByAttributes(array('endpoint_id' => $modelEndRe->id , 'action' => 'RemoteAssociateOriginToFqdn'));
										$unserializepParams = array();
										$unserializepParams = unserialize($modelCdniAction->params);
										
										foreach ($unserializepParams as $keyParams => $valueParams) {
											if ($valuePar['name'] == $valueParams['name'] && $valuePar['originServer'] == $valueParams['originServer'] ) {
												// is equal RemoteAssociateOriginToFqdn and LocalAssociateOriginToFqdn with different fqdn
												$fqdn = $valueParams['fqdn'];
											}
											
										}
									}
								}
							}
						}
						
						
						if ( $fqdn == '' ){
							// we still dont know who handle requset
							// any footprint dont match with requested IP address
							// easily we redirect to origin
							$fqdn = $valuePar['originServer'];
						}
						
						
						$redirectTo = 'http://' . $fqdn . $contentUrl;
				
						//echo "We redirect to: " . $redirectTo;
						
						Log::logging("DEBUG: DummyCDN response: $redirectTo");
						
						header( 'Location: '. $redirectTo, true, 302 ) ;
						
					} 	
				}

				if(!$requestedContetOriginExist) {
					Log::logging('ERROR: DummyCDN havent got a requested Content Origin.');
					die();
				}
			}
			
			/*  OLD 
			if(!empty($_GET['url'])){
				$fqdn = '';
				$redirectTo = '';
				
				$remoteAdd = $_SERVER['REMOTE_ADDR'];
				$remoteAddLong = ip2long($remoteAdd);
				
				
				// listOrigin contain list of origin content wich Dummy CDN service it.
				$listOrigin = EndpointLocal::getListContentOrigin();
				// always will be one entry
			
				
				//	choose CDN based on footprints
				//	get endpointRemotes wich are downstream CDN.
				$models = EndpointRemote::model()->findAllByAttributes(array('endpoint_status_id' => '6'));
				foreach ($models as $keyModel => $model) {

					$arrayFootprints = Footprint::model()->findAllByAttributes( array('endpoint_id' => $model->id ));
					foreach ($arrayFootprints as $keyFootprit => $footprint) {
					
						if($fqdn != '') continue;
						
						if($remoteAddLong > $footprint->subnet_num && $remoteAddLong < ($footprint->subnet_num + pow(2, 32 - $footprint->prefix) )){
							// 	IP address match 
							//	now, we have to fing fqdn assign to content origin in remote CDN
							
							$modelCdniAction = CdniAction::model()->findByAttributes(array('endpoint_id' => $model->id , 'action' => 'RemoteAssociateOriginToFqdn'));
		
							$unserialize = array();
							$unserialize = unserialize($modelCdniAction->params);
							$fqdn = $unserialize['fqdn'];
						}
					}
				}
				
				if($fqdn == ''){
					$fqdn = $listOrigin[0]['originServer'];
				} 
				
				$redirectTo = 'http://' . $fqdn . $_GET['url'];
				
				echo "We redirect to: " . $redirectTo;
				
				//Log::logging("DUMMY CDN redirect request to http://cdn.closerit.com" . $_GET['url']);
				
				
				
				//header( 'Location: '. $redirectTo, true, 301 ) ;
				//header( 'Location: http://rfqdn6.cdn.ab.sk'. $_GET['url'], true, 301 ) ;
				die();
			}*/
			
			//$redirectTo = 'http://' . $fqdn . $_GET['url'];
				
			//echo "We redirect to: " . $redirectTo;
			
			//header( 'Location: '. $redirectTo, true, 301 ) ;
			
		}


		/**
		 * 
		 */
		public function actionRoute(){
			
			Log::logging("DUMMY CDN comes REQUEST 'ACTION ROUTE'");
		}
		
	}

?>