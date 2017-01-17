<?php

Yii::import('application.models._base.BaseEndpointGatewayType');

class EndpointGatewayType extends BaseEndpointGatewayType
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}
}