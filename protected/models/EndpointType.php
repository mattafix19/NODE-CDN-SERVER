<?php

Yii::import('application.models._base.BaseEndpointType');

class EndpointType extends BaseEndpointType
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}
}