<?php

/**
 * Class responseObject
 * response : message de réponse quand tout se passe bien
 * error : message d'erreur quand un problème survient
 */
class responseObject {
    public $response;
    public $error;

    /**
     * Permet de vérifier si un adhérent a signé une des deux chartes
     * @param false $hosting permet de définir si on parle de la charte hosting ou minet
     * @param string $adh login de l'adhérent si un admin utilise la fonction sinon vide si c'est l'adhérent lui-même
     * @return "signé" si la charte est signé sinon "non signé". Cas d'erreur : message via le champ error.
     */
    function has_adh_signed($hosting = false, $adh = "") {
        // on check si l'adhérent existe (ou admin cas échéant)
        if (get_adh($adh)) {
            $r = get_adh($adh);
            // on considère la charte signée si la date de signature n'est pas nulle
            if (!$hosting)
                $this->response = ($r['datesignedminet'] ? "signé" : "non signé"); // on renvoie la valeur de la signature si le mec existe
            else
                $this->response = ($r['datesignedhosting'] ? "signé" : "non signé"); // on renvoie la valeur de la signature si le mec existe
        } else
            $this->error = "L'utilisateur n'existe pas !"; // on renvoie false si l'user n'existe pas
    }

    /**
     * Permet de récupérer la date de signature de l'adhérent pour l'une des deux chartes
     * @param false $hosting permet de définir si on parle de la charte hosting ou minet
     * @param string $adh login de l'adhérent si un admin utilise la fonction sinon vide si c'est l'adhérent lui-même
     * @return date de signature de la charte concernée. Cas d'erreur : message via le champ error.
     */
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

    /**
     * Permet de à un adhérent de signer une charte ou faire signer celle-ci si l'on est admin.
     * @param string $language permet de définir la langue de la charte, par défaut en anglais.
     * @param false $hosting permet de définir si on parle de la charte hosting ou minet
     * @param string $adh login de l'adhérent si un admin utilise la fonction sinon vide si c'est l'adhérent lui-même
     * @return Renvoie "signature effectuée" en cas de succès Cas d'erreur : message via le champ error.
     */
    function set_adh_signed($language = "en", $hosting = false, $adh = "") {
        global $header;
        $this->has_adh_signed($hosting, $adh);
        if($this->response == "signé") {
            $this->error = "Cet adhérent a déjà signé.";
            unset($this->response);
        } else if ($this->response == "non signé") {
            $r = get_adh($adh);
            
            // on utilise l'api adh6 pour faire signer la charte. Id hosting : 2, Id MiNET : 1.
            $url = "https://adh6.minet.net/api/member/" . $r['id'] . "/charter/. "($hosting ? "2" : "1");
            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_PUT, true);
            
            // on réutilise le header pour donner à l'api ADH6 le token CAS de la personne qui souhaite signer/faire signer
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
            $this->response = "Signature effectuée";
        } else {
            $this->response = "Une erreur est survenue";
        }
    }

    /**
     * Permet de régénérer le PDF et renvoyer un mail à l'adhérent concerné. 
     * @param string $language langue de la charte, par défaut en anglais
     * @param false $hosting permet de savoir de quelle charte on parle
     * @param string $adh rempli si un admin souhaite effectuer l'action pour un adhérent, vide sinon
     */
    function regenerate_charte($language = "en", $hosting = false, $adh = "") {
        $r = get_adh($adh);
        if(($r['datesignedminet'] && !$hosting) || ($r['datesignedhosting'] && $hosting)) {
            $this->response = "Charte régénérée";
            
            // la variable regenerate de la fonction permet de regénérer un PDF avant l'envoi du mail 
            send_mail($language, $adh, true);
        } else
            $this->error = "La charte n'a pas été signée ou un problème a eu lieu!";
    }

    /**
     * Permet de compter le nombre de chartes signée pour un type de charte en particulier via une requête SQL.
     * @return le nombre de lignes obtenues dans la DB via une response.
     */
    function countcharter($hosting = false) {
        global $mysqli;
        $result = $mysqli->query("select id from adherents where " . ($hosting ? "datesignedhosting" : "datesignedminet") . " <> 'NULL'");
        $this->response = mysqli_num_rows($result);
    }
}
