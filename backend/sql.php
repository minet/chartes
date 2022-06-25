<?php
include('config.php');

// permet de définir la config SQL pour établir la connexion à la DB.
$mysqli = new mysqli($_CONFIG['dbip'], $_CONFIG['dbuser'], $_CONFIG['dbpassword'], $_CONFIG['dbname']);
