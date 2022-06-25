<?php
use setasign\Fpdi\Fpdi;
//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
//Load Composer's autoloader
require 'vendor/autoload.php'; // utilisé pour la génération de chartes

/**
 * Permet de récupérer le login de l'adhérent via la réponse du CAS
 * @return le login de l'adhérent
 */
function get_id() {
    global $casresponse;
    $todisp = json_decode($casresponse);
    return $todisp->sub;
}

/**
 * Permet de savoir si la personne connectée est admin. DOnc si elle possède le groupe nécessaire à l'administration.
 * @return true si la personne est admin
 * @return false si la personne n'est pas admin
 */
function is_admin() {
    global $casresponse;
    global $_CONFIG;
    if(((json_decode($casresponse)->attributes)->is_naina) == "true") // si la personne est nainA
        return True;

  // on regarde les groupes LDAP potentiels mentionnés dans la réponse CAS.
  $attributesRoles = (json_decode($casresponse)->attributes)->memberOf;
  if($attributesRoles) {
      // si la personne possède bien des groupes on check si le DN du groupe nécessaire est bien dans ceux-ci
      if (strpos(json_encode($attributesRoles), $_CONFIG['dnadmin']))
          return True;
      else
          return False;
  }
  return False;
}

/**
 * Permet de récupérer les infos de l'adhérent. On devrait tout récupérer par ADH6 mais... l'API ne renvoie pas tout donc on fait via requête SQL.
 * @param $adh login de l'adhérent si on est admin sinon rien.
 * @return array tableau avec les informations de l'adhérent.
 */
function get_adh($adh) {
    if($adh == "")
        $adh = get_id();
    global $mysqli;
    $result = $mysqli->query("select id,login,mail,nom,prenom,datesignedminet,datesignedhosting from adherents where login = '". mysqli_escape_string($mysqli, $adh) ."' limit 1");
    return $result->fetch_assoc();
}

/**
 * Permet de générer le PDF lié à la charte que l'on souhaite signer ou faire signer.
 * @param string $language language de la charte, par défaut anglais.
 * @param false $hosting type de charte, par défaut MiNET
 * @param string $adh login de l'adhérent si on est admin, sinon rien.
 * @throws \setasign\Fpdi\PdfParser\CrossReference\CrossReferenceException
 * @throws \setasign\Fpdi\PdfParser\Filter\FilterException
 * @throws \setasign\Fpdi\PdfParser\PdfParserException
 * @throws \setasign\Fpdi\PdfParser\Type\PdfTypeException
 * @throws \setasign\Fpdi\PdfReader\PdfReaderException
 */
function generate_charte($language = 'en', $hosting = false, $adh = "") {
    global $mysqli;
    $r = get_adh($adh ? $adh : get_id()); // si on a déjà le login on l'utilise (admin) sinon on le récupère (user)
    if($r) {
        define('FPDF_FONTPATH', 'vendor/setasign/fpdf/font/');
        require_once('vendor/setasign/fpdf/fpdf.php');
        require_once('vendor/setasign/fpdi/src/autoload.php');

        $pdf = new FPDI('P', 'mm', array(210, 297));

// Les modèles de charte sont dans ./backend/chartes_modele. Si vous les modifiez il faudra modifier les coordonnées de signature !
        if ($language == "fr")
            $pdf->setSourceFile("./chartes_modele/". ($hosting ? "chartehosting_fr2021.pdf" : "charte_fr2021.pdf")."");
        else
            $pdf->setSourceFile("./chartes_modele/". ($hosting ? "chartehosting_en2021.pdf" : "charte_en2021.pdf")."");

        $pageId = $pdf->importPage(1);

        $pdf->addPage();
        $pdf->useImportedPage($pageId);
        $pdf->AddFont('AuthenticSignature', '', 'AuthenticSignature.php', true);
        $pdf->SetFont('Arial');

        // ici sont les coordonnées de signature à modifier, qui dépendent du language utilisé pour la charte
        if ($language == "fr")
            $pdf->SetXY(115, 242.3);
        else
            $pdf->SetXY(115, 233.4);
        $pdf->SetFontSize(7);
        if(!$hosting)
            $pdf->Write(0, $r['datesignedminet']);
        else
            $pdf->Write(0, $r['datesignedhosting']);
        $pdf->SetFont('AuthenticSignature');
        if ($language == "fr")
            $pdf->SetXY(115, 253);
        else
            $pdf->SetXY(115, 245);
        $pdf->SetFontSize(25);
        $pdf->Write(0, utf8_decode($r['prenom'])." ".utf8_decode($r['nom']));
        $pdf->Output('./chartes/charte_'.($hosting ? 'hosting_' : ''). $r['login'].'.pdf', 'F');
    }
}

