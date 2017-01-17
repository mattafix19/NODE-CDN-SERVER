<?php

Yii::import('application.models._base.BaseEndpointStatus');

class EndpointStatus extends BaseEndpointStatus
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}
}