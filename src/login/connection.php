<?php
    $servername = "localhost";
    $username = "root";
    $password = "";
    $db_name = "user";
    $conn = new mysqli($servername, $username, $password, $db_name);

    function getDBConnection($role) {
        if ($role === 'admin') {
            return new mysqli("localhost", "root", "", "proyect_bee");
        } else {
            return new mysqli("localhost", "profe", "profe", "proyect_bee");
        }
    }

    if($conn -> connect_error){
        die("Connection failed".$conn->connect_error);
    }
?>