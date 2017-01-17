<?php

$this->breadcrumbs = array(
		Yii::t('app', 'CDNi interface') => array('endpointLocal/index'),
		Yii::t('app', 'Update Footprint'),
	);

$this->menu = array(
	array('label' => Yii::t('app', 'Create') . ' ' . $model->label(), 'url'=>array('create')),
	array('label' => Yii::t('app', 'View') . ' ' . $model->label(), 'url'=>array('view', 'id' => GxActiveRecord::extractPkValue($model, true))),
	array('label' => Yii::t('app', 'Manage') . ' ' . $model->label(2), 'url'=>array('admin')),
);
?>

<h1><?php echo Yii::t('app', 'Update') . ' ' . GxHtml::encode($model->label()) . ' ' . GxHtml::encode(GxHtml::valueEx($model)); ?></h1>

<?php
$this->renderPartial('_form', array(
		'model' => $model));
?>