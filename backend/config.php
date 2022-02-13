<?php
$_CONFIG['api'] = apache_getenv('api');
$_CONFIG['dbip'] = apache_getenv('dbip'); // lien vers fdpsql
$_CONFIG['dbuser'] = apache_getenv('dbuser');
$_CONFIG['dbpassword'] = apache_getenv('dbpassword');
$_CONFIG['dbname'] = apache_getenv('dbname');
$_CONFIG['dnadmin'] = apache_getenv('dnadmin');
$_CONFIG['allowed_frontend'] = apache_getenv('allowed_frontend');
?>
