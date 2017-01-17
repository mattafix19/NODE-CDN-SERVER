<?php

Yii::import('application.models._base.BaseEndpoint');

class EndpointLocal extends Endpoint
{
	public static function model($className=__CLASS__) {
		$model = parent::model($className);
		return $model;
	}
	
	public static function getLocalEndpoint(){
		return self::model()->find('endpoint_type_id = 1');
	}
	
	/**
	 * getListContentOrigin
	 * based on type CNIi interface function return list of content origins
	 * @return	$contentOrigins		//	array[]['name'] array[]['originServer'] array[]['fqdn'] array[]['idRemoteEndpoint']
	 */
	public static function getListContentOrigin(){
			
		$contentOrigins = array();
		$modelLocal = EndpointLocal::getLocalEndpoint();
		
		switch ($modelLocal->endpoint_gateway_type_id) {
			case 1:	// DUMMY

					// find old cashed info
					$models = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
					
					if(count($models) != 0){
						// copy old data to new array
						foreach ($models as $key => $value) {
							
							$params = unserialize($value->params);
							foreach ($params as $keyPar => $valuePar) {
								if($valuePar['name'] != 'dummyCloserit' && $valuePar['originServer'] != 'origin1.rostecky.sk'){
									$contentOrigins[] = array(
										'name' => $valuePar['name'],
										'originServer' => $valuePar['originServer'],
										'fqdn' => $valuePar['fqdn'],
										'idRemoteEndpoint' => $valuePar['idRemoteEndpoint'],		
									); 					
								}
							}
							
						}
						// delete old entry
						foreach ($models as $key => $value) {
							$model = CdniAction::model()->findByPk($value->id);
							$model->delete();	
						}
					}	
			
					// add permanent ContentOrigin
					$contentOrigins[] = array(
											'name' => 'origin1',
											'originServer' => 'origin1.rostecky.sk', 
											'fqdn' => '147.175.15.42/CDNi2/dummyCdn/rfqdn1',
											'idRemoteEndpoint' => '0',							// this parameter contaion only DummyCDN. They have to know, ho is owner of content Origin
										);
				break;
			
			case 2:	// CISCO CDS 
					
					// this function is called with every new interconnection. We have to this information accesible with every request on UrlTranstalitonService.
					// therefor we need this information cashed in our DB. 
					
					$cisco = new CiscoCDS;
					$resXML = $cisco->getContentOrigins();
					foreach ($resXML->record as $key => $value) {
						$contentOrigins[] = array(
													'name' => (string)$value['Name'],
													'originServer' => (string)$value['OriginFqdn'],
													'fqdn' => (string)$value['Fqdn'],
												);
					}
					
				break;
			
			default:
				
				break;
		}
		
		// find old cashed info
		$models = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
		if(count($models)){
			// delete old
			foreach ($models as $key => $value) {
				$model = CdniAction::model()->findByPk($value->id);
				$model->delete();	
			}
		}
		// add new
		CdniAction::addAction(1, 'LocalAssociateOriginToFqdn', $contentOrigins);

		return $contentOrigins;
	}
	
}