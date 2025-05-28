<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");

$servername = "localhost";
$username = "profe";
$password = "profe";
$dbname = "proyect_bee";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die(json_encode(["error" => "Connection failed: " . $conn->connect_error]));
}

// Consulta para las últimas 24 horas (ajusta según necesites)
$sql = "SELECT 
    hw.obs_id,
    hw.temperature, 
    hw.humidity, 
    hw.pressure,
    DATE_FORMAT(wo.obs_time, '%H:%i') AS time
    FROM hourly_weather hw
    JOIN weather_observation wo ON hw.obs_id = wo.obs_id
    ORDER BY hw.obs_id LIMIT 200;
    ";

$result = $conn->query($sql);

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'time' => $row['time'],
        'temperature' => (float)$row['temperature'],
        'humidity' => (int)$row['humidity'],
        'pressure' => (float)$row['pressure']
    ];
}

echo json_encode(array_reverse($data)); // Orden cronológico
$conn->close();
?>