const form = document.getElementById("loginForm");
const emailInput = document.getElementById("email");
const passwordInput = document.getElementById("password");

const emailError = document.getElementById("emailError");
const passwordError = document.getElementById("passwordError");

const loginButton = document.querySelector("button[type='submit']");
loginButton.disabled = true; // start disabled

function validateInputs() {
  let emailValid = false;
  let passwordValid = false;

  const email = emailInput.value.trim();
  const password = passwordInput.value.trim();

  if (email === ""){
    emailError.textContent = "Email is required.";
  }else if(!email.includes("@")){
    emailError.textContent = "Enter a valid email.";
  }else{
    emailError.textContent = "";
    emailValid = true;
  }

  if(password === ""){
    passwordError.textContent = "Password is required.";
  }else if (password.length < 8){
    passwordError.textContent = "Password must be at least 8 characters.";
  }else{
    passwordError.textContent = "";
    passwordValid = true;
  }

  loginButton.disabled = !(emailValid && passwordValid);
}

emailInput.addEventListener("input", validateInputs);
passwordInput.addEventListener("input", validateInputs);

form.addEventListener("submit", async (e) => { 
  e.preventDefault();

  let isValid = true;

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

  if (passwordInput.value.trim() === "") {
    passwordError.textContent = "Password is required.";
    passwordInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else if (passwordInput.value.length < 8) {
    passwordError.textContent = "Password must be at least 8 characters.";
    passwordInput.setAttribute("aria-invalid", "true");
    isValid = false;
  } else {
    passwordError.textContent = "";
    passwordInput.setAttribute("aria-invalid", "false");
  }

  if (!isValid) return;

  try {
    const response = await fetch("http://localhost:8080/api/users/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: emailInput.value.trim(),
        password: passwordInput.value
      })
    });

    const data = await response.json();

    if (!response.ok) {
      alert(data.message || "Login failed");
      return;
    }

    localStorage.setItem("userEmail", data.user.email); 
    localStorage.setItem("userName", data.user.name);  
    window.location.href = "home.html";                

  } catch (error) {
    console.error("Login error:", error);
    alert("Server error. Please try again later.");
  }
});
