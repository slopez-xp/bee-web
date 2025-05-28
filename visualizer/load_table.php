<?php
$conn = mysqli_connect("localhost", "profe", "profe", "proyect_bee");
if (!$conn) die("Connection failed: " . mysqli_connect_error());

$allowed_tables = [
    'apiary_information', 
    'hcc_inspection', 
    'hive_information', 
    'hourly_weather',
    'weather_observation', 
    'weather_station'
];

$table = $_GET['table'] ?? '';
$table = strtolower($table);

if (!in_array($table, $allowed_tables)) {
    echo "<p>Error: Table not permitted.</p>";
    exit;
}

$result = mysqli_query($conn, "SELECT * FROM `$table` LIMIT 100");
if (!$result) {
    echo "<p>Query error: " . mysqli_error($conn) . "</p>";
    exit;
}

echo "<h2>" . htmlspecialchars(str_replace('_', ' ', ucfirst($table))) . "</h2>";
echo "<div class='table-container'>";
echo "<table class='styled-table'><thead><tr>";

$fields = mysqli_fetch_fields($result);
foreach ($fields as $field) {
    echo "<th>" . htmlspecialchars($field->name) . "</th>";
}
echo "</tr></thead><tbody>";

while ($row = mysqli_fetch_assoc($result)) {
    echo "<tr>";
    foreach ($row as $value) {
        echo "<td>" . htmlspecialchars($value) . "</td>";
    }
    echo "</tr>";
}
echo "</tbody></table>";
echo "</div>";
mysqli_close($conn);
?>