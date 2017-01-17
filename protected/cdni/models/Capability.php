<?php

Yii::import('application.models._base.BaseCapability');

class Capability extends BaseCapability
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}
}