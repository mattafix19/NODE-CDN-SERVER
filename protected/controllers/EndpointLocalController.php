<?php

/*
 * EndpointLocal represent configuration of local CDNi interface
 * */
class EndpointLocalController extends GxController {
	
	public function actionEdit() {
		
		$criteria = new CDbCriteria;
		$criteria->condition = 'endpoint_type_id = 1';
		
		$model = EndpointLocal::model()->find($criteria);


		if($model == FALSE){
			$model = new EndpointLocal;
			$model->endpoint_type_id = 1;
			
		}

		if (isset($_POST['EndpointLocal'])) {
			$model->setAttributes($_POST['EndpointLocal']);
			
			EndpointCapability::model()->deleteAllByAttributes(array('endpoint_id' => $model->id));
			
			$relatedData = array(
				'capabilities' => $_POST['EndpointLocal']['capabilities'] === '' ? null : $_POST['EndpointLocal']['capabilities'],
				);

			if ($model->saveWithRelated($relatedData)) {
				$this->redirect(array('index'));
			}
		}

		$this->render('edit', array(
				'model' => $model,
				));
		
	}

	public function actionUpdate($id) {
		$model = $this->loadModel($id, 'EndpointLocal');
		if (isset($_POST['EndpointLocal'])) {
			$model->setAttributes($_POST['EndpointLocal']);
			$relatedData = array(
				'capabilities' => $_POST['EndpointLocal']['capabilities'] === '' ? null : $_POST['EndpointLocal']['capabilities'],
			);

			if ($model->saveWithRelated($relatedData)) {
				$this->redirect(array('view', 'id' => $model->id));
			}
		}

		$this->render('update', array(
				'model' => $model,
				));
	}

	public function actionDelete($id) {
		if (Yii::app()->getRequest()->getIsPostRequest()) {
			$this->loadModel($id, 'EndpointLocal')->delete();

			if (!Yii::app()->getRequest()->getIsAjaxRequest())
				$this->redirect(array('admin'));
		} else
			throw new CHttpException(400, Yii::t('app', 'Your request is invalid.'));
	}

	public function actionIndex() {
	/*	$dataProvider = new CActiveDataProvider('EndpointLocal');
		$this->render('index', array(
			'dataProvider' => $dataProvider,
		)); */
		
		$criteria = new CDbCriteria;
		$criteria->condition = 'endpoint_type_id = 1';
		
		$this->render('index', array(
			'model' => EndpointLocal::model()->find($criteria),
		));
	}

	public function actionAdmin() {
		$model = new EndpointLocal('search');
		$model->unsetAttributes();

		if (isset($_GET['EndpointLocal']))
			$model->setAttributes($_GET['EndpointLocal']);

		$this->render('admin', array(
			'model' => $model,
		));
	}

}