<?php

require_once "../config/database.php";

$firstName = $_POST['firstName'];
$lastName = $_POST['lastName'];
$phone = $_POST['phone'];
$email = $_POST['email'];
$accountType = $_POST['accountType'];

$password = $_POST['password'];
$passwordHash = password_hash($password, PASSWORD_DEFAULT);

/*$passwordHash = password_hash(
    $password,
    PASSWORD_DEFAULT
);*/

$sql = "INSERT INTO users(
    first_name,
    last_name,
    phone,
    email,
    account_type,
    password
)
VALUES(
    '$firstName',
    '$lastName',
    '$phone',
    '$email',
    '$accountType',
    '$passwordHash'
)";

if(mysqli_query($conn,$sql)){
    echo "success";
}else{
    echo "error";
}