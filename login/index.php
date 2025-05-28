<?php
    include("connection.php")
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login</title>
    <link rel="stylesheet" type="text/css" href="style.css">

    <!-- Font Awesome Cdn link -->
    <link 
        rel="stylesheet" 
        href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css">
        
</head>
<body>
    <div class="form-container">
        <h1 style="text-align: center;  margin-bottom: 1.5rem;">Welcome back</h1>
        <form name="form" action="login.php" method="POST">
            
            <div class="input-group">
                <input type="text" id="username" name = "username" required placeholder=" ">
                <label for="username">Username</label>
            </div>
            
            <div class="input-group">
                <input type="password" id="password" name = "password" required placeholder=" ">
                <label for="password">Password</label>
                <span class="toggle-password" onclick="togglePassword()">
                    👁️
                </span>
            </div>

            <button type="submit" class="btn" name="submit">Sign in</button>
        
        </form>
    </div>
    <script src="app.js"></script>
</body>
</html>