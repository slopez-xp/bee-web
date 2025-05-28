<?php
$servername = "localhost";
$username = "profe";
$password = "profe";
$dbname = "proyect_bee";

// Conexión a la base de datos
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexión
if ($conn->connect_error) {
  die("Error de conexión: " . $conn->connect_error);
}

// Consulta SQL
$sql = "SELECT 
          COUNT(CASE WHEN healthy = 1 THEN 1 END) AS healthy_count,
          COUNT(CASE WHEN healthy = 0 THEN 1 END) AS unhealthy_count
        FROM hcc_inspection";
$result = $conn->query($sql);

if ($result->num_rows > 0) {
  $row = $result->fetch_assoc();
  $healthyCount = $row["healthy_count"];
  $unhealthyCount = $row["unhealthy_count"];
} else {
  $healthyCount = 0;
  $unhealthyCount = 0;
}

$conn->close();

// Enviar datos como JSON
header('Content-Type: application/json');
echo json_encode([
  'healthy' => $healthyCount,
  'unhealthy' => $unhealthyCount
]);
?>