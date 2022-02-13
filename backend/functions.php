<?php
use setasign\Fpdi\Fpdi;
//Import PHPMailer classes into the global namespace
//These must be at the top of your script, not inside a function
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\SMTP;
use PHPMailer\PHPMailer\Exception;
//Load Composer's autoloader
require 'vendor/autoload.php';
function get_id() {
  global $casresponse;
  $todisp = json_decode($casresponse);
  return $todisp->sub;
}

function is_admin() {
  global $casresponse;
  global $_CONFIG;
  $attributesRoles = (json_decode($casresponse)->attributes)->memberOf;
  if($attributesRoles) {
    if (strpos(json_encode($attributesRoles), $_CONFIG['dnadmin']))
      return True;
    else
      return False;
  }
}

function get_adh($adh) {
  if($adh == "")
    $adh = get_id();
  global $mysqli;
  $result = $mysqli->query("select id,login,mail,nom,prenom,signedminet,signedhosting,datesignedminet,datesignedhosting from adherents where login = '". mysqli_escape_string($mysqli, $adh) ."' limit 1");
  return $result->fetch_assoc();
}

function generate_charte($language = 'en', $hosting = false, $adh = "") {
  global $mysqli;
  $r = get_adh($adh ? $adh : get_id());
  if($r) {
    // include composer packages
    define('FPDF_FONTPATH', 'vendor/setasign/fpdf/font/');
    require_once('vendor/setasign/fpdf/fpdf.php');
    require_once('vendor/setasign/fpdi/src/autoload.php');
// Create new Landscape PDF
    $pdf = new FPDI('P', 'mm', array(210, 297));

// Reference the PDF you want to use (use relative path)
    if ($language == "fr")
      $pdf->setSourceFile("./chartes_modele/". ($hosting ? "chartehosting_fr2021.pdf" : "charte_fr2021.pdf")."");
    else
      $pdf->setSourceFile("./chartes_modele/". ($hosting ? "chartehosting_en2021.pdf" : "charte_en2021.pdf")."");

    $pageId = $pdf->importPage(1);

    $pdf->addPage();
    $pdf->useImportedPage($pageId);
    $pdf->AddFont('AuthenticSignature', '', 'AuthenticSignature.php', true);
    $pdf->SetFont('Arial');
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

function send_mail($language, $adh = "", $regenerate = false) {
  $r = get_adh($adh ? $adh : get_id());
  if($r['mail']) {
//Create an instance; passing `true` enables exceptions
    $mail = new PHPMailer(true);
    try {
      //Server setting
      $mail -> CharSet = "UTF-8";
      $mail->isSMTP();                                            //Send using SMTP
      $mail->Host       = 'smtp.minet.net';                     //Set the SMTP server to send through
      $mail->SMTPAuth   = false;                                   //Enable SMTP authentication       //SMTP password       //Enable implicit TLS encryption
      $mail->Port       = 25;                                    //TCP port to connect to; use 587 if you have set `SMTPSecure = PHPMailer::ENCRYPTION_STARTTLS`

      //Recipients
      $mail->setFrom('chartes@minet.net', 'chartes@minet.net');
      $mail->addAddress($r['mail'], $r['prenom'] ." ". $r['nom']);     //Add a recipient
      if(!$regenerate)
        $mail->addCC('chartes@listes.minet.net');
      //Content
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
