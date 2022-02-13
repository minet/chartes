<?php
include('config.php');
$mysqli = new mysqli($_CONFIG['dbip'], $_CONFIG['dbuser'], $_CONFIG['dbpassword'], $_CONFIG['dbname']);
