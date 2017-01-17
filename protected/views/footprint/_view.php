<div class="view">

	<?php echo GxHtml::encode($data->getAttributeLabel('id')); ?>:
	<?php echo GxHtml::link(GxHtml::encode($data->id), array('view', 'id' => $data->id)); ?>
	<br />

	<?php echo GxHtml::encode($data->getAttributeLabel('endpoint_id')); ?>:
		<?php echo GxHtml::encode(GxHtml::valueEx($data->endpoint)); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('subnet_num')); ?>:
	<?php echo GxHtml::encode($data->subnet_num); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('mask_num')); ?>:
	<?php echo GxHtml::encode($data->mask_num); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('subnet_ip')); ?>:
	<?php echo GxHtml::encode($data->subnet_ip); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('prefix')); ?>:
	<?php echo GxHtml::encode($data->prefix); ?>
	<br />

</div>