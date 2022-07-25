<?php
error_reporting(E_ERROR | E_PARSE);
include_once("sql.php");
include_once("response.php");
include_once("functions.php");

// on autorise seulement le frontend à interroger le backend, et seulement pour certains types de requêtes
header("Access-Control-Allow-Origin: ". $_CONFIG['allowed_frontend']);
header("Access-Control-Allow-Methods: PUT, GET, POST, DELETE");
header("Access-Control-Allow-Headers: Authorization, Content-Type, Accept");
header('Content-type: application/json');
$response = new responseObject();

// on récupère le header utilisé par le client.
$headers = apache_request_headers();

// cela permet de récupérer le token CAS lors de la connexion.
$header = [
  "Authorization:". $headers['authorization']
];

if($header) {
  $ch = curl_init();
  // récupération des infos du client via son token cas.
  curl_setopt($ch, CURLOPT_URL,"https://cas.minet.net/oidc/profile");
  curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
  curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
  curl_setopt($ch, CURLOPT_VERBOSE, 0);
  $casresponse = curl_exec ($ch);
  curl_close($ch);
}

// si le client est bien authentifié on peut autoriser les requêtes API suivantes via des variables GET.
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
      $response->set_adh_signed($_GET['language'], false, ($_GET['setadhsigned'] != "1" && is_admin() ? $_GET['setadhsigned'] : "")); // si on est admin on met l'ID de l'adhérent sur qui on agit, sinon 1.
  else if ($_GET['setadhsignedhosting'])
    $response->set_adh_signed($_GET['language'], true, ($_GET['setadhsignedhosting'] != "1" && is_admin() ? $_GET['setadhsignedhosting'] : "")); // si on est admin on met l'ID de l'adhérent sur qui on agit, sinon 1.
  else if ($_GET['regeneratecharte'])
    $response->regenerate_charte($_GET['language'], false, ($_GET['regeneratecharte'] != "1" && is_admin() ? $_GET['regeneratecharte'] : "")); // si on est admin on met l'ID de l'adhérent sur qui on agit, sinon 1.
  else if ($_GET['regeneratechartehosting'])
    $response->regenerate_charte($_GET['language'], true, ($_GET['regeneratechartehosting'] != "1" && is_admin() ? $_GET['regeneratechartehosting'] : "")); // si on est admin on met l'ID de l'adhérent sur qui on agit, sinon 1.
  else if ($_GET['countminet'] && is_admin())
    $response->countcharter(); // on ne veut que les chartes miNET
  else if ($_GET['counthosting'] && is_admin())
    $response->countcharter(true); // on ne veut que les chartes hosting
  else
    $response->error = "Bad action !";
  echo json_encode($response, JSON_UNESCAPED_UNICODE); // renvoi sous format JSON la réponse de l'API.
}

