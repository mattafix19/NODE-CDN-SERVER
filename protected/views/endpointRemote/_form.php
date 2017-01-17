<div class="form">


<?php $form = $this->beginWidget('GxActiveForm', array(
	'id' => 'endpoint-form',
	'enableAjaxValidation' => false,
));
?>

	<p class="note">
		<?php echo Yii::t('app', 'Fields with'); ?> <span class="required">*</span> <?php echo Yii::t('app', 'are required'); ?>.
	</p>

	<?php echo $form->errorSummary($model); ?>

		<div class="row">
		<?php echo $form->labelEx($model,'name'); ?>
		<?php echo $form->textField($model, 'name', array('maxlength' => 20)); ?>
		<?php echo $form->error($model,'name'); ?>
		</div><!-- row -->
		<div class="row">
		<?php echo $form->labelEx($model,'url'); ?>
		<?php echo $form->textField($model, 'url', array('maxlength' => 100)); ?>
		<?php echo $form->error($model,'url'); ?>
		</div><!-- row -->
		<div class="row">
		<?php echo $form->labelEx($model,'priority'); ?>
		<?php echo $form->textField($model, 'priority', array('maxlength' => 1)); ?>
		<?php echo $form->error($model,'priority'); ?>
		</div><!-- row -->
		<div class="row">
	<!--	<?php echo $form->labelEx($model,'endpoint_status_id'); ?>
		<?php echo $form->dropDownList($model, 'endpoint_status_id', GxHtml::listDataEx(EndpointStatus::model()->findAllAttributes(null, true))); ?>
		<?php echo $form->error($model,'endpoint_status_id'); ?> 
		<?php echo $form->hiddenField($model,'endpoint_status_id',array('value'=>'1')); ?>-->
		</div><!-- row -->
		<div class="row">
	<!--	<?php echo $form->labelEx($model,'endpoint_type_id'); ?>
		<?php echo $form->dropDownList($model, 'endpoint_type_id', GxHtml::listDataEx(EndpointType::model()->findAllAttributes(null, true))); ?>
		<?php echo $form->error($model,'endpoint_type_id'); ?> 
		<?php echo $form->hiddenField($model,'endpoint_type_id',array('value'=>'2')); ?>-->
		</div><!-- row -->

	<!--	<label><?php echo GxHtml::encode($model->getRelationLabel('capabilities')); ?></label>
		<?php echo $form->checkBoxList($model, 'capabilities', GxHtml::encodeEx(GxHtml::listDataEx(Capability::model()->findAllAttributes(null, true)), false, true)); ?>
		<label><?php echo GxHtml::encode($model->getRelationLabel('footprints')); ?></label>
		<?php echo $form->checkBoxList($model, 'footprints', GxHtml::encodeEx(GxHtml::listDataEx(Footprint::model()->findAllAttributes(null, true)), false, true)); ?>
	-->
	<?php
	echo GxHtml::submitButton(Yii::t('app', 'Save'));
	$this->endWidget();
	?>
</div><!-- form -->