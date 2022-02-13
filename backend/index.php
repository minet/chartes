<?php
include_once("sql.php");
include_once("response.php");
include_once("functions.php");
header("Access-Control-Allow-Origin: ". $_CONFIG['allowed_frontend']);
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Authorization, Content-Type, Accept");
header('Content-type: application/json');
$response = new responseObject();
$headers = apache_request_headers();

$header = [
  "Authorization:". $headers['authorization']
];

if($header) {
  $ch = curl_init();
  curl_setopt($ch, CURLOPT_URL,"https://cas.minet.net/oidc/profile");
  curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_VERBOSE, 0);
  $casresponse = curl_exec ($ch);
  curl_close($ch);
}

if(get_id()) {
  if ($_GET['getadhsigned'])
    $response->has_adh_signed();
  else if ($_GET['getadhsignedhosting'])
    $response->has_adh_signed(true);
  else if ($_GET['getsigneddate'])
    $response->get_adh_signed_date();
  else if ($_GET['getsigneddatehosting'])
    $response->get_adh_signed_date(true);
  else if ($_GET['setadhsigned'])
      $response->set_adh_signed($_GET['language'], false, ($_GET['setadhsigned'] != "1" && is_admin() ? $_GET['setadhsigned'] : ""));
  else if ($_GET['setadhsignedhosting'])
    $response->set_adh_signed($_GET['language'], true, ($_GET['setadhsignedhosting'] != "1" && is_admin() ? $_GET['setadhsignedhosting'] : ""));
  else if ($_GET['regeneratecharte'])
    $response->regenerate_charte($_GET['language'], false, ($_GET['regeneratecharte'] != "1" && is_admin() ? $_GET['regeneratecharte'] : ""));
  else if ($_GET['regeneratechartehosting'])
    $response->regenerate_charte($_GET['language'], true, ($_GET['regeneratechartehosting'] != "1" && is_admin() ? $_GET['regeneratechartehosting'] : ""));
  else if ($_GET['countminet'] && is_admin())
    $response->countminet();
  else if ($_GET['counthosting'] && is_admin())
    $response->counthosting();
  else
    $response->error = "Bad action !";
  echo json_encode($response, JSON_UNESCAPED_UNICODE);
}

