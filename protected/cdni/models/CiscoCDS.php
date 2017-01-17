<?php 
	/**
	 * http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/provision.html
	 */
 	
	class CiscoCDS {
		
		function __construct() {
			
		}
		
		private function makeRequest($taskAPI,$action,$params) {
			$modelLocal = EndpointLocal::getLocalEndpoint();
			
            $params['action']=$action;
            
           // $urlString = "https://{$this -> config ['host']}:{$this -> config ['port']}/servlet/$taskAPI?"  .  http_build_query($params);// + "&param=" + channelId_;
            $urlString =  $modelLocal->url_cdn . ":" . $modelLocal->port_cdn . "/servlet/".$taskAPI."?"  .  http_build_query($params);// + "&param=" + channelId_;
            
            // Log::logging("makeRequest() " . $action . " before http_get URL: " . $urlString);
            $response = http_get(
		                    $urlString,
		                    array (
		                    	'httpauth' => $modelLocal->login . ':' . $modelLocal->pass,
		                    	'httpauthtype' => HTTP_AUTH_BASIC
                    	));
			//Log::logging("DEBUG: makeRequest() " . $action . " after http_get + response: " . $response);

            $responseObj=http_parse_message($response);// var_dump($responseObj);
			
            if ($responseObj -> responseCode != 200 ) return false;

            $body=$responseObj->body;
            
            file_put_contents(__DIR__."/resp/".$action.".resp.xml",$body);

            $xml=new SimpleXMLElement($body);
            
            return $xml;
        }
		
		/**
		 * Provides information about the devices in the CDS.
		 * @param 	$type 		Type—Type of device (required) is one of the following: DG (device group), SE, SR, CDSM, or all
		 * @return 	$devices	array of devices with parrams: name id
		 * link: 	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/listingAPI.html#wp1077119
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.DeviceApiServlet?action=getDevicess&type=<all|DG|SE|SR|CDSM>[&name=<device_name>][&id=<device_ID>]
		 */
		public function getDevices($type){
			$devices = array();
			$params = array();
			$params['type'] = $type;
	
			$resXML = $this->makeRequest('com.cisco.unicorn.ui.DeviceApiServlet', 'getDevices', $params);
			
			if($resXML->message["status"] == "success"){
				foreach ($resXML->device as $device){
					$devices[] = array("id" => (string)$device['id'], "name" => (string)$device['name'], "status" => (string)$device['status']);
				}
			} else {
				Log::logging("ERROR: getDevices: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				$devices = array();
			}
			
			//echo $devices[0]['id'];

			return $devices;
		}

		/**
		 * createDeliveryService
		 * Creates a delivery service.
		 * @param 	$name
		 * @param	$contentOriginID
		 * @return	$idDeliveryService
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/provision.html#wp1105988
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=createDeliveryService&deliveryService=<deliveryService_name>&contentOrigin=<contentOrigin_ID>[&weakCert=<true|false>][&skipEncrypt=<true|false>][&priority=<high|medium|low>][&mcastEnable=
		 *			<unicast_only|multicast_only|unicast_multicast>][&live=<true|false>][&quota=<quota>][&qos=
		 *			<system|0-63>][&desc=<description>][&failoverIntvl=<failoverIntvl, <20|30|40|50|60|70|80|90|100|110|120>]
		 *			[&never=<true|false>][&deliveryQos=<0-63>][&sessionQuota=<quota>][&sessionQuotaAugBuf=
		 *			<0-1000>][&bandQuota=<quota>][&bandQuotaAugBuf=<0-1000>][&storagePriorityClass=
		 *			<storagePriorityClass_ID>]
		 * 
		 */
        public function createDeliveryService($name, $contentOriginID) {

            $params = array ();
            $params ['deliveryService'] = $name;
            $params ['contentOrigin'] = $contentOriginID;
            $params ['quota'] = 1000;
            
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ChannelApiServlet', 'createDeliveryService', $params);
           
		   	if($resXML->message["status"] == "success"){
				return (string)$resXML->record["Id_"];
			} else {
				Log::logging("ERROR: createDeliveryService: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return;
			}
			
			return;
        }
		
        public function listDeliveryServices() {
        /* 
            https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getDeliveryServices&param=all
			| [name=]<se_name>, <se_name>, ... | deliveryService=<deliveryService_ID> | location=<location_ID> 
		
			com.cisco.unicorn.ui.ListApiServlet?action=getDeliveryServices&param=all
        */ 
            $params = array ();
            $params ['param'] = 'all';           
            
			Log::logging("DEBUG: listDeliveryServices();");
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ListApiServlet', 'getDeliveryServices', $params);
			//echo "Dumping resXML:"; var_dump($resXML); echo "<br \>";
			
            $amountDSs = $resXML['count'];
            if(!empty($amountDSs)){					
                $res=array();
				$cnt=0;
			
                while ($amountDSs > 0) {
                    $attribs = $resXML->record[$cnt]->attributes();
						
                    foreach ($attribs as $a => $b) {
                        $res[$cnt][$a]=(string)$b;
                    }
			
                    $cnt=$cnt+1;
                    $amountDSs=$amountDSs-1;
				}

                return $res;
            } 
            elseif (empty($amountDSs)){
                return $amountDSs;
            }		
        }
		
		
		/**
		 * deleteDeliveryServices
		 * Deletes delivery services.
		 * 
		 * @param	$deliveryServiceID	
		 * 
		 * link.:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/provision.html#wp1090691
		 * ex.: 	https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=deleteDeliveryServices&deliveryService=all | <deliveryService_ID>, <deliveryService_ID>, ...
		 */
        public function deleteDeliveryServices($deliveryServiceID) {

            $params = array ();
            $params ['deliveryService'] = $deliveryServiceID;
                        
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ChannelApiServlet', 'deleteDeliveryServices', $params);
                        			
            if($resXML->message["status"] == "success"){
				return TRUE;
			} else {
				Log::logging("ERROR: assignSEs: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return FALSE;
			}
			
			return FALSE;
        }
		
		/**
		 * assignSEs
		 * Assigns Service Engines to a specified delivery service.
		 * TODO: dynamicaly selecet $contentAcquirer
		 * 
		 * @param	$deliveryServiceID
		 * @param	$contentAcquirer
		 * @return	bool
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/provision.html#wp1096773
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=assignSEs&
		 *			deliveryService=<deliveryService_ID>[&contentAcquirer=<contentAcquirer_ID>][&se=all | <SE_ID>, <SE_ID>, ...]
		 * 			[&se_enable_primed=all | <se_ID>,<se_ID> ...][&cluster=all | <Cluster_ID>, <Cluster_ID>, ...]
		 */
        public function assignSEs($deliveryServiceID, $contentAcquirer) {
        	$params = array();
            $params ['deliveryService'] = $deliveryServiceID;
			$params ['contentAcquirer'] = $contentAcquirer;
			$params ['se'] = 'all';
           
            
            //$resXML = new SimpleXMLElement(file_get_contents(__DIR__.'/createDeliveryService.resp.xml'));
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ChannelApiServlet', 'assignSEs', $params);
            
			if($resXML->message["status"] == "success"){
				return TRUE;
			} else {
				Log::logging("ERROR: assignSEs: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return FALSE;
			}
			
			return FALSE;
				
	   	}

		/**
		 * unassignSEs
		 * Removes Service Engines from a specified delivery service.
		 * 
		 * @param 	$deliveryServiceID
		 * @return	bool
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/provision.html#wp1070756
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=unassignSEs&deliveryService=<deliveryService_ID>[&se=all | <SE_ID>, <SE_ID>, ...][&cluster=all | <Cluster_ID>, <Cluster_ID>, ...]
		 */
        public function unassignSEs($deliveryServiceID) {
        	$params = array();
            $params ['deliveryService'] = $deliveryServiceID;
			$params ['se'] = 'all';
                   
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ChannelApiServlet', 'unassignSEs', $params);
            
			if($resXML->message["status"] == "success"){
				return TRUE;
			} else {
				Log::logging("ERROR: unassignSEs: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return FALSE;
			}
			
			return FALSE;
        }
				
        public function listServiceEngines() {
        /* 
            https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action=getSEs&param=
			all | [name=]<se_name>, <se_name>, ... | deliveryService=<deliveryService_ID> | location=<location_ID> 
		
			com.cisco.unicorn.ui.ListApiServlet?action=getSEs&param=all
        */ 
            $params = array ();
            $params ['param'] = 'all';           
            
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ListApiServlet', 'getSEs', $params);
            $attribs = $resXML->record->attributes();
            
            $res=array();
            foreach ($attribs as $a => $b) {
                $res[$a]=(string)$b;
            } 
            
            return $res;
        }
		
		
		/**
		 * createContentOrigin
		 * Creates a content origin.
		 * 
		 * @param	$name				// name of ContentOrigin
		 * @param	$originServer		// origin_server_IP_or_domain
		 * @param	$fqdn				// Fully qualified domain name (FQDN)
		 * @return	$idContentOrigin	// status of this action
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/provision.html#wp1090493
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=
		 *			createContentOrigin&name=<contentorigin_name>&origin=<origin_server_IP_or_domain> &fqdn=<fqdn>[&contentBasedRouting=<true | false>][&nasFile=<FileInfo_id | none>]
		 *			[&wmtAuth=<basic | ntlm | digest | negotiate>][&description=<description>]
		 *			[&httpAuthType=<none|basic|challenged>][&httpAuthHeader=<auth_header>][&httpAuthSharedKey=<auth_shared_key>][&httpAuthHeaderPrefix=<auth_header_prefix>][&httpAuthSharedSecKey=
		 *			<auth_shared_secret_key>][&httpAuthHashFunc=<MD5>] [&description=<description>]
		 */	
        public function createContentOrigin($name, $originServer, $fqdn) {
          	
          	$params = array();
            $params ['name'] = $name;
            $params ['origin'] = $originServer;
            $params ['fqdn'] = $fqdn;
           	
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ChannelApiServlet', 'createContentOrigin', $params);
            
			if($resXML->message["status"] == "success"){
				return (string)$resXML->record["Id_"];
			} else {
				Log::logging("ERROR: createContentOrigin: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return;
			}
			
			return;
			
        }
		
		/**
		 * getContentOrigins
		 * Lists selected content origin names or lists every content origin.
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/listingAPI.html#wp1076004
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ListApiServlet?action= getContentOrigins&param=all | <contentOrigin_name>, <contentOrigin_name>, ...
		 * 
		 */
        public function getContentOrigins() {
        	 
            $params = array ();
            $params ['param'] = 'all';           
            
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ListApiServlet', 'getContentOrigins', $params);
			
			if($resXML->message["status"] == "success"){
			//	echo "<pre>";
			//	print_r($resXML);
			//	echo "</pre>";
				return $resXML;
			} else {
				Log::logging("ERROR: getContentOrigins: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return;
			}
			
			return;
        }
		
		/**
		 * deleteContentOrigin
		 * 
		 * @param	$contentOriginID
		 * @return	bool
		 * 
		 * link.:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/provision.html#wp1101386
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.ChannelApiServlet?action=deleteContentOrigins&contentOrigin=all | <contentorigin_ID>, <contentorigin_ID>, ...
		 * 
		 */
        public function deleteContentOrigin($contentOriginID) {
         
            $params ['contentOrigin'] = $contentOriginID;
			           
            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ChannelApiServlet', 'deleteContentOrigins', $params);
            
            if($resXML->message["status"] == "success"){
				return TRUE;
			} else {
				Log::logging("ERROR: deleteContentOrigin: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return FALSE;
			}
			
			return FALSE;
        }
        
        public function addContent($intercon,$content){
            
        }
        
        public function addManifest($deliveryServiceId, $manifestURL, $quota, $ttl, $params = array()) {
            /*
            deliveryService=<deliveryService_ID>&manifest=<manifest_URL>&quota=<quota>&ttl=<ttl>
            [&user=<user_name>][&password=<password>][&userDomainName=<user_domain_name>]
            [&notBasicAuth=<true|false>][&noProxy=<true | false>][&proxyIpHostname=<proxy_ip_hostname>]
            [&proxyPort=<proxy_port>][&proxyUser=<proxy_user>][&proxyPassword=<proxy_password>]
            [&proxyNtlmUserDomainName=<proxy_ntlm_user_domain_name>][&proxyNotBasicAuth=
            <true|false>]
            */
            
            $params['deliveryService'] = $deliveryServiceId;
            $params['manifest'] = $manifestURL;
            $params['quota'] = $quota;
            $params['ttl'] = $ttl;

            $resXML = $this->makeRequest('com.cisco.unicorn.ui.ChannelApiServlet', 'addManifest', $params);
            
			
			
            return $resXML;
        }
		
		/**
		 * applyCdnSelector
		 * Assigns a CDN Selector file to an SR or unassigns a CDN Selector file from an SR.
		 * 
		 * @param	$sr				id of service router
		 * @param	$cdnSelector	file id or 'none' for disable selector file
		 * @return	bool
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/fileManagement.html#wp1096559
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.FileMgmtApiServlet?action=applyCdnSelector&SR=<CrConfig_id>&cdnSelector=<none | FileInfo_id>
		 * 			https://cdsm.cdn.ab.sk:8443/servlet/com.cisco.unicorn.ui.FileMgmtApiServlet?SR%5B0%5D=CrConfig_189&cdnSelector%5B0%5D=FileInfo_496&action=applyCdnSelector
		 * */
		public function applyCdnSelector($sr, $cdnSelector){
			// $cdnSelector is 'none' if we want unassign selector file from SR 
			$params = array();
			$params['SR'] = $sr;
            $params['cdnSelector'] = $cdnSelector;

            $resXML = $this->makeRequest('com.cisco.unicorn.ui.FileMgmtApiServlet', 'applyCdnSelector', $params);
			
			if($resXML->message["status"] == "success"){
				return TRUE;
			} else {
				Log::logging("ERROR: applyCdnSelector: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return FALSE;
			}
			return FALSE;
		}
		
		/**
		 * applyCZ ==> GLOBALY apply CZ
		 * Applies a Coverage Zone file to an SR, removes a Coverage Zone file from an SR, or configures global routing.
		 * 
		 * @param	$cz		none for unassign or id of file
		 * @param	bool
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/fileManagement.html#wp1094385
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.FileMgmtApiServlet?action=applyCZ&target=global&czId=<FileInfo_id>[&dnsTtl=<dns_ttl>]
		 * 
		 */
		public function applyCZ($cz){
			$params = array();
			$params['target'] = 'global';
			$params['czId'] = $cz;
			
			Log::logging('test: ' . $cz );
			
			$resXML = $this->makeRequest('com.cisco.unicorn.ui.FileMgmtApiServlet', 'applyCZ', $params);
			
			if($resXML->message["status"] == "success"){
				return TRUE;
			} else {
				Log::logging("ERROR: applyCZ: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return FALSE;
			}
			return FALSE;
		}
		
		/**
		 * Registers a file with the CDSM using either the import or upload method. 
		 * The import method allows you to import a supported file from an external HTTP, HTTPs, FTP, or CIFS server. 
		 * The upload method allows you to upload a supported file from any location that is accessible from your PC.
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/fileManagement.html#wp1072181
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.FileMgmtApiServlet?action=registerFile&fileType=<1 | 17 | 19 | 20 | 22 | 26>&destName=<destination_filename>&importMethod=import&
					originUrl=<file_url> [&ttl=<update_interval>][&username=<username>][&password=<password>]
					[&domain=<ntlm_domain>][&disableBasicAuth=<false | true>]
		 * @param	$fileName	name of created XML file in files folder
		 * @param	$fileType	type of regisration file
		 * @return	$fileId		id of registered file in CiscoCDS
		 */
		public function registerFile($fileName, $fileType){
			
			$fileId = '';
			
			$modelLocal = EndpointLocal::getLocalEndpoint();
			
			$params = array();
			$params['fileType'] = $fileType;
			$params['destName'] = explode('.', $fileName);
			$params['destName'] = $params['destName'][0];
			$params['importMethod'] = 'import';
			$params['originUrl'] = $modelLocal->url . '/files/' . $fileName;
			$params['ttl'] = 1;
	
			$resXML = $this->makeRequest('com.cisco.unicorn.ui.FileMgmtApiServlet', 'registerFile', $params);
			
			if($resXML->message["status"] == "success"){
				$fileId = $resXML->record['Id_'];
			} else {
				Log::logging("ERROR: registerFile: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				$fileId = '';
			}
			
			return $fileId;		
		}
		
		/**
		 * Validates a registered file, or uploads or imports a file into the CDSM and validates the file.
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/fileManagement.html#wp1100408
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.FileMgmtApiServlet?action=validateFile&fileType=<1 | 17 | 19 | 20 | 22><&id=<FileInfo_id>
		 */
		public function validateFile(){
			
		}
		
		/**
		 * Removes a registered file from the CDSM.
		 * 
		 * @param 	$fileId
		 * @param	$fileType
		 * 
		 * link:	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/developer_guide/iscds32APIGuide/fileManagement.html#wp1095945
		 * ex.:		https://<cdsmIpAddress>:8443/servlet/com.cisco.unicorn.ui.FileMgmtApiServlet?action=deleteFile&fileType=<1 | 17 | 19 | 20 | 22 | 26>&id=<FileInfo_id>
		 */
		public function deleteFile($fileId, $fileType){
			
			$params = array();
			$params['fileType'] = $fileType;
			$params['id'] = $fileId;
	
			$resXML = $this->makeRequest('com.cisco.unicorn.ui.FileMgmtApiServlet', 'deleteFile', $params);
			
			if($resXML->message["status"] == "success"){
				return TRUE;
			} else {
				Log::logging("ERROR: deleteFile: " . $resXML->message["status"] . ":" . $resXML->message["message"]);
				return FALSE;
			}
			
			return FALSE;
		}

		/**
		 * 
		 * Creating CoverageZone file
		 * http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/2_5/configuration_guide/is_cds25-cfguide/coverzoneXML.html#wpxref68070
		 */
		public function generateCoverageZoneFile(){
			//$model = EndpointRemote::model()->findByPk($id);
			$modelLocal = EndpointLocal::getLocalEndpoint();
			
			$xml = new SimpleXMLElement('<?xml version="1.0" ?><CDNNetwork></CDNNetwork>');
			$xml->addChild('revision', '1.0');
			
			// get all SE devices
			$devicesSE = $this->getDevices('SE');
			
			$modelFootprint = Footprint::model()->findAllByAttributes(array('endpoint_id' => $modelLocal->id));
			foreach ($modelFootprint as $keyFoot => $valueFoot) {
				$coverageZone = $xml->addChild('coverageZone');
					$coverageZone->addChild('network', $valueFoot->subnet_ip.'/'.$valueFoot->prefix);
					// add SE ... in this case we add all service engines
					foreach ($devicesSE as $keySE => $valueSE) {
						$coverageZone->addChild('SE', (string)$valueSE['name']);
					}
					$coverageZone->addChild('metric', 5);
			}			
		/*	$coverageZone = $xml->addChild('coverageZone');
				$coverageZone->addChild('network', '192.1.2.0/16');
				$coverageZone->addChild('SE', 'CDE-200-SE1');
				$coverageZone->addChild('SE', 'CDE-200-SE2');
				$coverageZone->addChild('metric', '5');
			$coverageZone = $xml->addChild('coverageZone');
				$coverageZone->addChild('network', '192.1.5.0/16');
				$coverageZone->addChild('SE', 'CDE-200-SE3');
				$coverageZone->addChild('SE', 'CDE-200-SE4');
				$coverageZone->addChild('metric', '5');*/
			
		//	Header('Content-type: text/xml');
		//	print $xml->asXML();	
			
			
			$nameOfCoverageZoneFile = 'CoverageZoneFile' . time() . '.xml';
			file_put_contents(__DIR__."/../../files/" . $nameOfCoverageZoneFile, $xml->asXML());
			
			return $nameOfCoverageZoneFile;
			
			
		}
		
		/**
		 * Creating CDN Selector Files
		 * link: 	http://www.cisco.com/c/en/us/td/docs/video/cds/cda/is/3_2/configuration_guide/ISCDS3-2config/CDNSelector.html
		 * 
		 * @param	$id						id of endpointRemote
		 * @return 	$nameOfSelectorFile		name of generated selector file
		 */
		public function generateCdnSelectorFile($id){
			//$model = EndpointRemote::model()->findByPk($id);
			
			/**
			 * TODO: Find only sucesfully created CDNi
			 */
			$models = EndpointRemote::model()->findAllByAttributes(array('endpoint_type_id' => 2));
			$defaultModel;
			$groupCount = 1;
			
			
			//vytvorime XML
			$xml = new SimpleXMLElement('<?xml version="1.0" encoding="UTF-8"?> <CDNSelector xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:noNamespaceSchemaLocation="CDNSelector.xsd"></CDNSelector>');
			$xml->addChild('Revision', '1.0');
			
			//CDNList provides the list of CDNs along with the mapping to the HTTP URLs to be queried for 3rd-party URL translation
			$cdnList = $xml->addChild('CDNList');
				foreach ($models as $keyModel => $valueModel) {
					$cdn = $cdnList->addChild('CDN');
					$cdn->addAttribute('name', $valueModel->name);
					$cdn->addAttribute('translatorUrl', $valueModel->url_translator);	
					
					
					/**
					 * TODO: choice default Endpoint based on ex.: priority
					 */
					$defaultModel = $valueModel;
					
				}
			
			
			foreach ($models as $keyModel => $valueModel) {
				//CDNGroup is a set of CDNs that get chosen depending on the SelectionPolicy configured for each CDNGroup 
				$cdnGroup = $xml->addChild('CDNGroup');
					//The set of CDNs in the CDN Group
					$cdnGroup->addAttribute('grpName', 'CDNGroup' . $groupCount);
					$groupCount++;
					
						$cdnGroup->addChild('CDNName', $valueModel->name);
						$selectionPolicyGroup = $cdnGroup->addChild('SelectionPolicyGroup');
							//The selection policy for the CDNs listed above
							$SelectionPolicy = $selectionPolicyGroup->addChild('SelectionPolicy');
								$contentType = $SelectionPolicy->addChild('ContentType');
								
								$modelCapabilities = EndpointCapability::model()->findAllByAttributes(array('endpoint_id' => $valueModel->id));
								foreach ($modelCapabilities as $keyEndCap => $valueEndCap) {
									$capability = Capability::model()->findByAttributes(array('id' => $valueEndCap->capability_id));	
									
									$contentType->addChild('Extension', $capability->value);
								}
								
								$geoLoc = $SelectionPolicy->addChild('GeoLoc');
								//The client request should be from China 
									$country = $geoLoc->addChild('Country');
									$country->addAttribute('name', 'Slovakia');	
			}

			//Order is not supported in 2.5.7 or 2.5.9
     		//If required, specify the order in which the CDN Groups are processed. Used if there are overlapping  selection policies
			
			$xml->addChild('Order', 'CDNGroup1'); // example of order => CDNGroup1, CDNGroup2
			
			$xml->addChild('Default', $defaultModel->name);
			
			$nameOfSelectorFile = 'SelectorFile' . time() . '.xml';
			file_put_contents(__DIR__."/../../files/" . $nameOfSelectorFile, $xml->asXML());
			
			return $nameOfSelectorFile;
			
			
			
			
			
			/*
			
			//CDNGroup is a set of CDNs that get chosen depending on the SelectionPolicy configured for each CDNGroup 
			$cdnGroup = $xml->addChild('CDNGroup');
				//The set of CDNs in the CDN Group
				$cdnGroup->addAttribute('grpName', 'CDNGroup1');
				
				foreach ($models as $keyModel => $valueModel) {
					$cdnGroup->addChild('CDNName', $valueModel->name);
					$selectionPolicyGroup = $cdnGroup->addChild('SelectionPolicyGroup');
					//The selection policy for the CDNs listed above
						$SelectionPolicy = $selectionPolicyGroup->addChild('SelectionPolicy');
							$contentType = $SelectionPolicy->addChild('ContentType');
							//The requested file should be HTML
								//$contentType->addChild('Extension', 'm3u8');
								
								$modelCapabilities = EndpointCapability::model()->findAllByAttributes(array('endpoint_id' => $valueModel->id));
								foreach ($modelCapabilities as $keyEndCap => $valueEndCap) {
									$capability = Capability::model()->findByAttributes(array('id' => $valueEndCap->capability_id));	
									
									$contentType->addChild('Extension', $capability->value);
								}
								
							$geoLoc = $SelectionPolicy->addChild('GeoLoc');
							//The client request should be from China 
								$country = $geoLoc->addChild('Country');
								$country->addAttribute('name', 'Slovakia');	
				}
			
			//Order is not supported in 2.5.7 or 2.5.9
     		//If required, specify the order in which the CDN Groups are processed. Used if there are overlapping  selection policies
			
			$xml->addChild('Order', 'CDNGroup1'); // example of order => CDNGroup1, CDNGroup2
			
			$xml->addChild('Default', $defaultModel->name);
			
			$nameOfSelectorFile = 'SelectorFile' . time() . '.xml';
			file_put_contents(__DIR__."/../../files/" . $nameOfSelectorFile, $xml->asXML());
			
			return $nameOfSelectorFile;*/
		}
		
		/**
		 * removeInterconnection
		 * function extend functionality of actionDelete in EndpointRemoteController for CISCO CDS
		 * 
		 * @param	$endpointRemoteId
		 * 
		 */
		public function removeInterconnection($endpointRemoteId){
			$criteria=new CDbCriteria;
			$criteria->addSearchCondition('endpoint_id', $endpointRemoteId);
			
			$models=CdniAction::model()->findAll($criteria);
			
			
			// UPSTREAM CDN
			
			/**
			 * OLD ... this belong to Selector File ID 
			 *		
	  		foreach ($models as $key => $model) {
				//$model = CdniAction::model()->findByPk($value->id);
				//	CDNi Upstream
				if($model->action == "applyCdnSelector"){
					$params = unserialize($model->params);
					$this->applyCdnSelector($params['idSr'], 'none');
					Log::logging("DELETE 'applyCdnSelector' from " . $params['idSr']);
				}			
			}*/
			
			foreach ($models as $key => $model) {
				if($model->action == "applyCZ"){
					//$params = unserialize($model->params);
					$this->applyCZ('none');
					Log::logging("DELETE 'applyCZ' from globaly");
				}			
			}
			
			
			foreach ($models as $key => $model) {
				//$model = CdniAction::model()->findByPk($value->id);
				//	CDNi Upstream
				if($model->action == "registerFile"){
					$params = unserialize($model->params);
					if(!empty($params['selectorFileId'])){
						$this->deleteFile($params['selectorFileId'], '19');
						Log::logging("DELETE 'registerFile' id:" . $params['selectorFileId']);
					} elseif(!empty($params['coverageZoneFileId'])){
						$this->deleteFile($params['coverageZoneFileId'], '1');
						Log::logging("DELETE 'registerFile' id:" . $params['coverageZoneFileId']);
					}
					
					
					
					
				}
			}
			
			// END UPSTREAM CDN
			
			
			// DOWNSTREAM CDN
			
			foreach ($models as $key => $model) {
				if($model->action == "createDeliveryService"){
					$params = unserialize($model->params);
					if($this->unassignSEs($params['idDeliveryService'])){
						Log::logging("DELETE 'unassignSEs' id:" . $params['idDeliveryService']);
					} else {
						Log::logging("ERROR: DELETE 'unassignSEs' id:" . $params['idDeliveryService']);
					}
					
					if($this->deleteDeliveryServices($params['idDeliveryService'])){
						Log::logging("DELETE 'deleteDeliveryServices' id:" . $params['idDeliveryService']);
					} else {
						Log::logging("ERROR: DELETE 'deleteDeliveryServices' id:" . $params['idDeliveryService']);
					}
					
				}
			}
			
			foreach ($models as $key => $model) {
				if($model->action == "createContentOrigin"){
					$params = unserialize($model->params);
					if($this->deleteContentOrigin($params['idContentOrigin'])){
						Log::logging("DELETE 'deleteContentOrigin' id:" . $params['idContentOrigin']);
					} else {
						Log::logging("ERROR: DELETE 'deleteContentOrigin' id:" . $params['idContentOrigin']);
					}
				}
			}
			
			// END DOWNSTREAM CDN
			
			
			// DELETE action
			foreach ($models as $key => $value) {
				$model = CdniAction::model()->findByPk($value->id);
				$model->delete();	
			}
		}
	}
	

?>