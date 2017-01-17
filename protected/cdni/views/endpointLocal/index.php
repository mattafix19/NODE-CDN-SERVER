<?php
	
	$this->breadcrumbs = array(
		Yii::t('app', 'CDNi interface'),
		Yii::t('app', 'Overview'),
	);
	
	$this->menu = array(
		array('label'=>Yii::t('app', 'Edit CDNi interface'), 'url' => array('edit')),
		array('label'=>Yii::t('app', 'Add footprint'), 'url' => array('footprint/create')),
		array('label'=>Yii::t('app', 'Manage footprints'), 'url' => array('footprint/admin')),
	);
?>

<h1><?php echo "Overview"/*echo GxHtml::encode(Endpoint::label(2));*/ ?></h1>

<?php $this->widget('zii.widgets.CDetailView', array(
	'data' => $model,
	'attributes' => array(
'id',
'name',
'url',
'url_translator',
'url_cdn',
'port_cdn',
'login',
'priority',
array(
			'name' => 'EndpointGatewayType',
			'type' => 'raw',
			'value' => $model->endpointGatewayType !== null ? GxHtml::link(GxHtml::encode(GxHtml::valueEx($model->endpointGatewayType)), array('endpointGatewayType/view', 'id' => GxActiveRecord::extractPkValue($model->endpointGatewayType, true))) : null,
			),
array(
			'name' => 'endpointStatus',
			'type' => 'raw',
			'value' => $model->endpointStatus !== null ? GxHtml::link(GxHtml::encode(GxHtml::valueEx($model->endpointStatus)), array('endpointStatus/view', 'id' => GxActiveRecord::extractPkValue($model->endpointStatus, true))) : null,
			),
array(
			'name' => 'endpointType',
			'type' => 'raw',
			'value' => $model->endpointType !== null ? GxHtml::link(GxHtml::encode(GxHtml::valueEx($model->endpointType)), array('endpointType/view', 'id' => GxActiveRecord::extractPkValue($model->endpointType, true))) : null,
			),
	),
)); ?>

<h2><?php echo GxHtml::encode($model->getRelationLabel('capabilities')); ?></h2>
<?php
	echo GxHtml::openTag('ul');
	foreach($model->capabilities as $relatedModel) {
		echo GxHtml::openTag('li');
		echo GxHtml::link(GxHtml::encode(GxHtml::valueEx($relatedModel)), array('capability/view', 'id' => GxActiveRecord::extractPkValue($relatedModel, true)));
		echo GxHtml::closeTag('li');
	}
	echo GxHtml::closeTag('ul');
?><h2><?php echo GxHtml::encode($model->getRelationLabel('footprints')); ?></h2>
<?php
	echo GxHtml::openTag('ul');
	foreach($model->footprints as $relatedModel) {
		echo GxHtml::openTag('li');
		echo GxHtml::link(GxHtml::encode(GxHtml::valueEx($relatedModel)), array('footprint/view', 'id' => GxActiveRecord::extractPkValue($relatedModel, true)));
		echo GxHtml::closeTag('li');
	}
	echo GxHtml::closeTag('ul');
?>


<h2>Content Origins</h2>
<?php 

$modelsAction = CdniAction::model()->findAllByAttributes(array('action' => 'LocalAssociateOriginToFqdn'));
$contentOrigins = EndpointLocal::getListContentOrigin();

foreach ($modelsAction as $keyAction => $valueAction) {
	$params = unserialize($valueAction->params);
	
	echo "<table class=''>";
	foreach ($params as $keyPar => $valuePar) {
		echo "<tr>";
			echo "<td>";
			echo $valuePar['name'];
			echo "</td>";
			echo "<td>";
			echo $valuePar['originServer'];
			echo "</td>";
			echo "<td>";
			echo $valuePar['fqdn'];
			echo "</td>";
			echo "<td>";
			if ( !empty( $valuePar['idRemoteEndpoint']) ) echo $valuePar['idRemoteEndpoint'];
			echo "</td>";
		echo "</tr>";

	}
	echo "</table>";
}











