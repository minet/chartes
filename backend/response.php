<?php

class responseObject {
  public $response;
  public $error;

  function has_adh_signed($hosting = false, $adh = "") {
      if (get_adh($adh)) {
        $r = get_adh($adh);
        if (!$hosting)
          $this->response = ($r['datesignedminet'] ? "signé" : "non signé"); // on renvoie la valeur de la signature si le mec existe
        else
          $this->response = ($r['datesignedhosting'] ? "signé" : "non signé"); // on renvoie la valeur de la signature si le mec existe
      } else
        $this->error = "L'utilisateur n'existe pas !"; // on renvoie false si l'user n'existe pas
  }

  function get_adh_signed_date($hosting = false, $adh = "") {
    if(get_adh($adh)) {
      $r = get_adh($adh);
      if(!$hosting)
        $this->response = $r['datesignedminet']; // on renvoie la valeur de la signature si le mec existe
      else
        $this->response = $r['datesignedhosting']; // on renvoie la valeur de la signature si le mec existe
    } else
      $this->error = "L'utilisateur n'existe pas !"; // on renvoie false si l'user n'existe pas
  }

  function set_adh_signed($language = "en", $hosting = false, $adh = "") {
    global $mysqli;
    global $header;
    $this->has_adh_signed($hosting, $adh);
    if($this->response == "signé") {
      $this->error = "Cet adhérent a déjà signé.";
      unset($this->response);
    } else if ($this->response == "non signé") {
      $r = get_adh($adh);
      if (!$hosting) {
        $url = "https://adh6.minet.net/api/member/" . $r['id'] . "/charter/1";
        $ch = curl_init($url);
        curl_setopt($ch, CURLOPT_PUT, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $content = curl_exec($ch);
        $code = curl_getinfo($ch , CURLINFO_HTTP_CODE);
        if ($code == 204) {
          generate_charte($language, $hosting, $adh);
          send_mail($language, $adh);
        } else {
          $this->error = "Permission insuffisante ou problème interne !";
          unset($this->response);
        }
        curl_close($ch);
      } else {
          $url = "https://adh6.minet.net/api/member/" . $r['id'] . "/charter/2";
          $ch = curl_init($url);
          curl_setopt($ch, CURLOPT_PUT, true);
          curl_setopt($ch, CURLOPT_HTTPHEADER, $header);
          curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
          $content = curl_exec($ch);
          $code = curl_getinfo($ch , CURLINFO_HTTP_CODE);
          if ($code == 204) {
              generate_charte($language, $hosting, $adh);
              send_mail($language, $adh);
          } else {
              $this->error = "Permission insuffisante ou problème interne !";
              unset($this->response);
          }
      }
      $this->response = "Signature effectuée";
    } else {
      $this->response = "Une erreur est survenue";
    }
  }

  function regenerate_charte($language = "en", $hosting = false, $adh = "") {
    $r = get_adh($adh);
    if(($r['datesignedminet'] && !$hosting) || ($r['datesignedhosting'] && $hosting)) {
      $this->response = "Charte régénérée";
      send_mail($language, $adh, true);
    } else
      $this->error = "La charte n'a pas été signée ou un problème a eu lieu!";
  }

  function countminet() {
    global $mysqli;
    $result = $mysqli->query("select id from adherents where datesignedminet <> NULL");
    $this->response = mysqli_num_rows($result);
  }

  function counthosting() {
    global $mysqli;
    $result = $mysqli->query("select id from adherents where datesignedhosting <> NULL");
    $this->response = mysqli_num_rows($result);
  }

}
