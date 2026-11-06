import os
import random
import threading
import time
from flask import Flask, render_template
from flask_socketio import SocketIO, emit
import speech_recognition as sr
from gtts import gTTS
from playsound import playsound

# --- CONFIGURACIÓN DE RUTAS ---
base_dir = os.path.abspath(os.path.dirname(__file__))
root_dir = os.path.join(base_dir, "..")
template_dir = os.path.join(root_dir, 'ERP')
static_dir = os.path.join(root_dir, 'ERP')

app = Flask(__name__, 
            template_folder=template_dir, 
            static_folder=static_dir,
            static_url_path='/ERP')

app.config['SECRET_KEY'] = 'milpin_secret_601'

# Configuramos SocketIO para que use gevent explícitamente
socketio = SocketIO(app, cors_allowed_origins="*", async_mode='gevent')

# --- MOTOR COGNITIVO MILPÍN ---
class MilpinERP:
    def __init__(self):
        self.nombre_ia = "MILPÍN"
        self.audio_path = os.path.join(static_dir, "temp_voce.mp3")

    def hablar(self, texto):
        print(f"{self.nombre_ia}: {texto}")
        
        if os.path.exists(self.audio_path):
            try: os.remove(self.audio_path)
            except: pass

        tts = gTTS(text=texto, lang='es-us')
        tts.save(self.audio_path)
        
        socketio.emit('milpin_hablando', {'texto': texto})
        
        try:
            playsound(self.audio_path)
        except Exception as e:
            print(f"Error de reproducción: {e}")

    def procesar_comando(self, query):
        query = query.lower()
        
        if any(word in query for word in ["humedad", "sentinel", "mapas", "ndvi"]):
            self.hablar("Sincronizando monitor satelital. Analizando polígonos de estrés hídrico para el Sonora.")
            socketio.emit('cambiar_pestana', {'target': 'tab-mapas'})
            
        elif any(word in query for word in ["costo", "prescripción", "optimizar", "fertilizante"]):
            self.hablar("Iniciando módulo de costos. He optimizado la dosis de fertilización variable.")
            socketio.emit('cambiar_pestana', {'target': 'tab-costos'})

        elif any(word in query for word in ["rendimiento", "cosecha", "bi/r", "predicción"]):
            self.hablar("Cargando dashboard de analítica predictiva. Visualizando proyecciones de cosecha.")
            socketio.emit('cambiar_pestana', {'target': 'tab-bi'})

        elif "hola" in query:
            self.hablar("Hola agricultor. Soy Milpín, soy el Asistente Inteligente para la agricultura. ¿Qué datos del Valle del Yaqui revisaremos hoy?")
        elif any(word in query for word in ["logística", "almacén", "optimizar"]):
            self.hablar("Iniciando análisis de clustering. Calculando ubicaciones óptimas para logística.")
            socketio.emit('cambiar_pestana', {'target': 'tab-mapas'})
            # Esto le avisará al JS que ejecute el análisis automáticamente
            socketio.emit('ejecutar_analisis_sig')
        
        else:
            self.hablar("Comando recibido. Intenta preguntar por mapas, costos o rendimiento.")

asistente_instancia = MilpinERP()

# --- VINCULACIÓN DE ACTIVACIÓN MANUAL ---
@socketio.on('activar_microfono_manual')
def activar_manual():
    print(">>> MILPÍN: Activación manual detectada por clic.")
    socketio.emit('asistente_escuchando', {'active': True})
    
    def escuchar_ahora():
        r = sr.Recognizer()
        with sr.Microphone() as source:
            try:
                audio = r.listen(source, timeout=5, phrase_time_limit=5)
                texto = r.recognize_google(audio, language='es-MX').lower()
                asistente_instancia.procesar_comando(texto)
            except:
                asistente_instancia.hablar("No te escuché bien.")
            finally:
                socketio.emit('asistente_escuchando', {'active': False})

    threading.Thread(target=escuchar_ahora).start()

# --- HILO DE ESCUCHA (WAKE WORD) ---
def listener_thread(asistente):
    r = sr.Recognizer()
    r.energy_threshold = 400 
    
    with sr.Microphone() as source:
        print(">>> MILPÍN: SISTEMA OPERATIVO GEVENT ACTIVO.")
        print(">>> ESCUCHANDO EN EL VALLE DEL YAQUI...")
        while True:
            try:
                audio = r.listen(source, timeout=None, phrase_time_limit=4)
                texto = r.recognize_google(audio, language='es-MX').lower()
                
                if "milpín" in texto or "milpin" in texto:
                    socketio.emit('asistente_escuchando', {'active': True})
                    asistente.procesar_comando(texto)
                    socketio.emit('asistente_escuchando', {'active': False})
            except:
                continue

@app.route('/')
def index():
    return render_template('index.html')

if __name__ == '__main__':
    # Lanzar el hilo de voz
    t = threading.Thread(target=listener_thread, args=(asistente_instancia,), daemon=True)
    t.start()
    
    # EJECUCIÓN CON GEVENT (MODERNO)
    # log_output=True te permite ver qué pasa en el backend en tiempo real
    #socketio.run(app, debug=True, allow_unsafe_werkzeug=True, log_output=True)
    socketio.run(app, debug=False, allow_unsafe_werkzeug=True)


from flask import jsonify, request
from sklearn.cluster import KMeans
import numpy as np


@app.route('/api/logistica_inteligente')
def calcular_centros():
    try:
        # 1. Datos simulados de pedidos en el Valle del Yaqui
        pedidos = np.array([
            [27.3680, -109.9320], [27.3695, -109.9315], [27.3675, -109.9330], # Grupo 1
            [27.3750, -109.9450], [27.3765, -109.9465], [27.3740, -109.9440], # Grupo 2
            [27.3550, -109.9200], [27.3565, -109.9215], [27.3540, -109.9190]  # Grupo 3
        ])

        # 2. Configurar y entrenar el modelo K-Means
        n_clusters = 3
        kmeans = KMeans(n_clusters=n_clusters, random_state=42, n_init=10)
        kmeans.fit(pedidos)
        
        # 3. Extraer los centros (ubicaciones sugeridas)
        centros = kmeans.cluster_centers_.tolist()
        
        # 4. Retornar JSON puro
        return jsonify({
            "status": "success",
            "puntos_demanda": pedidos.tolist(),
            "almacenes_sugeridos": centros
        })

    except Exception as e:
        # Si algo falla (como que falte sklearn), lo verás en la consola de Python
        print(f"❌ Error en clustering: {e}")
        return jsonify({
            "status": "error",
            "message": str(e)
        }), 500