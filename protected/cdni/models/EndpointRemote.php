<?php

Yii::import('application.models._base.BaseEndpoint');

class EndpointRemote extends Endpoint
{
	public static function model($className=__CLASS__) {
		$model = parent::model($className);
		return $model;
	}
	
	/**
	 * @override 
	 * set endpoint type to 2 (remote)
	 */
	public function search() {
		$criteria = new CDbCriteria;

		$criteria->compare('id', $this->id, true);
		$criteria->compare('name', $this->name, true);
		$criteria->compare('url', $this->url, true);
		$criteria->compare('priority', $this->priority, true);
		$criteria->compare('endpoint_status_id', $this->endpoint_status_id);
		$criteria->compare('endpoint_type_id', 2);

		return new CActiveDataProvider($this, array(
			'criteria' => $criteria,
		));
	}
	
	/**
	 * @override
	 * remove endpoint_status_id from required field, we set up manualy in action create
	 * */
	public function rules() {
		return array(
			array('name, url', 'required'),
			array('name', 'length', 'max'=>20),
			array('url', 'length', 'max'=>100),
			array('priority, endpoint_status_id, endpoint_type_id', 'length', 'max'=>1),
			array('priority, endpoint_status_id', 'default', 'setOnEmpty' => true, 'value' => null),
			array('id, name, url, priority, endpoint_status_id, endpoint_type_id', 'safe', 'on'=>'search'),
		);
	}
	
	/**
	 * Set status of interconnection to Error state.
	 * @param	$id		// id of endpointRemote
	 */
	public static function setErrorStatus($id){
		$model = EndpointRemote::model()->findByPk($id);
		$model->endpoint_status_id = 7;
		$model->save();
	}
	
}