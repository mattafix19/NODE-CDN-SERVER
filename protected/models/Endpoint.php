<?php

Yii::import('application.models._base.BaseEndpoint');

class Endpoint extends BaseEndpoint
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}

    public function relations() {
    	return array(
        	'endpointGatewayType' => array(self::BELONGS_TO, 'EndpointGatewayType', 'endpoint_gateway_type_id'),
            'endpointType' => array(self::BELONGS_TO, 'EndpointType', 'endpoint_type_id'),
            'endpointStatus' => array(self::BELONGS_TO, 'EndpointStatus', 'endpoint_status_id'),
            'capabilities' => array(self::MANY_MANY, 'Capability', 'endpoint_capability(endpoint_id,capability_id)'),
            'footprints' => array(self::HAS_MANY, 'Footprint', 'endpoint_id'),
        );
    }

    public function pivotModels() {
        return array(
            'capabilities' => 'EndpointCapability',
        );
    }
	
  	public function attributeLabels() {
    	return array(
            'id' => Yii::t('app', 'ID'),
            'name' => Yii::t('app', 'Name'),
            'url' => Yii::t('app', 'Url'),
            'url_translator' => Yii::t('app', 'Url Translator'),
            'url_cdn' => Yii::t('app', 'Url Cdn'),
			'port_cdn' => Yii::t('app', 'Port Cdn'),
			'login' => Yii::t('app', 'Login'),
			'pass' => Yii::t('app', 'Pass'),
            'priority' => Yii::t('app', 'Priority'),
            'endpoint_status_id' => null,
            'endpoint_type_id' => null,
            'endpoint_gateway_type_id' => null,
            'endpointGatewayType' => null,
            'endpointType' => null,
            'endpointStatus' => null,
            'capabilities' => null,
            'footprints' => null,
	    );
    }
	
}