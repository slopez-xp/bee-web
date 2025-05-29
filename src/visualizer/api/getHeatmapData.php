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

$sql = "SELECT 
          HOUR(hw.sunrise) AS sunrise_hour,
          HOUR(TIMEDIFF(hw.sunset, hw.sunrise)) AS daylight_hours,
          AVG(hw.temperature) AS avg_temp
        FROM hourly_weather hw
        JOIN weather_observation wo ON hw.obs_id = wo.obs_id
        GROUP BY DATE(wo.date), HOUR(hw.sunrise)";


$result = $conn->query($sql);

if (!$result) {
    die(json_encode(["error" => "SQL error: " . $conn->error]));
}

$data = [];
while ($row = $result->fetch_assoc()) {
    $data[] = [
        'y' => $row['sunrise_hour'] . ':00', // Eje vertical
        'x' => $row['daylight_hours'] . 'h', // Eje horizontal
        'v' => $row['avg_temp'] // Valor (temperatura)
    ];
}

echo json_encode($data);
?>