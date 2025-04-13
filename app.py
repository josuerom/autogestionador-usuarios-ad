from flask import Flask, render_template, request, redirect, url_for, flash, jsonify
import subprocess
import re

app = Flask(__name__)

def ejecutar_comandos(usuario, clave=None):
    try:
        # Desbloquear usuario
        comando1 = f'Unlock-ADAccount -Identity {usuario}'
        subprocess.run(["powershell", "-Command", comando1], check=True)

        # Si hay clave la restablece
        if clave:
            comando2 = f'Set-ADAccountPassword -Identity {usuario} -Reset -NewPassword (ConvertTo-SecureString "{clave}" -AsPlainText -Force)'
            subprocess.run(["powershell", "-Command", comando2], check=True)

        # Sincronizar cambios con MS Azure
        comando3 = 'Start-ADSyncSyncCycle -PolicyType Delta'
        subprocess.run(["powershell", "-Command", comando3], check=True)

        return True, "Operación realizada con éxito!"
    except subprocess.CalledProcessError as e:
        return False, f"Error: {e}"


@app.route("/", methods=["GET", "POST"])
def index():
    return render_template("index.html")


@app.route("/procesar", methods=["POST"])
def procesar():
    tipo = request.form.get("tipo")
    usuario = request.form.get("usuario", "").strip()
    clave = request.form.get("clave", "").strip()

    if not usuario:
        return jsonify({"status": "error", "message": "Debe ingresar su usuario (sin el @prodesa.com)."})

    if tipo == "resetear":
        # Validación de contraseña
        if len(clave) < 6 or len(re.findall(r'[!@#$%^&*()_+=\[{\]};:<>|./?,-]', clave)) < 2 or len(re.findall(r'\d', clave)) < 2:
            return jsonify({"status": "error", "message": "La clave no cumple con los requisitos."})
        resultado, mensaje = ejecutar_comandos(usuario, clave)
    else:
        resultado, mensaje = ejecutar_comandos(usuario)

    status = "success" if resultado else "error"
    return jsonify({"status": status, "message": mensaje})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=2025, debug=True)
