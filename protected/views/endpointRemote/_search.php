<div class="wide form">

<?php $form = $this->beginWidget('GxActiveForm', array(
	'action' => Yii::app()->createUrl($this->route),
	'method' => 'get',
)); ?>

	<div class="row">
		<?php echo $form->label($model, 'id'); ?>
		<?php echo $form->textField($model, 'id', array('maxlength' => 10)); ?>
	</div>

	<div class="row">
		<?php echo $form->label($model, 'name'); ?>
		<?php echo $form->textField($model, 'name', array('maxlength' => 20)); ?>
	</div>

	<div class="row">
		<?php echo $form->label($model, 'url'); ?>
		<?php echo $form->textField($model, 'url', array('maxlength' => 100)); ?>
	</div>

	<div class="row">
		<?php echo $form->label($model, 'priority'); ?>
		<?php echo $form->textField($model, 'priority', array('maxlength' => 1)); ?>
	</div>

	<div class="row">
		<?php echo $form->label($model, 'endpoint_status_id'); ?>
		<?php echo $form->dropDownList($model, 'endpoint_status_id', GxHtml::listDataEx(EndpointStatus::model()->findAllAttributes(null, true)), array('prompt' => Yii::t('app', 'All'))); ?>
	</div>

	<div class="row">
		<?php echo $form->hiddenField($model,'endpoint_type_id',array('value'=>'2')); ?>
	<!--	<?php echo $form->label($model, 'endpoint_type_id'); ?>
		<?php echo $form->dropDownList($model, 'endpoint_type_id', GxHtml::listDataEx(EndpointType::model()->findAllAttributes(null, true)), array('prompt' => Yii::t('app', 'All'))); ?>
	-->
	</div>

	<div class="row buttons">
		<?php echo GxHtml::submitButton(Yii::t('app', 'Search')); ?>
	</div>

<?php $this->endWidget(); ?>

</div><!-- search-form -->
