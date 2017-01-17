<?php

Yii::import('application.models._base.BaseCdniAction');

class CdniAction extends BaseCdniAction
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}
	
	/**
	 * addAction
	 * 
	 * @param 		$endpointRemoteId 		// id of remoteEndpoint aka CDNi interconnection
	 * @param		$action					// action which was make on CDN
	 * @param 		$params					// additional parameters for action ex.: file_id 
	 * @return 		none
	 */
	public static function addAction($endpointRemoteId, $action, $params) {
		$model = new CdniAction;
		$model->endpoint_id = $endpointRemoteId;
		$model->action = $action;
		$model->params = serialize($params);
		$model->save();
	}
	
	/**
	 * removeAction
	 * remove all actions belong to endpointRemote aka CDNi interconnection
	 * 
	 * @param		$endpointRemoteId		// id of remoteEndpoint aka CDNi interconnection
	 * @return		none
	 */
	public static function removeAction($endpointRemoteId){
		
		$criteria=new CDbCriteria;
		$criteria->addSearchCondition('endpoint_id', $endpointRemoteId);
		$models=CdniAction::model()->findAll($criteria);
		foreach ($models as $key => $value) {
			$model = CdniAction::model()->findByPk($value->id);
			$model->delete();
		}
	}
	
	/**
	 * getAction
	 * get all actions belong to endpointRemote aka CDNi interconnection
	 * 
	 * @param		$endpointRemoteId		// id of remoteEndpoint aka CDNi interconnection
	 * @param		$action					// if is set, return only specific actions
	 * @return		$models					// return array of CdniAction objects
	 */
	public static function getAction($endpointRemoteId, $action){
		if(empty($action)){
			//	return all
			$criteria=new CDbCriteria;
			$criteria->addSearchCondition('endpoint_id', $endpointRemoteId);
			$models=CdniAction::model()->findAll($criteria);
			return $models;
		} else {
			$criteria=new CDbCriteria;
			$criteria->addSearchCondition('endpoint_id', $endpointRemoteId);
			$criteria->addSearchCondition('action', $action);
			$models=CdniAction::model()->findAll($criteria);
			return $models;
		}
	}
}