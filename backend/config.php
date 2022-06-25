<?php
// IP de la database
$_CONFIG['dbip'] = apache_getenv('dbip');

// User à utiliser
$_CONFIG['dbuser'] = apache_getenv('dbuser');

// Password du user à utiliser
$_CONFIG['dbpassword'] = apache_getenv('dbpassword');

// Name de la DB à utiliser
$_CONFIG['dbname'] = apache_getenv('dbname');

// Groupe nécessaire pour être considéré comme admin par chartes
$_CONFIG['dnadmin'] = apache_getenv('dnadmin');

// IP du frontend autorisé à accéder à l'application
$_CONFIG['allowed_frontend'] = apache_getenv('allowed_frontend');
?>
