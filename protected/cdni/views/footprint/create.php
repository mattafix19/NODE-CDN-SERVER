<?php

$this->breadcrumbs = array(
		Yii::t('app', 'CDNi interface') => array('endpointLocal/index'),
		Yii::t('app', 'Add footprint'),
	);

$this->menu = array(
	array('label'=>Yii::t('app', 'Overview'), 'url' => array('endpointLocal/')),
	array('label'=>Yii::t('app', 'Edit CDNi info'), 'url' => array('endpointLocal/edit')),
	array('label'=>Yii::t('app', 'Manage') . ' ' . $model->label(2), 'url' => array('admin')),
);
?>

<h1><?php echo Yii::t('app', 'Add') . ' ' . GxHtml::encode($model->label()); ?></h1>

<?php
$this->renderPartial('_form', array(
		'model' => $model,
		'buttons' => 'create'));
?>