<?php

Yii::import('application.models._base.BaseFootprint');

class Footprint extends BaseFootprint
{
	public static function model($className=__CLASS__) {
		return parent::model($className);
	}
	
	// overload rules => subnet_num and mask_num is no required because we will count it before insert to DB.
	public function rules() {
		return array(
			array('endpoint_id, subnet_ip, prefix', 'required'),
			array('endpoint_id, subnet_num, mask_num', 'length', 'max'=>10),
			array('subnet_ip', 'length', 'max'=>15),
			array('prefix', 'length', 'max'=>2),
			array('prefix', 'numerical', 'integerOnly' => TRUE),
			array('id, endpoint_id, subnet_num, mask_num, subnet_ip, prefix', 'safe', 'on'=>'search'),
			
			array('endpoint_id', 'validateIpAddress'),
			array('endpoint_id', 'validatePrefix'),
		);
	}
	
	protected function afterValidate(){
		
		$this->subnet_num = ip2long($this->subnet_ip);
		$this->mask_num = 0xFFFFFFFF-(pow(2, 32-$this->subnet_num)-1);
		
		return parent::afterValidate();
	}
	
	public function validateIpAddress($subnet_ip, $params){
		if(!$this->hasErrors()){
			if(!filter_var($this->subnet_ip, FILTER_VALIDATE_IP)){
				$this->addError('subnet_ip', Yii::t('app', 'Bad format IP address.'));
			}
		}
	}

	public function validatePrefix($prefix, $params){
		if(!$this->hasErrors()){
			if($this->prefix < 1 || $this->prefix > 32){
				$this->addError('prefix', Yii::t('app', 'Bad format IP address.'));	
			}
		}
	}
	
}