<?php

$this->breadcrumbs = array(
	Endpoint::label(2),
	Yii::t('app', 'Index'),
);

$this->menu = array(
	array('label'=>Yii::t('app', 'Create offer'), 'url' => array('create')),
);

Yii::app()->clientScript->registerScript('search', "
$('.search-button').click(function(){
	$('.search-form').toggle();
	return false;
});
$('.search-form form').submit(function(){
	$.fn.yiiGridView.update('endpoint-grid', {
		data: $(this).serialize()
	});
	return false;
});
");
?>


<h1><?php echo Yii::t('app', 'Interconnections'); ?></h1>

<p>
You may optionally enter a comparison operator (&lt;, &lt;=, &gt;, &gt;=, &lt;&gt; or =) at the beginning of each of your search values to specify how the comparison should be done.
</p>

<?php echo GxHtml::link(Yii::t('app', 'Advanced Search'), '#', array('class' => 'search-button')); ?>
<div class="search-form">
<?php $this->renderPartial('_search', array(
	'model' => $model,
)); ?>
</div><!-- search-form -->

<?php $this->widget('zii.widgets.grid.CGridView', array(
	'id' => 'endpoint-grid',
	'dataProvider' => $model->search(),
	'filter' => $model,
	'columns' => array(
		'id',
		'name',
		'url',
		'priority',
		array(
				'name'=>'endpoint_status_id',
				'value'=>'GxHtml::valueEx($data->endpointStatus)',
				'filter'=>GxHtml::listDataEx(EndpointStatus::model()->findAllAttributes(null, true)),
				),
	/*	array(
				'name'=>'endpoint_type_id',
				'value'=>'GxHtml::valueEx($data->endpointType)',
				'filter'=>GxHtml::listDataEx(EndpointType::model()->findAllAttributes(null, true)),
				), */
		array(
			'class' => 'CButtonColumn',
			'template'=>'{view}{update}{delete}{accept}{reject}{reset}',
			'deleteConfirmation'=>"js:'Offer with ID '+$(this).parent().parent().children(':first-child').text()+' will be deleted! Continue?'",
		    'buttons'=>array
		    (
		        'accept' => array
		        (
		            'label'=>'Accept offer',
		            'imageUrl'=>Yii::app()->request->baseUrl.'/images/acceptOffer.png',
		            'url'=>'Yii::app()->createUrl("endpointRemote/acceptOffer", array("id"=>$data->id))',
		            'visible' => '$data->endpoint_status_id == 1',
		        ),
		        'reject' => array
		        (
		            'label'=>'Reject offer',
		            'imageUrl'=>Yii::app()->request->baseUrl.'/images/rejectOffer.png',
		            'url'=>'Yii::app()->createUrl("endpointRemote/rejectOffer", array("id"=>$data->id))',
		        ),
		        'reset' => array
		        (
		            'label'=>'Reset offer',
		            'imageUrl'=>Yii::app()->request->baseUrl.'/images/reSetOffer.png',
		            'url'=>'Yii::app()->createUrl("endpointRemote/reSetOffer", array("id"=>$data->id))',
		        ),
		    ),
		),
	),
)); ?>


<h2>Content Origins</h2>
<?php 


$modelsEndRe = EndpointRemote::model()->findAllByAttributes(array('endpoint_status_id' => '6'));
foreach ($modelsEndRe as $keyEndRe => $modelEndRe) {
	$modelCdniAction = CdniAction::model()->findByAttributes(array('endpoint_id' => $modelEndRe->id , 'action' => 'RemoteAssociateOriginToFqdn'));
	$unserializepParams = array();
	
	if (count($modelCdniAction) != 0){
		
		$unserializepParams = unserialize($modelCdniAction->params);
		
		echo "<h4>" . $modelEndRe->name . "</h4>";
		echo "<table class=''>";
		foreach ($unserializepParams as $keyPar => $valuePar) {
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
}








