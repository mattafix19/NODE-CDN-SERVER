<?php

class EndpointRemoteController extends GxController {


	public function actionView($id) {
		$this->render('view', array(
			'model' => $this->loadModel($id, 'EndpointRemote'),
		));
	}
	
	
	/**
	 * TODO Make control for client soap function .... 
	 * 
	 */
	public function actionCreate() {
		$model = new EndpointRemote;

		$modelLocal = EndpointLocal::getLocalEndpoint();

		if (isset($_POST['EndpointRemote'])) {
			
			if($_POST['EndpointRemote']['url'] == $modelLocal->url){
				echo "CAN NOT CREATE INTERCONNECTION WITH SAME URL AS IS LOCAL URL";
				exit;
			}
			
			$model->setAttributes($_POST['EndpointRemote']);
			$model->endpoint_status_id = 2;
			$model->endpoint_type_id = 2;
			$relatedData = array(
		//		'capabilities' => $_POST['EndpointRemote']['capabilities'] === '' ? null : $_POST['EndpointRemote']['capabilities'],
				);

			if ($model->saveWithRelated($relatedData)) {
				
				$id = $model->getPrimaryKey();
					
				$client = $this->createSoapClient($id);
				$client->setOffer($modelLocal->name, $modelLocal->url, $modelLocal->priority, 2, 1, $modelLocal->endpoint_gateway_type_id, $modelLocal->url_translator);
				$client->logging('Receive offer from ' . $modelLocal->name . ':' . $modelLocal->url);
				Log::logging("Send offer to " . $model->name . ':' . $model->url);
				
				
				$arrayFootprints = array();
				$arrayFootprints = Footprint::model()->findAllByAttributes( array('endpoint_id' => $modelLocal->id ));
				foreach ($arrayFootprints as $key => $value) {
					$client->setFootprints($modelLocal->name, $modelLocal->url, $value->subnet_num, $value->mask_num, $value->subnet_ip, $value->prefix);
					$client->logging('Receive footprint ' . $value->subnet_ip . '/' . $value->prefix . ' from ' . $modelLocal->name . ':' . $modelLocal->url);
					Log::logging('Send footprint ' . $value->subnet_ip . '/' . $value->prefix . ' to ' . $model->name . ':' . $model->url);
				}
				
				$modelCapabilities = EndpointCapability::model()->findAllByAttributes(array('endpoint_id' => $modelLocal->id));
				$capability = array();
				foreach ($modelCapabilities as $key => $value) {
					$capability[] = $value->capability_id;
				}
				$client->setCapabilities( $modelLocal->name, $modelLocal->url, $capability);
				
				unset($client);
				
				if (Yii::app()->getRequest()->getIsAjaxRequest())
					Yii::app()->end();
				else
					$this->redirect(array('view', 'id' => $model->id));
			}
		}

		$this->render('create', array( 'model' => $model));
	}

	public function actionUpdate($id) {
		$model = $this->loadModel($id, 'EndpointRemote');


		if (isset($_POST['EndpointRemote'])) {
			$model->setAttributes($_POST['EndpointRemote']);
			$relatedData = array(
				'capabilities' => $_POST['EndpointRemote']['capabilities'] === '' ? null : $_POST['EndpointRemote']['capabilities'],
				);

			if ($model->saveWithRelated($relatedData)) {
				$this->redirect(array('view', 'id' => $model->id));
			}
		}

		$this->render('update', array(
				'model' => $model,
				));
	}

