<?php
    session_start(); // Añade esto al inicio
    include("connection.php");
    
    if (isset($_POST['submit'])) {
        $username = $_POST['username'];
        $password = $_POST['password'];

        $sql = "SELECT * FROM auth WHERE username = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param("s", $username);
        $stmt->execute();
        $result = $stmt->get_result();
        $row = $result->fetch_assoc();
        
        if ($row && password_verify($password, $row['password'])) {
            $_SESSION['user_id'] = $row['id'];
            $_SESSION['username'] = $row['username'];
            $_SESSION['role'] = $row['role'];
            
            header("Location: http://localhost/bee_web/src/visualizer/welcome.php");
            exit();
        } else {
            echo '<script>
                    window.location.href = "index.php";
                    alert("Login failed. Invalid username or password!")
                </script>';
        }
    }
?>