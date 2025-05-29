<?php
session_start();

// 1. Verificar que el usuario esté logueado
if (!isset($_SESSION['user_id'])) {
    die("Error: Debes iniciar sesión primero. <a href='../login/index.php'>Login</a>");
}

// 2. Configuración de conexión según el rol
require_once("../login/connection.php");

// 3. Mostrar información del usuario actual
echo "<div style='padding: 10px; background: #f0f0f0; margin-bottom: 20px; border-radius: 15px;'>";
echo "User: <strong>" . htmlspecialchars($_SESSION['username']) . "</strong> | ";
echo "Role: <strong>" . ($_SESSION['role'] === 'admin' ? 'Administrator' : 'Professor') . "</strong>";
//echo " <small>(<a href='logout.php'>Cerrar sesión</a>)</small>";
echo "</div>";

// 4. Conexión a la base de datos según privilegios
if ($_SESSION['role'] === 'admin') {
    // Conexión con privilegios de root
    $conn = new mysqli("localhost", "root", "", "proyect_bee");
} else {
    // Conexión con privilegios limitados (profe)
    $conn = new mysqli("localhost", "profe", "profe", "proyect_bee");
}

if ($conn->connect_error) {
    die("Error de conexión: " . $conn->connect_error);
}

// 5. Procesar la búsqueda
$search = trim($_POST['search_query'] ?? '');

if (!empty($search)) {
    // Lista de tablas permitidas (diferente por rol)
    $allowed_tables = [
        'apiary_information', 
        'hcc_inspection', 
        'hive_information', 
        'hourly_weather',
        'weather_observation', 
        'weather_station'
    ];
    
    // Tablas adicionales para admin
    if ($_SESSION['role'] === 'admin') {
        $allowed_tables = array_merge($allowed_tables, [
            'users',
            'system_logs',
            'sensitive_data'
        ]);
    }
    
    // Verificación de seguridad (mejorada)
    $table_references = [];
    preg_match_all('/\b(?:from|join)\s+([`]?[\w]+[`]?)/i', $search, $matches);
    
    if (!empty($matches[1])) {
        foreach ($matches[1] as $table) {
            $table = strtolower(str_replace('`', '', $table));
            if (!in_array($table, $allowed_tables)) {
                die("Error: No tienes permiso para acceder a la tabla '$table'");
            }
        }
    }
    
    // Ejecutar consulta
    $result = $conn->query($search);
    
    if ($result === false) {
        die("Error en la consulta: " . $conn->error);
    }
    
    // Mostrar resultados
    if ($result->num_rows > 0) {
        echo "<table class='styled-table'><thead><tr>";
        
        // Encabezados
        $fields = $result->fetch_fields();
        foreach ($fields as $field) {
            echo "<th>".htmlspecialchars($field->name)."</th>";
        }
        echo "</tr></thead><tbody>";
        
        // Datos
        while ($row = $result->fetch_assoc()) {
            echo "<tr>";
            foreach ($row as $value) {
                echo "<td>".htmlspecialchars($value)."</td>";
            }
            echo "</tr>";
        }
        echo "</tbody></table>";
    } else {
        echo "<p>No se encontraron resultados</p>";
    }
    
    $result->free();
} else {
    echo "<p>Por favor ingrese una consulta SQL válida</p>";
}

$conn->close();
?>