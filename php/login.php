<?php

require_once "../config/database.php";

$email = $_POST['email'];
$password = $_POST['password'];

$stmt = $conn->prepare("SELECT * FROM users WHERE email = ?");
$stmt->bind_param("s", $email);
$stmt->execute();

$result = $stmt->get_result();

/*$sql =
"SELECT * FROM users
WHERE email='$email'";

$result = mysqli_query($conn,$sql);*/

if(mysqli_num_rows($result) > 0){

    $user = mysqli_fetch_assoc($result);

    if(
        password_verify(
            $password,
            $user['password']
        )
    ){

        echo "success";

    }else{

        echo "wrong_password";
    }

}else{

    echo "user_not_found";
}