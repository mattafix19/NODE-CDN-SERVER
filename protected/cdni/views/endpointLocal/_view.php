<div class="view">

	<?php echo GxHtml::encode($data->getAttributeLabel('id')); ?>:
	<?php echo GxHtml::link(GxHtml::encode($data->id), array('view', 'id' => $data->id)); ?>
	<br />

	<?php echo GxHtml::encode($data->getAttributeLabel('name')); ?>:
	<?php echo GxHtml::encode($data->name); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('url')); ?>:
	<?php echo GxHtml::encode($data->url); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('priority')); ?>:
	<?php echo GxHtml::encode($data->priority); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('endpoint_status_id')); ?>:
		<?php echo GxHtml::encode(GxHtml::valueEx($data->endpointStatus)); ?>
	<br />
	<?php echo GxHtml::encode($data->getAttributeLabel('endpoint_type_id')); ?>:
		<?php echo GxHtml::encode(GxHtml::valueEx($data->endpointType)); ?>
	<br />

</div>