// SHOW OR HIDE PASSWORD
function togglePassword(id){

    const input = document.getElementById(id);

    if(input.type === "password"){
        input.type = "text";
    }else{
        input.type = "password";
    }

}

// LOGIN FORM
document
.getElementById("loginForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value;

    if(email === "" || password === ""){

        alert("Please fill all fields.");

        return;
    }

    console.log("Login Successful");

    console.log({
        email,
        password
    });

    alert("Login Successful!");
    window.location.href = "pages/index.html"

    // FUTURE DATABASE CONNECTION

    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);
    
   fetch("../php/login.php",{
    method:"POST",
    body:formData
    })
    .then(res => res.text())
    .then(data => {

    if(data === "success"){
        window.location.href = "pages/index.html";
    }
    else if(data === "wrong_password"){
        alert("Wrong Password");
    }
    else{
        alert("User Not Found");
    }

    });
    

    this.reset();

});


