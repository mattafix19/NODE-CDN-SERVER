<?php

class LogController extends GxController {
	
	public function actionClear(){
		Log::model()->deleteAll();
		$this->redirect(array('index'));
	}

	public function actionIndex() {
		$dataProvider = new CActiveDataProvider('Log');
		$logs = Log::model()->findAll();
		$this->render('index', array(
			'dataProvider' => $dataProvider,
			'logs' => $logs,
		));
	}

}