<?php /* @var $this Controller */ ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" xml:lang="sk" lang="sk">
<head>
	<meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
	<meta name="language" content="sk" />
	
<!--	<link href='http://fonts.googleapis.com/css?family=Ubuntu&subset=latin,latin-ext' rel='stylesheet' type='text/css'> -->

	<!-- blueprint CSS framework -->
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/print.css" media="print" />
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/screen.css" media="screen, projection" />
	<!--[if lt IE 8]>
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/ie.css" media="screen, projection" />
	<![endif]-->

	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/main.css" />
	<link rel="stylesheet" type="text/css" href="<?php echo Yii::app()->request->baseUrl; ?>/css/form.css" />
	
	<title><?php echo CHtml::encode($this->pageTitle); ?></title>
</head>

<body>

<div id="sidebar" class="siteWidth">
<?php
	$this->beginWidget('zii.widgets.CPortlet', array(
		//'title'=>Yii::t('app', 'Operations'),
	));
	$this->widget('zii.widgets.CMenu', array(
		'items'=>$this->menu,
		'htmlOptions'=>array('class'=>'operations'),
	));
	$this->endWidget();
?>
</div><!-- sidebar -->


<div class="container siteWidth" id="page">

	<div id="header">
		
	</div><!-- header -->

	<div id="mainmenu">
		<?php 
		//$isOrg = Yii::app()->user->model->orgadmin || Yii::app()->user->model->superuser ;
		$isGuest = Yii::app()->user->isGuest;
		
		$this->widget('zii.widgets.CMenu',array(
			'items'=>array(
				
				
				array('url'	 => Yii::app()->baseUrl.'/site/login', 
					'label'	 => "Login", 
					),
				array('url'	 => Yii::app()->baseUrl.'/endpointLocal', 
					'label'	 => "CDNi interface", 
					),
				array('url'	 => Yii::app()->baseUrl.'/endpointRemote', 
					'label'	 => "CDNi - interconnections", 
					),
				array('url'	 => Yii::app()->baseUrl.'/log', 
					'label'	 => "Logs", 
					),
			),
		)); ?> 
	</div><!-- mainmenu -->
	<?php if(isset($this->breadcrumbs)):?>
		<?php $this->widget('zii.widgets.CBreadcrumbs', array(
			'links'=>$this->breadcrumbs,
		)); ?><!-- breadcrumbs -->
	<?php endif?>

	<?php echo $content; ?>

	<div class="clear"></div>

	<div id="footer">
		&copy; CDNi interface
	</div><!-- footer -->

</div><!-- page -->

</body>
</html>