	/**
	 * actionDelete
	 * Delete interconnection
	 * @param 	@id		id of interconnection
	 */
	public function actionDelete($id) {
		if (Yii::app()->getRequest()->getIsPostRequest()) {
		
			$model = EndpointRemote::model()->findByPk($id);
			$modelLocal = EndpointLocal::getLocalEndpoint();
			
			switch ($modelLocal->endpoint_gateway_type_id) {
				case 1: // DUMMY
					
					$contentOrigins = array();	
					
					$modelsAction = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
					
					// this foreach have to got only one iteration, becouse at time have to exist only one entry of LocalAssociateOriginToFqdn 
					// copy old data to new array
					foreach ($modelsAction as $keyAction => $valueAction) {
					
						$params = unserialize($valueAction->params);
						foreach ($params as $key => $value) {
							
							if( empty($value['idRemoteEndpoint']) ){
								$contentOrigins[] = array(
									'name' => $value['name'],
									'originServer' => $value['originServer'],
									'fqdn' => $value['fqdn'],
									'idRemoteEndpoint' => '',
								);
							} else if( ! $value['idRemoteEndpoint'] == $model->id ){
								// only copy data that no create with interconnection, that we now deleting;
								
								$contentOrigins[] = array(
									'name' => $value['name'],
									'originServer' => $value['originServer'],
									'fqdn' => $value['fqdn'],
									'idRemoteEndpoint' => $value['idRemoteEndpoint'],
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
					
					
					$models=CdniAction::model()->findAllByAttributes(array('endpoint_id' => $id));
					foreach ($models as $key => $value) {
						$value->delete();
					}
					
					
					break;
				case 2:	// CISCO CDS
					$cisco = new CiscoCDS;
					$cisco->removeInterconnection($id);
					break;
				
				default:
					
					break;
			}
			
			$client = $this->createSoapClient($model->id);
			$client->deleteInterconnection($modelLocal->name, $modelLocal->url);	
			Log::logging("DELETE CDNi interconnection " . $model->name . ":" . $model->url);
			$client->logging("DELETE CDNi interconnection " . $modelLocal->name . ":" . $modelLocal->url);
			unset($client);
			
			CdniAction::removeAction($id);
			$this->loadModel($id, 'EndpointRemote')->delete();
			
			if (!Yii::app()->getRequest()->getIsAjaxRequest())
				$this->redirect(array('admin'));
		} else
			throw new CHttpException(400, Yii::t('app', 'Your request is invalid.'));
	}
	
	/**
	 * index page of EndpointRemote contreoller (menu: CDNi interconnections)
	 */
	public function actionIndex() {
		$model = new EndpointRemote('search');
		$model->unsetAttributes();

		if (isset($_GET['EndpointRemote']))
			$model->setAttributes($_GET['EndpointRemote']);

		$this->render('index', array(
			'model' => $model,
		));
	}
	
	/**
	 * TODO => null control on models
	 */
	public function actionAcceptOffer($id){
		$model = EndpointRemote::model()->findByPk($id);
		$modelLocal = EndpointLocal::getLocalEndpoint();
		$model->endpoint_status_id = 6; //	acceptOffer show as DOWN 
		$model->save();
		if($model == null){
				
		} else {
			$client = $this->createSoapClient($model->id);
			echo $client->acceptOffer($modelLocal->name, $modelLocal->url);
			
			$client->logging('Offer was accepted from ' . $modelLocal->name . ':' . $modelLocal->url);
			Log::logging("Accept offer for " . $model->name . ':' . $model->url);
			
			$arrayFootprints = array();
			$arrayFootprints = Footprint::model()->findAllByAttributes( array('endpoint_id' => $modelLocal->id ));

			foreach ($arrayFootprints as $key => $value) {
				$client->setFootprints($modelLocal->name, $modelLocal->url, $value->subnet_num, $value->mask_num, $value->subnet_ip, $value->prefix);
				$client->logging('Receive footprint ' . $value->subnet_ip . '/' . $value->prefix . ' from ' . $modelLocal->name . ':' . $modelLocal->url);
				Log::logging('Send footprint ' . $value->subnet_ip . '/' . $value->prefix . ' to ' . $model->name . ':' . $model->url);
			}
			
			$modelCapabilities = EndpointCapability::model()->findAllByAttributes(array('endpoint_id' => $modelLocal->id));
			$capability = array();
			foreach ($modelCapabilities as $key => $value) {
				$capability[] = $value->capability_id;
			}
			$client->setCapabilities( $modelLocal->name, $modelLocal->url, $capability);
			
			//	LOCAL CDNi
			// offer will be accepted only by UPSTREAM CDN
			switch ($modelLocal->endpoint_gateway_type_id) {
				case 1: // DUMMY
					
					//	NOT YET IMPLEMENTED
					// Log::logging("Dummy UPSTREAM is not yet implemented");
					// $client->logging("Dummy UPSTREAM is not yet implemented");
					
					break;
				case 2: // CISCO CDS
			
					$cisco = new CiscoCDS;
				//	$selectorFileId = ''; 		// id of registered selector file id in CiscoCDS
					$coverageZoneFileId = '';
					
			/*		
			 * 		OLD COVERAGE ZONE FILE.... CZ file is now created after add/edit/delete footprints ... 
			 * 
					$fileName = $cisco->generateCoverageZoneFile();
					Log::logging("Coverage Zone file was create: " . $fileName);
					$coverageZoneFileId = $cisco->registerFile($fileName, '1');
					if($coverageZoneFileId != ''){
						Log::logging("Coverage Zone file was register: " . $fileName. ":" . $coverageZoneFileId);	
						$params = array('coverageZoneFileId' => (string)$coverageZoneFileId, );
						CdniAction::addAction($model->id, 'registerFile', $params);
						
						//	now we assign globaly CZ file to CDS 
						if($cisco->applyCZ((string)$coverageZoneFileId)){
							Log::logging("CoverageZoneFile " . $fileName. ":" . $coverageZoneFileId . " was apply to CDS globaly");	
							$params = array('none' => 'none', );
							CdniAction::addAction($model->id, 'applyCZ', $params);
						} else {
							EndpointRemote::setErrorStatus($model->id);
							$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
						}
					} else {
						// unsucesfull register file
						EndpointRemote::setErrorStatus($model->id);
						$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
					}
			*/		
					/**
					 * OLD ... SELECTOR FILE. Selector file was neccesery create with new interconnection.
					 *
					$fileName = $cisco->generateCdnSelectorFile($id);
					Log::logging("Selector file was create: " . $fileName);
					$selectorFileId = $cisco->registerFile($fileName, '19'); //	19 is SelectorFile
					Log::logging("Selector file was register: " . $fileName. ":" . $selectorFileId);
					$params = array('selectorFileId' => (string)$selectorFileId, );
					CdniAction::addAction($model->id, 'registerFile', $params);
					
					// now we apply selector file to SR devices
					$devicesSR = $cisco->getDevices('SR');
					foreach ($devicesSR as $key => $value) {
						if ($cisco->applyCdnSelector((string)$value['id'], (string)$selectorFileId)){
							Log::logging("Selector file " . $fileName. ":" . $selectorFileId . " was apply to " . $value['name'] . ":" . $value['id']);	
							$params = array('idSr' => (string)$value['id'], );
							CdniAction::addAction($model->id, 'applyCdnSelector', $params);
						} else {
							EndpointRemote::setErrorStatus($model->id);
							$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
						}
					}
					*/
					break;
				
				default:
					Log::logging('ERROR: upstreamCDN' . $modelLocal->endpoint_gateway_type_id . 'type of gateway is not deffined');
					$client->logging('ERROR: upstreamCDN' . $modelLocal->endpoint_gateway_type_id . 'type of gateway is not deffined');
					EndpointRemote::setErrorStatus($model->id);
					break;
			}
			
			// REMOTE CDNi
			// over soap we set downstream CDN
			
			$contentOrigins = EndpointLocal::getListContentOrigin();
			
			
			switch ($model->endpoint_gateway_type_id) {
				case 1: // DUMMY
						//$contentOrigins = EndpointLocal::getListContentOrigin();
						foreach ($contentOrigins as $keyContentOrigin => $valueContentOrigin) {
							//array[]['name'] array[]['originServer']
							
							$listFqdn = array();
							$listFqdn =	$client->getListFqdn();
							// we can create only as many Content Origins as we have domains
							
							if(empty($listFqdn)){
								$client->logging('Can not create Content Origin, all fqdn are used.');
								Log::logging('Remote CDNi haven\' got any free fqdn.');	
							} 
							
							Log::logging('DEBUG: listFqdn: ' . print_r($listFqdn, TRUE));
							
							foreach ($listFqdn as $keyFqdn => $valueFqdn) {
								if($client->createDummyContentOrigin($modelLocal->name, $modelLocal->url, $valueContentOrigin['name'], $valueContentOrigin['originServer'], $valueFqdn['fqdn'] )){
									$client->logging("Create Content ORIGIN initialized by: " . $modelLocal->url );
									Log::logging("Create content ORIGIN in " . $model->url );
								} else {
									$client->logging("ERROR: unsuccesfull Create Content ORIGIN initialized by: " . $modelLocal->url );
									Log::logging("ERROR: unsuccesfull Create content ORIGIN in " . $model->url );
								}	
								
								break;							
							}
						}
						
						
						
					break;
				case 2:	// CISCO CDS
						//$contentOrigins = EndpointLocal::getListContentOrigin();
						foreach ($contentOrigins as $key => $value) {
							
							$listFqdn = array();
							$listFqdn =	$client->getListFqdn();
							// we can create only as many Content Origins as we have domains
							
							if(empty($listFqdn)){
								$client->logging('Can not create Content Origin, all fqdn are used.');
								Log::logging('Remote CDNi haven\' got any free fqdn.');	
							}
							
							foreach ($listFqdn as $keyFqdn => $valueFqdn) {
								//Log::logging("DEBUG::::: " . $keyFqdn);
								$idContentOrigin = $client->createContentOrigin($modelLocal->name, $modelLocal->url, $value['name'], $value['originServer'], $valueFqdn['fqdn'] );
								if(!empty($idContentOrigin)){
									
									$client->logging("Create Content ORIGIN initialized by: " . $modelLocal->url . ":" . $idContentOrigin);
									Log::logging("Create content ORIGIN in " . $model->url . ":" . $idContentOrigin);
									
									$idDeliveryService = $client->createDeliveryService($modelLocal->name, $modelLocal->url, $value['name'], $idContentOrigin);
									if(!empty($idDeliveryService)){
										$client->logging("Create Delivery Service initialized by: "  . $modelLocal->url . ":" . $idDeliveryService);
										Log::logging("Create Delivery Service in " . $model->url . ":" . $idDeliveryService);
										
										
										// select SE as Content Aquier
										$devices = array();
										$devices = $client->getDevices('SE');
										
										if(empty($devices)){
											
											Log::logging("ERROR: getDevices is Empty");
											EndpointRemote::setErrorStatus($model->id);
											$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
											
										} else {
												
											Log::logging("DEBUG: getDevice return: " . print_r($devices, TRUE));	
											
											foreach ($devices as $keyDevice => $valueDevice) {
												if($valueDevice['status'] == 'Online'){
													
													Log::logging("DEBUG: assign: " . $valueDevice['id']);
													
													if($client->assignSEs($modelLocal->name, $modelLocal->url, $idDeliveryService, $valueDevice['id'])){
														Log::logging("Assign Service Engine in " . $model->url . ":" . $idDeliveryService);
														$client->logging("Assign Service Engine initialized by: "  . $modelLocal->url . ":" . $idDeliveryService);
														
													} else {
														Log::logging("ERROR: assignSEs over soap");
														EndpointRemote::setErrorStatus($model->id);
														$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
													}
													
													break;
													
												}
											}	
											
										}
										
										
									} else {
										Log::logging("ERROR: createDeliveryService over soap");
										EndpointRemote::setErrorStatus($model->id);
										$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
									}
									
								} else {
									Log::logging("ERROR: createContentOrigin over soap");
									EndpointRemote::setErrorStatus($model->id);
									$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
								}
								
								//only one time can this foreache called
								break; 	
							}
							
							// pull actionCdn in local 
						}


					break;
				
				default:
					Log::logging('ERROR: downstreamCDN' . $model->endpoint_gateway_type_id . 'type of gateway is not deffined');
					$client->logging('ERROR: downstreamCDN' . $model->endpoint_gateway_type_id . 'type of gateway is not deffined');
					EndpointRemote::setErrorStatus($model->id);
					$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
					break;
			}
			
		
			// it would be exchange all possible content origin from Upstream to Downstream
			// it is time to update RemoteAssociateOriginToFqdn
			$RemoteAssociateOriginToFqdn = $client->getRemoteAssociateOriginToFqdn();
			if(!$RemoteAssociateOriginToFqdn){
				Log::logging("ERROR: getRemoteAssociateOriginToFqdn over soap");
				$client->logging("ERROR: getRemoteAssociateOriginToFqdn called over soap");
				EndpointRemote::setErrorStatus($model->id);
				$client->setEndpointRemoteErrorStatus($modelLocal->name, $modelLocal->url);
			} else {
				$unserialize = unserialize($RemoteAssociateOriginToFqdn);
				CdniAction::addAction($model->id, 'RemoteAssociateOriginToFqdn', $unserialize);								
			}

			// set Our content Origins to client
			$client->setRemoteAssociateOriginToFqdn($modelLocal->name, $modelLocal->url, serialize($contentOrigins));
		
		
			unset($client);	
		}
		$this->redirect(array('index'));
	}
	
	/**
	 * TODO => null control on models
	 */
	public function actionRejectOffer($id){
		$model = EndpointRemote::model()->findByPk($id);
		$modelLocal = EndpointLocal::getLocalEndpoint();
		$model->endpoint_status_id = 4;
		$model->save();
		if($model == null){
			
		} else {
			$client = $this->createSoapClient($model->id);
			echo $client->rejectOffer($modelLocal->name, $modelLocal->url);	
			$client->logging('Offer was rejected from ' . $modelLocal->name . ':' . $modelLocal->url);
			Log::logging("Reject offer for " . $model->name . ':' . $model->url);
			unset($client);
			
		}
		$this->redirect(array('index'));
	}
	
	public function actionReSetOffer($id){
		$model = EndpointRemote::model()->findByPk($id);
		$modelLocal = EndpointLocal::getLocalEndpoint();
		$model->endpoint_status_id = 2;
		$model->save();
		if($model == null){
			
		} else {
			$client = $this->createSoapClient($model->id);
			echo $client->reSetOffer($modelLocal->name, $modelLocal->url);
			$client->logging('Offer was reseted from ' . $modelLocal->name . ':' . $modelLocal->url);
			Log::logging("Reset offer for " . $model->name . ':' . $model->url);
			unset($client);	
		}
		
		$this->redirect(array('index'));
	}
	
	public function actionTest(){
		$cisco = new CiscoCDS;
	//	$cisco->removeInterconnection(51);
	/*	$cisco = new CiscoCDS;
		$resXML = $cisco->getContentOrigins();
		
		foreach ($resXML->record as $key => $value) {
			$contentOrigins[] = array(
										'name' => (string)$value['Name'],
										'originServer' => (string)$value['OriginFqdn'], 
									);
		}
		
		echo "<pre>";
		print_r($contentOrigins);
		echo "</pre>";*/
		$cisco->generateCoverageZoneFile();
	}
	
	/**
	 * @param integer $id => id of EndpointRemote
	 * @return object $client
	 */
	public function createSoapClient($id){
		$model = EndpointLocal::model()->findByPk($id);
		ini_set ( 'soap.wsdl_cache_enable' , 0 ); ini_set ( 'soap.wsdl_cache_ttl' , 0 );
		$client=new SoapClient($model->url . '/soap/quote', array('trace' => 1,));
		return $client;
	}
}













