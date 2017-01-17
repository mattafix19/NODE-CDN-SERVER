<?php 
	/**
	 * 
	 */
 	
	class SoapController extends CController {
		
		function __construct() {
			
		}
		
		public function actions()
	    {
	    	
			#if( $_SERVER['CLIENT_ADDR'] == "147.175.15.42"){
			#	
			#}
			$model = EndpointLocal::model()->findByAttributes(array('endpoint_type_id'=>1));
			
	        return array(
	            'quote'=>array(
	                'class'=>'CWebServiceAction',
	                'serviceOptions'=>array(
	                	#'soapVersion' => SOAP_1_1,
	                	'wsdlUrl' => $model->url . '/soap/quote',
	                	'serviceUrl' => $model->url . '/soap/quote/ws/1',
					),
	            ),
	        );
	    }
		
		/**
		* @param string $symbol
		* @return string cost
		* @soap
		*/
		public function getPrice($symbol){
			//return $symbol;
			$prices=array('IBM'=>100, 'GOOGLE'=>350);
			return isset($prices[$symbol]) ? $prices[$symbol] : 0;
		}
		
		/**
		* params contain value for EndpointRemote model
		* @param string 	$name
		* @param string 	$url
		* @param integer 	$priority
		* @param integer 	$endpoint_type_id
		* @param integer 	$endpoint_status_id
		* @param integer	$endpoint_gateway_type_id
		* @param string		$url_translator
		* @return string 	status
		* @soap
		*/
		public function setOffer($name, $url, $priority, $endpoint_type_id, $endpoint_status_id, $endpoint_gateway_type_id, $url_translator){
			$model = new EndpointRemote;
			$model->name = $name;
			$model->url = $url;
			$model->priority = $priority;
			$model->endpoint_status_id = $endpoint_status_id;
			$model->endpoint_type_id = $endpoint_type_id;
			$model->endpoint_gateway_type_id = $endpoint_gateway_type_id;
			$model->url_translator = $url_translator;
			if($model->save()){
				return "OK";
			} else {
				return "ERROR SAVE";
			}
		}
		
		/**
		 * create footprint
		 * @param string 	$name
		 * @param string 	$url
		 * @param integer 	$subnet_num
		 * @param integer	$mask_num
		 * @param string	$subnet_ip
		 * @param integer	$prefix
		 * @soap
		 */
		public function setFootprints($name, $url, $subnet_num, $mask_num, $subnet_ip, $prefix){
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			if($model == null){
				return 'NOT FIND';
			} else {
				$modelFootprint = new Footprint;
				$modelFootprint->endpoint_id = $model->id;
				$modelFootprint->subnet_num = $subnet_num;
				$modelFootprint->mask_num = $mask_num;
				$modelFootprint->subnet_ip = $subnet_ip;
				$modelFootprint->prefix = $prefix;
				if($modelFootprint->save()){
					return 'OK';
				} else {
					return 'ERROR SAVE';
				}
			}
		}
		
		/**
		 * getCapability
		 * @param string	$name
		 * @param string	$url
		 * @param array 	$capabilities
		 * @soap
		 */
		public function setCapabilities($name, $url, $capabilities){
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			foreach ($capabilities as $key => $value) {
				$modelCapability = new EndpointCapability;
				//Log::logging('DEBUG:: test:=> ' . serialize($value));
				
				$modelCapability->endpoint_id = $model->id;
				
				$modelCapability->capability_id = $value;
				$modelCapability->save();
				
			}
			
			
			
			
/*			$modelLocal = EndpointLocal::getLocalEndpoint();
			$modelCapabilities = EndpointCapability::model()->findAllByAttributes(array('endpoint_id' => $modelLocal->id));
			$capabilities = array();
			
			foreach ($modelCapabilities as $key => $value) {
				$capabilities[] = $value->capability_id;
			}
			
			return $capabilities;*/
		}
		
		/**
		 * reset offer after reject
		 * @param string $name
		 * @param string $url
		 * @return string status
		 * @soap
		 */
		public function reSetOffer($name, $url){
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			if($model == null){
				return 'NOT FIND';
			} else {
				$model->endpoint_status_id = 1;
				if($model->save()){
					return 'OK';
				} else {
					return 'ERROR SAVE';
				}
			}
		}
		
		/**
		 * accept offer based on name and url because ID can be different
		 * @param string $name
		 * @param string $url
		 * @return string status
		 * @soap
		 */
		public function acceptOffer($name, $url){
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			if($model == null){
				return 'NOT FIND';
			} else {
				$model->endpoint_status_id = 5; // acceptOffer show as UP
				if($model->save()){
					return 'OK';
				} else {
					return 'ERROR SAVE';
				}
			}
		}
		
		/**
		 * Reject offer
		 * @param string $name
		 * @param string $url
		 * @return string status
		 * @soap
		 */
		public function rejectOffer($name, $url){
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			if($model == null){
				return 'NOT FIND';
			} else {
				$model->endpoint_status_id = 4;
				if($model->save()){
					return 'OK';
				} else {
					return 'ERROR SAVE';
				}
			}
		}
		
		
		/**
		 * Delete interconnection
		 * @param string 	$name
		 * @param string 	$url
		 * @return string 	status
		 * @soap
		 */
		public function deleteInterconnection($name, $url){
				
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			$modelLocal = EndpointLocal::getLocalEndpoint();
			
			
			switch ($modelLocal->endpoint_gateway_type_id) {
				case 1: // DUMMY
					$contentOrigins = array();	
					
					$modelsAction = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
					// this foreach have to got only one iteration, becouse at time have to exist only one entry of LocalAssociateOriginToFqdn 
					// copy old data to new array
					foreach ($modelsAction as $key => $value) {
						$params = unserialize($value->params);
						
						if(!empty($params['idRemoteEndpoint'])) {
							if( ! $params['idRemoteEndpoint'] == $modelEndpointRemote->id ){
								// only copy data that no create with interconnection, that we now deleting;
								Log::logging("DEBUG: 5");
								$contentOrigins[] = array(
									'name' => $params['name'],
									'originServer' => $params['originServer'],
									'fqdn' => $params['fqdn'],
									'idRemoteEndpoint' => $params['idRemoteEndpoint'],
								);
							}
						}
						
					}
					// delete old entry
					foreach ($modelsAction as $key => $value) {
						$modelAction = CdniAction::model()->findByPk($value->id);
						$modelAction->delete();	
					}
					
					// save
					CdniAction::addAction(0, 'LocalAssociateOriginToFqdn', $contentOrigins);
					$models=CdniAction::model()->findAllByAttributes(array('endpoint_id' => $model->id));
					foreach ($models as $key => $value) {
						$value->delete();
					}
					
					break;
				case 2:	// CISCO CDS
					$cisco = new CiscoCDS;
					$cisco->removeInterconnection($model->id);
					break;
				
				default:
					
					break;
			}
			CdniAction::removeAction($model->id);
			$model->delete();
		}
		
		/**
		 * Logging
		 * @param string	$message
		 * @return string	status
		 * @soap
		 */
		public function logging($message){
			Log::logging($message);
			return 'OK';
		}
		
		/**
		 * CdniAction::addAction
		 * @param string	$name
		 * @param string	$url
		 * @param string	$actionName
		 * @param array		$params
		 * @return bool		
		 * @soap
		 */
		public function addCdniAction($name, $url, $actionName, $params){
			
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			
			CdniAction::addAction($model->id, $actionName, $params);
			
			return TRUE;
		}
		
		
		/**
		 * Create Content Origin for DummyCdn
		 * @param string	$name
		 * @param string	$url
		 * @param string 	$nameContentOrigin
		 * @param string	$originServer
		 * @param string	$fqdn
		 * @return bool   	
		 * @soap
		 */
		public function createDummyContentOrigin($name, $url, $nameContentOrigin, $originServer, $fqdn){
			
			$contentOrigins = array();
			$modelEndpointRemote = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			
			// find old cashed info
			$models = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
			
			if(count($models) != 0){
				
				// copy old data to new array
				foreach ($models as $key => $value) {
	
					$params = unserialize($value->params);
					foreach ($params as $keyPar => $valuePar) {
						$contentOrigins[] = array(
							'name' => $valuePar['name'],
							'originServer' => $valuePar['originServer'],
							'fqdn' => $valuePar['fqdn'],
							'idRemoteEndpoint' => $valuePar['idRemoteEndpoint'],
						);
					}
					
				}
				// delete old entry
				foreach ($models as $key => $value) {
					$model = CdniAction::model()->findByPk($value->id);
					$model->delete();	
				}
			}
			
			// create new 
			$contentOrigins[] = array(
					'name' => $nameContentOrigin,
					'originServer' => $originServer,
					'fqdn' => $fqdn,
					'idRemoteEndpoint' => $modelEndpointRemote->id,
				);
			
			// save
			CdniAction::addAction(0, 'LocalAssociateOriginToFqdn', $contentOrigins);
			$params = array('fqdn' => $fqdn, );
			CdniAction::addAction($modelEndpointRemote->id, 'usedFqdn', $params);
			
			if( count($models) < count($contentOrigins) ) {
				return TRUE;
			} else {
				return FALSE;
			}
			
		}
		
		
		/**
		 * Create Content Origin in CISCO CDS
		 * @param string	$name
		 * @param string	$url
		 * @param string 	$nameContentOrigin
		 * @param string	$originServer
		 * @param string	$fqdn
		 * @return string   $idContentOrigin
		 * @soap
		 */
		public function createContentOrigin($name, $url, $nameContentOrigin, $originServer, $fqdn){
			$cisco = new CiscoCDS;
			$idContentOrigin = '';
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			$idContentOrigin = $cisco->createContentOrigin($nameContentOrigin, $originServer, $fqdn);
			if(!empty($idContentOrigin)){
				$params = array('idContentOrigin' => $idContentOrigin, );
				CdniAction::addAction($model->id, 'createContentOrigin', $params);
				$params = array('fqdn' => $fqdn, );
				CdniAction::addAction($model->id, 'usedFqdn', $params);
			}
			return (string)$idContentOrigin;
		}
		
		/**
		 * Create Delivery Service in CISCO CDS
		 * @param string	$name
		 * @param string	$url
		 * @param string 	$nameDeliveryService
		 * @param string	$contentOriginID
		 * @return string	$idDeliveryService
		 * @soap
		 */
		public function createDeliveryService($name, $url, $nameDeliveryService, $contentOriginID){
			$cisco = new CiscoCDS;
			$idDeliveryService = '';
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			
			$idDeliveryService = $cisco->createDeliveryService($nameDeliveryService, $contentOriginID);
			if(!empty($idDeliveryService)){
				$params = array('idDeliveryService' => $idDeliveryService, );
				CdniAction::addAction($model->id, 'createDeliveryService', $params);
			}
			return $idDeliveryService;
		}
		
		/**
		 * Assign Service Engine to Delivery Service in CISCO CDS
		 * @param string	$name
		 * @param string	$url
		 * @param string 	$deliveryServiceID
		 * @param string	$contentAcquirer
		 * @return bool		$status
		 * @soap
		 */
		public function assignSEs($name, $url, $deliveryServiceID, $contentAcquirer){
			$cisco = new CiscoCDS;
			$status = FALSE;
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			
			$status = $cisco->assignSEs($deliveryServiceID, $contentAcquirer);
			if($status){
				$params = array('contentAcquirer' => $contentAcquirer, );
				CdniAction::addAction($model->id, 'assignSEs', $params);
				return TRUE;
			}
			return FALSE;
		}
		
		/**
		 * getListFqdn
		 * this fucntion is hack for get list fqdn for content origin. Function get only unused fqdn
		 * @return array 	$fqdn
		 * @soap
		 */
		public function getListFqdn(){
			$fqdn = array();
			$modelLocal = EndpointLocal::getLocalEndpoint();
			switch ($modelLocal->endpoint_gateway_type_id) {
				case 1:	// DUMMY
					if($modelLocal->url == "http://147.175.15.42/CDNi2"){
						$fqdn[] = array('fqdn' => '147.175.15.42/CDNi2/dummyCdn/rfqdn2' );
						$fqdn[] = array('fqdn' => '147.175.15.42/CDNi2/dummyCdn/rfqdn3' );
						$fqdn[] = array('fqdn' => '147.175.15.42/CDNi2/dummyCdn/rfqdn4' );
					}
					break;
				
				case 2:	// CISCO
					if($modelLocal->url == "http://147.175.15.41/CDNi2"){
						// CISCO CDN ON SLOVAKIA 
						// have assigned domain
						$fqdn[] = array('fqdn' => 'rfqdn6.cdn.ab.sk' );
						$fqdn[] = array('fqdn' => 'rfqdn1.rfqdns.cdn.ab.sk' );
						$fqdn[] = array('fqdn' => 'rfqdn2.rfqdns.cdn.ab.sk' );
						$fqdn[] = array('fqdn' => 'rfqdn3.rfqdns.cdn.ab.sk' );
						//$fqdn[] = array('fqdn' => 'rfqdn1.cdn.rostecky.sk' );
						//$fqdn[] = array('fqdn' => 'rfqdn2.cdn.rostecky.sk' );
						//$fqdn[] = array('fqdn' => 'rfqdn3.cdn.rostecky.sk' );
					}
					if($modelLocal->url == "http://147.175.15.90/CDNi2"){
						// CISCO CDN ON HOLLAND 
						// have assigned domain
						$fqdn[] = array('fqdn' => 'rfqdn5.cdn.rostecky.sk' );
						$fqdn[] = array('fqdn' => 'rfqdn6.cdn.rostecky.sk' );
						$fqdn[] = array('fqdn' => 'rfqdn7.cdn.rostecky.sk' );
					}
					
					
					break;
				
				default:
					
					break;
			}
			
			//	filter fqdn 
			foreach ($fqdn as $key => $value) {
				$criteria=new CDbCriteria;
				$criteria->addSearchCondition('action', 'usedFqdn');
				$models=CdniAction::model()->findAll($criteria);
				
			//	Log::logging("DEBUG:: " . $key . " :: " . $value);
				
				foreach ($models as $keyModel => $model) {
					
					$usedFqdn = unserialize($model->params);	
					
				//	Log::logging("DEBUG::: " . $keyModel . " :: " . $usedFqdn['fqdn']);
					
					if ( $value['fqdn'] == $usedFqdn['fqdn'] ){
						unset($fqdn[$key]);
					}
				}
			}
			
			return $fqdn;
		}

		/**
		 * setEndpointRemoteErrorStatus
		 * @param string	$url
		 * @param string	$name
		 * @param string	$id
		 * @soap
		 */
		public function setEndpointRemoteErrorStatus($name, $url, $id){
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			EndpointRemote::setErrorStatus($model->id);
		}

		/**
		 * getRemoteAssociateOriginToFqdn
		 * @return string	// serialized params from acrion model
		 * @soap
		 */
		public function getRemoteAssociateOriginToFqdn(){
			//firstly refresh actual list of local associations
			//list is refreshed by calling function getListContentOrigin
			
			$return = EndpointLocal::getListContentOrigin();
			
			//secondly select LocalAssociateOriginToFqdn
			$models = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
			
			if(count($models)>1){
				// some error occurred because always must exist only one entry with LocalAssociateOriginToFqdn
				return FALSE;
			} else {
				foreach ($models as $key => $value) {
					return $value->params;
				}
			}
			
			return FALSE;
										
		}
		
		/**
		 * setRemoteAssociateOriginToFqdn
         * @param string	$url
		 * @param string	$name
		 * @param string	$params
		 * @soap
		 */
		public function setRemoteAssociateOriginToFqdn($name, $url, $params){
			$model = EndpointRemote::model()->findByAttributes(array('name' => $name, 'url' => $url));
			$unserialize = unserialize($params);
			CdniAction::addAction($model->id, 'RemoteAssociateOriginToFqdn', $unserialize);
		}
		
		/**
		 * getDevices
		 * 
		 * @param string 	$type		
		 * @return array
		 * @soap 
		 */
		public function getDevices($type){
			$cisco = new CiscoCDS;
			$devices = array();
			$devices = $cisco->getDevices($type);
			return $devices;
		}
}
	






?>