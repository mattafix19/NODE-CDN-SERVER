<?php

$this->breadcrumbs = array(
	Yii::t('app', 'CDNi interface') => array('endpointLocal/index'),
	Yii::t('app', 'Manage Footprints'),
);

$this->menu = array(
		array('label'=>Yii::t('app', 'Overview'), 'url' => array('endpointlocal/')),
		array('label'=>Yii::t('app', 'Edit CDNi interface'), 'url' => array('endpointlocal/edit')),
		array('label'=>Yii::t('app', 'Add footprint'), 'url'=>array('create')),
	);

Yii::app()->clientScript->registerScript('search', "
$('.search-button').click(function(){
	$('.search-form').toggle();
	return false;
});
$('.search-form form').submit(function(){
	$.fn.yiiGridView.update('footprint-grid', {
		data: $(this).serialize()
	});
	return false;
});
");
?>

<h1><?php echo Yii::t('app', 'Manage') . ' ' . GxHtml::encode($model->label(2)); ?></h1>


<?php 

	$this->widget('zii.widgets.grid.CGridView', array(
	'id' => 'footprint-grid',
	'dataProvider' => $model->search(),
	'filter' => $model,
	'columns' => array(
		'id',
		array(
				'name'=>'endpoint_id',
				'value'=>'GxHtml::valueEx($data->endpoint)',
				'filter'=>GxHtml::listDataEx(Endpoint::model()->findAllAttributes(null, true)),
				),
		'subnet_num',
		'mask_num',
		'subnet_ip',
		'prefix',
		array(
			'class' => 'CButtonColumn',
		),
	),
)); ?>