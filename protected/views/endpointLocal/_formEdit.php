<div class="formEditEndpointLocal">


<?php $form = $this->beginWidget('GxActiveForm', array(
	'id' => 'endpoint-local-form',
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
		<?php echo $form->labelEx($model,'url_translator'); ?>
		<?php echo $form->textField($model, 'url_translator', array('maxlength' => 100)); ?>
		<?php echo $form->error($model,'url_translator'); ?>
		</div><!-- row -->
		<div class="row">
		<?php echo $form->labelEx($model,'url_cdn'); ?>
		<?php echo $form->textField($model, 'url_cdn', array('maxlength' => 100)); ?>
		<?php echo $form->error($model,'url_cdn'); ?>
		</div><!-- row -->
		<div class="row">
		<?php echo $form->labelEx($model,'port_cdn'); ?>
		<?php echo $form->textField($model, 'port_cdn'); ?>
		<?php echo $form->error($model,'port_cdn'); ?>
		</div><!-- row -->
		<div class="row">
		<?php echo $form->labelEx($model,'login'); ?>
		<?php echo $form->textField($model, 'login', array('maxlength' => 20)); ?>
		<?php echo $form->error($model,'login'); ?>
		</div><!-- row -->
		<div class="row">
		<?php echo $form->labelEx($model,'pass'); ?>
		<?php echo $form->textField($model, 'pass', array('maxlength' => 20)); ?>
		<?php echo $form->error($model,'pass'); ?>
		</div><!-- row -->
		<label><?php echo GxHtml::encode($model->getRelationLabel('capabilities')); ?></label>
		<?php echo $form->checkBoxList($model, 'capabilities', GxHtml::encodeEx(GxHtml::listDataEx(Capability::model()->findAllAttributes(null, true)), false, true)); ?>
<?php
echo GxHtml::submitButton(Yii::t('app', 'Save'));
$this->endWidget();
?>
</div><!-- form -->