<?php
session_start();
require_once 'db.php'; // Connects to your database connection file

if (isset($_POST['register_btn'])) {
    // Sanitize and collect the inputs from your form name attributes
    $firstName = mysqli_real_escape_string($conn, $_POST['firstName']);
    $lastName = mysqli_real_escape_string($conn, $_POST['lastName']);
    $username = mysqli_real_escape_string($conn, $_POST['username']); // Email input
    $password = $_POST['password'];

    // Check if the email address is already taken
    $check_query = "SELECT * FROM users WHERE username = ?";
    $stmt = $conn->prepare($check_query);
    $stmt->bind_param("s", $username);
    $stmt->execute();
    $result = $stmt->get_result();

    if ($result->num_rows > 0) {
        echo "An account with this email address already exists.";
        $stmt->close();
    } else {
        $stmt->close();

        // Securely hash the password before saving it to the database
        $hashed_password = password_hash($password, PASSWORD_DEFAULT);

        // Insert the new user into your Workbench database
        // NOTE: Adjust column names if your table layout is slightly different
        $insert_query = "INSERT INTO users (username, password) VALUES (?, ?)";
        $insert_stmt = $conn->prepare($insert_query);
        $insert_stmt->bind_param("ss", $username, $hashed_password);

        if ($insert_stmt->execute()) {
            echo "Registration successful! Proceed to <a href='../pages/login.html'>Login</a>.";
        } else {
            echo "Something went wrong. Please try again.";
        }
        $insert_stmt->close();
    }
}
?>