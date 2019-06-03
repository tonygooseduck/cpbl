if (document.cookie) {
    let xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            let data = JSON.parse(this.responseText);
            if (data.name) {
                document.querySelector("#login").innerHTML = `<p class="nav-link active">${data.name}</p>`;
            }
        }
    };
    xhttp.open("GET", "/user/profile");
    xhttp.send();
}