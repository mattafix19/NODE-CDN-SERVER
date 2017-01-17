<?php

Yii::import('application.models._base.BaseLog');

class Log extends BaseLog
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}
	
	public static function logging($message){
		$model = new Log;
		$model->time = date('Y-m-d H:i:s');
		$model->message = $message;
		$model->save();
	}
	
}