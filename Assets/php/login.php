<?php
session_start();
require_once 'db.php'; 

if (isset($_POST['login_btn'])) {
    $username = mysqli_real_escape_string($conn, $_POST['username']);
    $password = $_POST['password'];

    $query = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows === 1) {
        $user = $result->fetch_assoc();
        
        if (password_verify($password, $user['password'])) {
            $_SESSION['user_id'] = $user['id'];
            $_SESSION['username'] = $user['username'];
            
            // Redirect to the main page inside the pages folder
            header("Location: ../pages/index.html");
            exit();
        } else {
            echo "Incorrect password.";
        }
    } else {
        echo "No account found with that email address.";
    }
    $stmt->close();
}
?>