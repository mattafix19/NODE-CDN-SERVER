<?php

	$this->breadcrumbs = array(
		Yii::t('app', 'CDNi interface') => array('index'),
		Yii::t('app', 'Edit'),
	);

	$this->menu = array(
		array('label'=>Yii::t('app', 'Overview'), 'url' => array('index')),
		array('label'=>Yii::t('app', 'Add footprint'), 'url' => array('footprint/create')),
		array('label'=>Yii::t('app', 'Manage footprints'), 'url' => array('footprint/admin')),
	);
?>

<h1><?php echo Yii::t('app', 'Edit CDNi interface'); ?></h1>

<?php
	$this->renderPartial('_formEdit', array(
			'model' => $model,
			'buttons' => 'create'));
?>