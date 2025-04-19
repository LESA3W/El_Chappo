from flask import Flask, request, send_from_directory
import serial
import os
import time
import logging
import sys
from datetime import datetime

# Suppression des messages par défaut de Flask
cli = sys.modules['flask.cli']
cli.show_server_banner = lambda *x: None
log = logging.getLogger('werkzeug')
log.setLevel(logging.ERROR)

# ⚙️ Paramètres série
SERIAL_PORT = 'COMX'
BAUDRATE = 9600

try:
    ser = serial.Serial(SERIAL_PORT, BAUDRATE, timeout=2)
    print(f"✅ Serial port open on {SERIAL_PORT}")
    time.sleep(2)
except Exception as e:
    ser = None
    print(f"❌ ERROR Serial port opening connection : {e}")

app = Flask(__name__)

# 🌐 Log de connexion
def log_connexion_infos():
    now = datetime.now().strftime("%H:%M:%S")
    ip = request.remote_addr or "?"
    ua = request.headers.get('User-Agent', '')
    os_info = "Unknown"

    if "Windows" in ua:
        os_info = "Windows"
    elif "Mac" in ua:
        os_info = "macOS"
    elif "Linux" in ua:
        os_info = "Linux"
    elif "Android" in ua:
        os_info = "Android"
    elif "iPhone" in ua:
        os_info = "iOS"

    print("-" * 50)
    print("########## 🛜   [CONNECTION ON SITE] 🛜   ##########")
    print()
    print(f"🕐 --> {now}")
    print(f"🖥️  --> {os_info}")
    print(f"📍 --> {ip}")
    print(f"🌍 --> ")  #{location}
    print("-" * 50)




#################################      [LOGS PART]      ######################################


@app.route('/')
def index():
    log_connexion_infos()
    return send_from_directory('../site', 'index.html')

@app.route('/<path:filename>')
def assets(filename):
    return send_from_directory('../site', filename)

@app.route('/envoyer', methods=['POST'])
def envoyer():
    commande = request.data.decode().strip()
    now = datetime.now().strftime("%H:%M:%S")

    if commande.lower() == "reset":
        print(f"[{now}] 🔁 RESET Button pressed")
    elif commande.lower() == "custom":
        print(f"[{now}] 👋 ANIMATION Button pressed")
    elif commande.startswith("M"):
        try:
            moteur = int(commande[1:commande.index(":")])
            value = commande.split(":")[1]
            joystick = ""
            label = ""

            if moteur in [1, 2]:
                joystick = "🕹️  LEFT Joystick"
            elif moteur in [3, 4]:
                joystick = "🕹️  RIGHT Joystick"
            elif moteur == 5:
                joystick = "🕹️  MIDDLE Joystick"
            elif moteur == 6:
                joystick = "🕹️  MIDDLE Joystick"
                label = "[OPEN]" if value == "10" else "[CLOSED]"

            print(f"[{now}] {joystick} → 🦾 M{moteur}={value}° {label}")

        except:
            print(f"[{now}] ❓ Command Unknown : {commande}")
    else:
        print(f"[{now}] ❓ Unknown : {commande}")

    if ser and ser.is_open:
        ser.write((commande + '\n').encode())
        return 'OK'
    else:
        return 'OK (simulation)'

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