/**
 * Permet d'envoyer le mail signalant la signature de la charte.
 * @param $language language de la charte, par défaut en anglais.
 * @param string $adh login de l'adhérent si on est admin, sinon rien.
 * @param false $regenerate définit si on souhaite régénérer une charte déjà signée. Ne sert pas à grand chose pour le moment.
 */
function send_mail($language, $adh = "", $regenerate = false) {
    $r = get_adh($adh ? $adh : get_id());
    if($r['mail']) {
        // utilisation du plugin PHP PHPMailer qui marche pas mal.
        $mail = new PHPMailer(true);
        try {
            //Configuration du serveur mail à utiliser
            $mail -> CharSet = "UTF-8";
            $mail->isSMTP();
            $mail->Host       = 'smtp.minet.net';
            $mail->SMTPAuth   = false;
            $mail->Port       = 25;

            //Informations d'envoi
            $mail->setFrom('chartes@minet.net', 'chartes@minet.net');
            $mail->addAddress($r['mail'], $r['prenom'] ." ". $r['nom']);     //Add a recipient
            if(!$regenerate) // inutile de renvoyer un mail à la ML en cas de régénération
                $mail->addCC('chartes@listes.minet.net'); // on met la ML chartes en copie pour archive, il y a le président dedans.

            // Contenu HTML du mail. Version anglaise et française.
            $mail->isHTML(true);                                  //Set email format to HTML
            if($language == 'en') {
                $mail->Subject = 'Signature of the charter ('. $r['prenom'] .' ' . $r['nom'] .')';
                $mail->Body = '<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body>
            <div>
                <div style="text-align: center"><img style="height: 70px; width: 125px" src="https://tickets.minet.net/logo.php"></div>
                <div  style="text-align: center">
                    <h4><i>Rules Signature ('. $r['prenom'] .' ' . $r['nom'] .')</i></h4>
                </div>
                <div style="border: 2px solid cornflowerblue; border-top-left-radius: 14px;border-top-right-radius: 14px ">
                    <div style="text-align: left; margin: 5px">
                        <p>Hello,</p>
                        <p>You signed the rules !</p>
                        <p>You can find your signed charter as an attachment.</p>
                    </div>
                </div>
                <div style="border:2px solid lightgrey; margin-top: 5px ">
                    <small><a href="https://minet.net">Our website</a></small>

                </div>
            </div>
            </body>
            </html>';
                $mail->AltBody = 'Hello, you have just signed the rules ! You can find your signed charter as an attachment.';
            } else {
                $mail->Subject = 'Signature de la charte ('. $r['prenom'] .' ' . $r['nom'] .')';
                $mail->Body = '<!DOCTYPE html>
            <html>
            <head>
                <meta charset="UTF-8">
            </head>
            <body>
            <div>
                <div style="text-align: center"><img style="height: 70px; width: 125px" src="https://tickets.minet.net/logo.php"></div>
                <div  style="text-align: center">
                    <h4><i>Signature de la charte ('. $r['prenom'] .' ' . $r['nom'] .')</i></h4>
                </div>
                <div style="border: 2px solid cornflowerblue; border-top-left-radius: 14px;border-top-right-radius: 14px ">
                    <div style="text-align: left; margin: 5px">
                        <p>Bonjour,</p>
                        <p>Vous avez sign&eacute; la charte !</p>
                        <p>Vous pouvez retrouver votre charte sign&eacute;e en pi&egrave;ce jointe.</p>
                    </div>
                </div>
                <div style="border:2px solid lightgrey; margin-top: 5px ">
                    <small><a href="https://minet.net">Notre site web</a></small>

                </div>
            </div>
            </body>
            </html>';
                $mail->AltBody = 'Bonjour, vous avez bien sign&eacute; la charte de fonctionnement de <br> Vous
pourrez retrouver celle-ci en pièce jointe.';
            }
            $mail->addAttachment("chartes/charte_". $r['login'] .".pdf");
            $mail->send();
        } catch (Exception $e) {
            $useless = "Message could not be sent. Mailer Error: {$mail->ErrorInfo}";
        }
    }
}
