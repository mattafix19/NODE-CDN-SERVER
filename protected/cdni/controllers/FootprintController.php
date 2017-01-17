<?php

class FootprintController extends GxController {


	public function actionView($id) {
		$this->render('view', array(
			'model' => $this->loadModel($id, 'Footprint'),
		));
	}

	public function actionCreate() {
		$model = new Footprint;
		

		if (isset($_POST['Footprint'])) {
			$model->setAttributes($_POST['Footprint']);
			
			if ($model->validate() && $model->save()) {
				
				$this->setNewCoverageZoneFile();
				
				
				if (Yii::app()->getRequest()->getIsAjaxRequest())
					Yii::app()->end();
				else
					$this->redirect(array('view', 'id' => $model->id));
					
				
			}
		}

		$this->render('create', array( 'model' => $model));
	}

	public function actionUpdate($id) {
		$model = $this->loadModel($id, 'Footprint');


		if (isset($_POST['Footprint'])) {
			$model->setAttributes($_POST['Footprint']);

			if ($model->save()) {
				$this->setNewCoverageZoneFile();
				$this->redirect(array('view', 'id' => $model->id));
			}
		}

		$this->render('update', array(
				'model' => $model,
				));
	}

	public function actionDelete($id) {
		if (Yii::app()->getRequest()->getIsPostRequest()) {
			$this->loadModel($id, 'Footprint')->delete();
			$this->setNewCoverageZoneFile();

			if (!Yii::app()->getRequest()->getIsAjaxRequest())
				$this->redirect(array('admin'));
		} else
			throw new CHttpException(400, Yii::t('app', 'Your request is invalid.'));
	}

	public function actionAdmin() {
		$model = new Footprint('search');
		$model->unsetAttributes();
		
		if (isset($_GET['Footprint']))
			$model->setAttributes($_GET['Footprint']);
		
		$this->render('admin', array(
			'model' => $model,
		));
	}

	public function setNewCoverageZoneFile(){
		$modelLocal = EndpointLocal::getLocalEndpoint();
		// new footprint was created; If CDNi gateway is CISCO, we set up new footprint to CZ file
		if($modelLocal->endpoint_gateway_type_id == 2){
			$cisco = new CiscoCDS;
		
			// now we set up new CoverageZone file
			$coverageZoneFileId = '';
			
			$fileName = $cisco->generateCoverageZoneFile();
			Log::logging("Coverage Zone file was create: " . $fileName);
			$coverageZoneFileId = $cisco->registerFile($fileName, '1');
			if($coverageZoneFileId != ''){
				Log::logging("Coverage Zone file was register: " . $fileName. ":" . $coverageZoneFileId);	
				// action set at the end of function
				
				//	now we assign globaly CZ file to CDS 
				if($cisco->applyCZ((string)$coverageZoneFileId)){
					Log::logging("CoverageZoneFile " . $fileName. ":" . $coverageZoneFileId . " was apply to CDS globaly");	
				//	$params = array('none' => 'none', );
				//	CdniAction::addAction(1, 'applyCZ', $params);
				} else {
					Log::logging('ERROR: Unsucesfull applyCZ after new footprint');
				}
			} else {
				// unsucesfull register file
				Log::logging('ERROR: Unsucesfull register file after new footprint');
			}
			
			
			
			// delete old registred files
			$models=CdniAction::model()->findAllByAttributes(array('endpoint_id' => '1', 'action' => 'registerFile')); 
			foreach ($models as $key => $model) {
				//$model = CdniAction::model()->findByPk($value->id);
				//	CDNi Upstream
				if($model->action == "registerFile"){
					$params = unserialize($model->params);
					if(!empty($params['selectorFileId'])){
						$cisco->deleteFile($params['selectorFileId'], '19');
						Log::logging("DELETE 'registerFile' id:" . $params['selectorFileId']);
					} elseif(!empty($params['coverageZoneFileId'])){
						$cisco->deleteFile($params['coverageZoneFileId'], '1');
						Log::logging("DELETE 'registerFile' id:" . $params['coverageZoneFileId']);
					}
				}
			}

			// DELETE old action
			foreach ($models as $key => $value) {
				$value->delete();	
			}
			
			if($coverageZoneFileId != ''){
				// add action
				$params = array('coverageZoneFileId' => (string)$coverageZoneFileId, );
				CdniAction::addAction(1, 'registerFile', $params);
			}
			
		}
	}

}