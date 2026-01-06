const form = document.getElementById("signupForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");
const confirmPasswordInput = document.getElementById("confirmPassword");

const nameError = document.getElementById("nameError");
const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");
const confirmPasswordError = document.getElementById("confirmPasswordError");

const signupButton = document.querySelector("button[type='submit']");
signupButton.disabled = true; // start disabled

function validateSignupInputs() {
  let nameValid = false;
  let emailValid = false;
  let passwordValid = false;
  let confirmPasswordValid = false;

  const name = nameInput.value.trim();
  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();
  const confirmPassword = confirmPasswordInput.value.trim();

  if(name.length < 2){
    nameError.textContent = "Please enter your full name.";
  }else{
    nameError.textContent = "";
    nameValid = true;
  }

  if(email === ""){
    emailError.textContent = "Email is required.";
  }else if (!email.includes("@")){
    emailError.textContent = "Enter a valid email.";
  }else{
    emailError.textContent = "";
    emailValid = true;
  }

  if(password.length < 8){
    passwordError.textContent = "Password must be at least 8 characters.";
  }else{
    passwordError.textContent = "";
    passwordValid = true;
  }

  if(confirmPassword !== password || confirmPassword === ""){
    confirmPasswordError.textContent = "Passwords do not match.";
  }else{
    confirmPasswordError.textContent = "";
    confirmPasswordValid = true;
  }
  signupButton.disabled = !(nameValid && emailValid && passwordValid && confirmPasswordValid);
}
nameInput.addEventListener("input", validateSignupInputs);
emailInput.addEventListener("input", validateSignupInputs);
passwordInput.addEventListener("input", validateSignupInputs);
confirmPasswordInput.addEventListener("input", validateSignupInputs);

form.addEventListener("submit", async (e) => {   
  e.preventDefault();
  let isValid = true;

  if (nameInput.value.trim().length < 2) {
    nameError.textContent = "Please enter your full name.";
    nameInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else {
    nameError.textContent = "";
    nameInput.setAttribute("aria-invalid", "false");
  }
  if (emailInput.value.trim() === "") {
    emailError.textContent = "Email is required.";
    emailInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (!emailInput.value.includes("@")) {
    emailError.textContent = "Enter a valid email.";
    emailInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else {
    emailError.textContent = "";
    emailInput.setAttribute("aria-invalid", "false");
  }

  if (passwordInput.value.trim().length < 8) {
    passwordError.textContent = "Password must be at least 8 characters.";
    passwordInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else {
    passwordError.textContent = "";
    passwordInput.setAttribute("aria-invalid", "false");
  }

  if (confirmPasswordInput.value !== passwordInput.value) {
    confirmPasswordError.textContent = "Passwords do not match.";
    confirmPasswordInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else {
    confirmPasswordError.textContent = "";
    confirmPasswordInput.setAttribute("aria-invalid", "false");
  }

  if (!isValid) return;

  try {
    const response = await fetch("http://localhost:8080/api/users/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        password: passwordInput.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Signup failed");
      return;
    }

    localStorage.setItem("userEmail", emailInput.value.trim()); 
    localStorage.setItem("userName", nameInput.value.trim());   
    window.location.href = "home.html";                     

  } catch (error) {
    console.error("Signup error:", error);
    alert("Server error. Please try again later.");
  }

});
