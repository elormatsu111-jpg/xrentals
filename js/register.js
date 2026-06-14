// SHOW OR HIDE PASSWORD
function togglePassword(id){

    const input = document.getElementById(id);

    if(input.type === "password"){
        input.type = "text";
    }else{
        input.type = "password";
    }

}

// REGISTER FORM
document
.getElementById("registerForm")
.addEventListener("submit", function(e){

    e.preventDefault();

    const firstName =
    document.getElementById("firstName").value.trim();

    const lastName =
    document.getElementById("lastName").value.trim();

    const phone =
    document.getElementById("phone").value.trim();

    const email =
    document.getElementById("email").value.trim();

    const password =
    document.getElementById("password").value;

    const confirmPassword =
    document.getElementById("confirmPassword").value;

    const errorMessage =
    document.getElementById("errorMessage");

    // CLEAR PREVIOUS ERROR
    errorMessage.textContent = "";

    // PASSWORD CHECK
    if(password !== confirmPassword){

        errorMessage.textContent =
        "Passwords do not match.";

        return;
    }

    // PASSWORD LENGTH CHECK
    if(password.length < 6){

        errorMessage.textContent =
        "Password must be at least 6 characters.";

        return;
    }

    console.log("Registration Successful");

    console.log({
        firstName,
        lastName,
        phone,
        email,
        password
    });

    window.location.href = "pages/login.html"

    // FUTURE DATABASE CONNECTION
    const formData = new FormData();

    formData.append("firstName", firstName);
    formData.append("lastName", lastName);
    formData.append("phone", phone);
    formData.append("email", email);

    const accountType =
    document.querySelector(
    'input[name="accountType"]:checked'
    ).value;

    formData.append("accountType", accountType);
    formData.append("password", password);


    
    fetch("../php/register.php",{
        method:"POST",
        body:formData
    })
    .then(res => res.text())
    .then(data => {

    if(data === "success"){
        alert("Registration Successful");
        window.location.href = "pages/login.html";
    }else{
        alert("Registration Failed");
    }

    }); 

});