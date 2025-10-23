# Pose Tracking Stickman Web App

Una web app che utilizza la fotocamera per tracciare la posizione del corpo in tempo reale e visualizza uno stickman animato in SVG.

## Caratteristiche

- 🎥 Accesso alla webcam in tempo reale
- 🤖 Rilevamento della posizione del corpo usando MediaPipe Pose
- 🎨 Visualizzazione stickman SVG animato
- 📊 Overlay dei landmark sul video
- 📱 Design responsive
- 🎯 Interfaccia intuitiva

## Tecnologie Utilizzate

- **HTML5**: Struttura della pagina
- **CSS3**: Styling e layout responsive
- **JavaScript**: Logica dell'applicazione
- **MediaPipe Pose**: Libreria di Google per il rilevamento della posizione del corpo
- **SVG**: Grafica vettoriale per lo stickman

## Come Usare

### Requisiti

- Browser moderno (Chrome, Firefox, Safari, Edge)
- Webcam funzionante
- Connessione internet (per caricare le librerie MediaPipe)

### Installazione

1. Clona il repository o scarica i file
2. Avvia un server locale nella directory del progetto

#### Opzione 1: Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Opzione 2: Node.js HTTP Server

```bash
# Installa http-server globalmente
npm install -g http-server

# Avvia il server
http-server -p 8000
```

#### Opzione 3: VS Code Live Server

- Installa l'estensione "Live Server" in VS Code
- Click destro su `index.html` e seleziona "Open with Live Server"

3. Apri il browser e vai su `http://localhost:8000`

### Utilizzo

1. Clicca sul pulsante "Avvia Fotocamera"
2. Concedi i permessi per l'accesso alla webcam quando richiesto
3. Posizionati davanti alla fotocamera
4. Osserva lo stickman SVG che replica i tuoi movimenti in tempo reale
5. Clicca su "Ferma Fotocamera" per terminare

## Struttura del Progetto

```
.
├── index.html      # Pagina principale
├── styles.css      # Stili CSS
├── app.js          # Logica JavaScript
└── README.md       # Documentazione
```

## Come Funziona

1. **Accesso alla Fotocamera**: L'app richiede l'accesso alla webcam usando l'API WebRTC
2. **Rilevamento Pose**: MediaPipe Pose analizza ogni frame per rilevare 33 landmark del corpo
3. **Elaborazione Dati**: I landmark vengono estratti e normalizzati
4. **Rendering SVG**: Lo stickman SVG viene aggiornato in tempo reale con le coordinate rilevate
5. **Visualizzazione**: Il video mostra i landmark sovrapposti e l'SVG mostra lo stickman animato

## Landmark Utilizzati

L'applicazione traccia i seguenti punti del corpo:

- Testa (naso)
- Spalle (sinistra e destra)
- Gomiti (sinistro e destro)
- Polsi (sinistro e destro)
- Anche (sinistra e destra)
- Ginocchia (sinistra e destra)
- Caviglie (sinistra e destra)

## Browser Supportati

- ✅ Chrome/Edge (Chromium) - Raccomandato
- ✅ Firefox
- ✅ Safari
- ⚠️ Mobile browsers (funzionalità limitata)

## Note Importanti

- È necessaria una buona illuminazione per un tracking ottimale
- La fotocamera deve essere posizionata frontalmente
- L'intero corpo deve essere visibile per un tracking completo
- Le prestazioni dipendono dalla potenza del dispositivo

## Risoluzione Problemi

### La fotocamera non si avvia

- Verifica i permessi della fotocamera nel browser
- Assicurati di usare HTTPS o localhost
- Controlla che nessun'altra app stia usando la fotocamera

### Il tracking è lento

- Prova a ridurre la complessità del modello in `app.js` (modelComplexity: 0)
- Chiudi altre schede del browser
- Usa un dispositivo più potente

### Lo stickman non si muove

- Assicurati di essere completamente visibile nella fotocamera
- Migliora l'illuminazione
- Controlla la console del browser per errori

## Personalizzazione

### Cambiare i colori dello stickman

Modifica in `index.html` gli attributi `stroke` e `fill` degli elementi SVG:

```html
<line id="spine" stroke="#00ff00" />  <!-- Verde -->
<circle id="head" stroke="#ff0000" /> <!-- Rosso -->
```

### Modificare la sensibilità del tracking

In `app.js`, modifica le opzioni di MediaPipe:

```javascript
pose.setOptions({
    modelComplexity: 1,  // 0, 1, o 2 (più alto = più accurato ma più lento)
    minDetectionConfidence: 0.5,  // 0.0 - 1.0
    minTrackingConfidence: 0.5    // 0.0 - 1.0
});
```

## Licenza

Questo progetto è open source e disponibile sotto licenza MIT.

## Crediti

- MediaPipe Pose: Google MediaPipe Team
- Icone e design: Progetto originale

## Supporto

Per problemi o domande, apri una issue nel repository.

---

Buon tracking! 🎉
