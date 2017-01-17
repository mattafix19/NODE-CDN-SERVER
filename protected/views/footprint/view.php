<?php

$this->breadcrumbs = array(
	Yii::t('app', 'CDNi interface') => array('endpointLocal/index'),
	GxHtml::valueEx($model),
);

$this->menu=array(
	array('label'=>Yii::t('app', 'Overview'), 'url' => array('endpointLocal/')),
	array('label'=>Yii::t('app', 'Edit CDNi interface'), 'url' => array('endpointLocal/edit')),
	array('label'=>Yii::t('app', 'Create') . ' ' . $model->label(), 'url'=>array('create')),
	array('label'=>Yii::t('app', 'Update') . ' ' . $model->label(), 'url'=>array('update', 'id' => $model->id)),
	array('label'=>Yii::t('app', 'Delete') . ' ' . $model->label(), 'url'=>'#', 'linkOptions' => array('submit' => array('delete', 'id' => $model->id), 'confirm'=>'Are you sure you want to delete this item?')),
	array('label'=>Yii::t('app', 'Manage') . ' ' . $model->label(2), 'url'=>array('admin')),
);
?>

<h1><?php echo Yii::t('app', 'View') . ' ' . GxHtml::encode($model->label()) . ' ' . GxHtml::encode(GxHtml::valueEx($model)); ?></h1>

<?php $this->widget('zii.widgets.CDetailView', array(
	'data' => $model,
	'attributes' => array(
'id',
array(
			'name' => 'endpoint',
			'type' => 'raw',
			'value' => $model->endpoint !== null ? GxHtml::link(GxHtml::encode(GxHtml::valueEx($model->endpoint)), array('endpoint/view', 'id' => GxActiveRecord::extractPkValue($model->endpoint, true))) : null,
			),
'subnet_num',
'mask_num',
'subnet_ip',
'prefix',
	),
)); ?>

