<?php

	class UrlTranslationServiceController extends GxController {
		
		public function accessRules() {
			return array(
				array('allow',  // allow logged in users to perform all actions
					'actions'=>array('index'),
					'users'=>array('*'),
				),
			);
		}
		
		/**
		 * index
		 * 
		 */
		public function actionIndex() {
			
			$httpRequestBody = '<?xml version="1.0" encoding="UTF-8"?>
<SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:CDNUTNS1="http://cisco/CDS/CDNUrlTranslation" xmlns:CDNUTNS2="http://schemas.cisco/CDS/CDNUrlTranslation/Schema"><SOAP-ENV:Body><CDNUTNS2:UrlTranslationRequest><ClientIP>178.41.176.189</ClientIP><Url>http://rfqdn3.cdn.ab.sk/hls/mototrip2013all.m3u8</Url><CustomerId></CustomerId><CDNName></CDNName><SignUrl>false</SignUrl></CDNUTNS2:UrlTranslationRequest></SOAP-ENV:Body></SOAP-ENV:Envelope>';
			
			$httpRequestBody = http_get_request_body();
			file_put_contents(__DIR__."/xml/UrlTranslationRequest.xml",http_get_request_body());
			
			$requestIp = '';			// ip address of consumer
			$requestIpLong = '';		// ip address of consumer in long format
			$requestUrl = '';			// full requset url
			$protocol = '';				// protocol that is used in request
			$extension = '';			// extension of requsted content
			$fqdnWithContent = '';		// help variable
			$fqdn = '';					// will be resault fqdn. On this fqdn we will make redirect
			$content = '';				// piece of URL that point on content
			$originServer = '';			// url origin server
			$originName = '';			// name of origin server which have content
			$endpointRemoteArray = ''; 	// array of endpointRemotes that have footprints which contains requsted IP address
			
			
			$positionStartClientIpTag = strpos($httpRequestBody, '<ClientIP>');
			$positionEndClientIpTag = strpos($httpRequestBody, '</ClientIP>');
			
			$positionStartUrlTag = strpos($httpRequestBody, '<Url>');
			$positionEndUrlTag = strpos($httpRequestBody, '</Url>');
			
			$requestIp = substr($httpRequestBody, $positionStartClientIpTag+10, $positionEndClientIpTag-$positionStartClientIpTag-10);
			$requestUrl = substr($httpRequestBody, $positionStartUrlTag+5, $positionEndUrlTag-$positionStartUrlTag-5);
			
			Log::logging("DEBUG: UrlTranslationService request: $requestUrl");
			
			$requestIpLong = ip2long($requestIp);
			
			if(filter_var($requestIp, FILTER_VALIDATE_IP)){
						
				$explode = explode('://', $requestUrl);
				foreach ($explode as $key => $value) {
					if($protocol == ''){
						// first iteration
						$protocol = $value;
					} else {
						if ($requestUrl == $protocol. '://' .$value) {
							// second iteration
							$fqdnWithContent = $value;
						} else {
							// error at url => can not exist two times at URL '://'
							die();
						}
					}
				}
				
				$protocol = $protocol . '://';
				
				$explode = explode('/', $fqdnWithContent);
				foreach ($explode as $key => $value) {
					if($fqdn == ''){
						// this is first iteration
						$fqdn = $value;
						continue;
					}
				}
				
				$content = substr($fqdnWithContent, strlen($fqdn));
				
				
				$explode = explode('.', $content);
				foreach ($explode as $key => $value) {
					$extension = $value;	// in the last one iteration variable $extension will by pull in with right string that contain extension of requsted content
				}		
				
				
				
		//		echo $requestIp . '<br />';
		//		echo $requestUrl . '<br />';
		//		echo $fqdnWithContent . '<br />';
		//		echo $content . '<br />';
		//		echo $fqdn . '<br />';
		//		echo $protocol . '<br />';
		//		echo $extension . '<br />';
		
		
				// first, we have to find match in LocalAssociateOriginToFqdn 
				//------------------------------------------------------------------------------
				// TUTO JE POKRACUJEM
				//------------------------------------------------------------------------------
				$modelsAction = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
				if ( count($modelsAction) > 1 ) {
					Log::logging('ERROR: Count of LocalAssociateOriginToFqdn models is great than 1 ');
					die();
				}
				
				// this foreach have to got only one iteration
				foreach ($modelsAction as $keyModelAction => $valueModelAction) {
					// $paramas => array[]['name'] array[]['originServer'] array[]['fqdn']
					$params = unserialize($valueModelAction->params);
					
					foreach ($params as $keyPar => $valuePar) {
						if ( $valuePar['fqdn'] == $fqdn ){
							$originServer = $valuePar['originServer'];
							$originName = $valuePar['name'];
						} 
					}
					
					// at this position we have got name and originUrl of origin server used by fqdn from requestedUrl
					
					//  second step is find footprint between interconnections
					//	get endpointRemotes wich are downstream CDN.
					$modelsEndRe = EndpointRemote::model()->findAllByAttributes(array('endpoint_status_id' => '6'));
					foreach ($modelsEndRe as $keyEndRe => $modelEndRe) {
	
						$arrayFootprints = Footprint::model()->findAllByAttributes( array('endpoint_id' => $modelEndRe->id ));
						foreach ($arrayFootprints as $keyFootprit => $footprint) {
							
							if($requestIpLong >= $footprint->subnet_num && $requestIpLong < ($footprint->subnet_num + pow(2, 32 - $footprint->prefix) )){
								// 	IP address match 
								//	we only get the id of remote connection which footprints match with requeste IP address. 
								$endpointRemoteArray[] = array(
									'idEndpointRemote' => $modelEndRe->id, 
									'subnet_num' => $footprint->subnet_num, 
									'prefix' => $footprint->prefix,
									'fqdn' => '',
								);
							}
						}
					}
					
					
					if( count($endpointRemoteArray) > 0){
						// at this moment, consumer IP address is match with some footpritns from interconnections.
						
						foreach ( $endpointRemoteArray as $key => $value ) {
							
							$modelCdniAction = CdniAction::model()->findByAttributes(array('endpoint_id' => $value['idEndpointRemote'] , 'action' => 'RemoteAssociateOriginToFqdn'));
							$unserializepParams = array();
							$unserializepParams = unserialize($modelCdniAction->params);
							
							foreach ($unserializepParams as $keyParams => $valueParams) {
								
								if ($originName == $valueParams['name'] && $originServer == $valueParams['originServer'] ) {
									// is equal RemoteAssociateOriginToFqdn and LocalAssociateOriginToFqdn with different fqdn
									$endpointRemoteArray[$key]['fqdn'] = $valueParams['fqdn'];
								}
								
							}
							
						}
						
						// at this point is possible, so $endpointRemoteArray contain more than one remote CDN that can handle requst 
						// therefor we choice one that have footprint more specified.
						$hihterPrefix = 0;
						foreach ($endpointRemoteArray as $key => $value) {
							if( $value['fqdn'] != '' ){
								if( $value['prefix'] > $hihterPrefix ){
									$hihterPrefix = $value['prefix'];
									$fqdn = $value['fqdn'];
								}
							}
						}
						
						
					} else {
						// we havent got any match we have to handle requst, therefore we redirect requste on some SE of our CDN 
						
						
					}
					
										
					//this is time, where we have to set up $fqdn
					
					if($fqdn == '') {
						Log::logging('ERROR: UrlTranslationService is not setUp fqdn!');
						die();
					} else {
						
						//we can return XML with translated URL
						Header('Content-type: text/xml');
						
						$url = $protocol . $fqdn . $content;
						
						Log::logging("DEBUG: UrlTranslationService response: $url");
						
						$url = htmlspecialchars($url);
						
						echo '
							<?xml version="1.0" encoding="UTF-8"?>
							<SOAP-ENV:Envelope 	xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
												xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" 
												xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
												xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
												xmlns:CDNUTNS1="http://cisco/CDS/CDNUrlTranslation" 
												xmlns:CDNUTNS2="http://schemas.cisco/CDS/CDNUrlTranslation/Schema">
								
								<SOAP-ENV:Body>
									<CDNUTNS2:UrlTranslationResponse>
										<TranslatedUrl>'.$url.'</TranslatedUrl>
										<SignUrl>false</SignUrl>
									</CDNUTNS2:UrlTranslationResponse>
								</SOAP-ENV:Body>
							</SOAP-ENV:Envelope>';
						die();
					}
					
								
					
				}	
				
			} else {
				// natvrdo dame jeden so service engine
				echo "ERROR";
			}
			
			
			
			
		/*	Header('Content-type: text/xml');

			$url = htmlspecialchars('147.175.15.42/CDNi2/dummyCdn/route/test/hls/mototrip2013all.m3u8');
		
			echo '
			<?xml version="1.0" encoding="UTF-8"?>
			<SOAP-ENV:Envelope 	xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" 
								xmlns:SOAP-ENC="http://schemas.xmlsoap.org/soap/encoding/" 
								xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" 
								xmlns:xsd="http://www.w3.org/2001/XMLSchema" 
								xmlns:CDNUTNS1="http://cisco/CDS/CDNUrlTranslation" 
								xmlns:CDNUTNS2="http://schemas.cisco/CDS/CDNUrlTranslation/Schema">
				
				<SOAP-ENV:Body>
					<CDNUTNS2:UrlTranslationResponse>
						<TranslatedUrl>'.$url.'</TranslatedUrl>
						<SignUrl>false</SignUrl>
					</CDNUTNS2:UrlTranslationResponse>
				</SOAP-ENV:Body>
			</SOAP-ENV:Envelope>';*/
		}
	}


	
?>