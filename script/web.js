
function submitRegistration() {
    const data = {
        customerId: document.getElementById("customerId").value,
        firstName: document.getElementById("firstName").value,
        lastName: document.getElementById("lastName").value,
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
        dogName: document.getElementById("dogName").value,
        dogBreed: document.getElementById("dogBreed").value,
        dogAge: document.getElementById("dogAge").value,
        dogSize: document.getElementById("dogSize").value
    };

    fetch("http://localhost:3000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(response => {
        alert("Registration successful!");
        console.log(response);
    })
    .catch(err => {
        alert("Error submitting form.");
        console.error(err);
    });
}
