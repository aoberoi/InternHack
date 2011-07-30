<?php
require 'sdk/OpenTokSDK.php';

$a = new OpenTokSDK(API_Config::API_KEY,API_Config::API_SECRET);

switch ($_GET['userType']) {
	// User is seeker, generate token based off session
	case 0:
		$the_token = $a->generate_token($_GET['sessionId'], RoleConstants::MODERATOR);
		$arr = array("token"=>$the_token, "sessionId"=>$_GET['sessionId'], "status"=>200);
		break;
	// User is representative, generate session & token
	case 1:
		$the_session = $a->create_session('127.0.0.1')->getSessionId();
		$the_token = $a->generate_token($the_session, RoleConstants::MODERATOR);
		$arr = array("token"=>$the_token, "sessionId"=>$the_session, "status"=>200);
	default:
		$arr = array("token"=>"null", "sessionId"=>"null", "status"=>400);
}

$output = json_encode($arr);
echo $output;
?>