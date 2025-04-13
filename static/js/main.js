document.addEventListener("DOMContentLoaded", () => {
    const formulario = document.getElementById("formulario");
    const claveDiv = document.getElementById("claveDiv");
    const spinner = document.getElementById("spinner");
    const tipoInput = document.getElementById("tipo");
    const alerta = document.getElementById("resultado");
    const claveInput = document.getElementById("clave");
    const toggleClave = document.getElementById("toggleClave");

    document.querySelectorAll("nav button").forEach(btn => {
        btn.addEventListener("click", () => cambiarFormulario(btn.dataset.tipo));
    });

    formulario.addEventListener("submit", (e) => {
        e.preventDefault();
        if (validarCampos()) {
            enviarFormulario();
        }
    });

    document.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            if (validarCampos()) {
                enviarFormulario();
            }
        }
    });

    toggleClave.addEventListener("click", () => {
        if (claveInput.type === "password") {
            claveInput.type = "text";
            toggleClave.innerHTML = "🙈";
        } else {
            claveInput.type = "password";
            toggleClave.innerHTML = "👁️";
        }
    });

    function cambiarFormulario(tipo) {
        claveDiv.style.display = tipo === "resetear" ? "flex" : "none";
        tipoInput.value = tipo;
        alerta.style.display = "none";
    }

    function validarCampos() {
        const usuario = document.getElementById("usuario").value.trim();
        if (!usuario) {
            mostrarAlerta("Debe ingresar su usuario.", "error");
            return false;
        }
        if (tipoInput.value === "resetear" && !claveInput.value.trim()) {
            mostrarAlerta("Debe ingresar la nueva contraseña.", "error");
            return false;
        }
        return true;
    }

    function enviarFormulario() {
        spinner.style.display = "block";
        alerta.style.display = "none";

        const datos = new FormData(formulario);
        fetch("/procesar", {
            method: "POST",
            body: datos
        })
        .then(res => res.json())
        .then(data => {
            spinner.style.display = "none";
            mostrarAlerta(data.message, data.status);
            formulario.reset();
            claveDiv.style.display = "none";
        });
    }

    function mostrarAlerta(mensaje, tipo) {
        alerta.className = tipo;
        alerta.innerText = mensaje;
        alerta.style.display = "block";
    }
});