<?php

Yii::import('application.models._base.BaseEndpointCapability');

class EndpointCapability extends BaseEndpointCapability
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}
}