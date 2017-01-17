<?php

$this->breadcrumbs = array(
	Log::label(2),
	Yii::t('app', 'Index'),
);

$this->menu = array(
	array('label'=>Yii::t('app', 'Clear Logs'), 'url' => array('clear')),
);
?>

<h1><?php echo GxHtml::encode(Log::label(2)); ?></h1>

<?php 


echo "<table id='logTable'>";
foreach ($logs as $key => $value) {
	echo "<tr>";
		echo "<td style='width:150px;'>";
		echo $value->time;
		echo "</td>";
		echo "<td style='width:980px;'>";
		echo $value->message;
		echo "</td>";
	echo "</tr>";
}
echo "</table>";



