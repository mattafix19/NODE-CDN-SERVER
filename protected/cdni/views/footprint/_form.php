<div class="form">


<?php $form = $this->beginWidget('GxActiveForm', array(
	'id' => 'footprint-form',
	'enableAjaxValidation' => false,
));
?>

	<p class="note">
		<?php echo Yii::t('app', 'Fields with'); ?> <span class="required">*</span> <?php echo Yii::t('app', 'are required'); ?>.
	</p>

	<?php echo $form->errorSummary($model); ?>

		<div class="row">
		<?php echo $form->labelEx($model,'endpoint_id'); ?>
		<!-- show only endpointLocal at choice. -->
		<?php echo $form->dropDownList($model, 'endpoint_id', GxHtml::listDataEx(EndpointLocal::model()->findAllAttributes(null, true, 'endpoint_type_id = 1', '1'))); ?>
		<?php echo $form->error($model,'endpoint_id'); ?>
		</div><!-- 
		<div class="row">
		<?php echo $form->labelEx($model,'subnet_num'); ?>
		<?php echo $form->textField($model, 'subnet_num', array('maxlength' => 10)); ?>
		<?php echo $form->error($model,'subnet_num'); ?>
		</div>
		<div class="row">
		<?php echo $form->labelEx($model,'mask_num'); ?>
		<?php echo $form->textField($model, 'mask_num', array('maxlength' => 10)); ?>
		<?php echo $form->error($model,'mask_num'); ?>
		</div>-->
		<div class="row">
		<?php echo $form->labelEx($model,'subnet_ip'); ?>
		<?php echo $form->textField($model, 'subnet_ip', array('maxlength' => 15)); ?>
		<?php echo $form->error($model,'subnet_ip'); ?>
		</div><!-- row -->
		<div class="row">
		<?php echo $form->labelEx($model,'prefix'); ?>
		<?php echo $form->textField($model, 'prefix', array('maxlength' => 2)); ?>
		<?php echo $form->error($model,'prefix'); ?>
		</div><!-- row -->


<?php
echo GxHtml::submitButton(Yii::t('app', 'Save'));
$this->endWidget();
?>
</div><!-- form -->