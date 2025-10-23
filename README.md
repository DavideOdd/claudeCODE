# Pose Tracking Stickman Web App

Una web app che utilizza la fotocamera per tracciare la posizione del corpo in tempo reale e visualizza uno stickman animato in SVG.

## Caratteristiche

### Tracking Avanzato
- 🎥 Accesso alla webcam in tempo reale
- 🤖 Rilevamento della posizione del corpo usando MediaPipe Pose
- 👁️ **Tracking del volto con occhi e bocca**
- 🤲 **Tracking delle mani opzionale** (attivabile/disattivabile)
- 📱 **Switch camera frontale/posteriore** per dispositivi mobile

### Visualizzazione
- 🎨 Stickman SVG con **linee nere spesse** e design pulito
- 👤 Dettagli facciali (occhi e bocca) sullo stickman
- ✋ Rappresentazione delle dita quando il tracking mani è attivo
- 📊 Overlay dei landmark sul video in tempo reale

### Esportazione
- 📷 **Snapshot SVG statico** - Salva la posa corrente come file SVG
- 🎬 **Registrazione animazione** - Registra i movimenti e esporta SVG animato

### Design
- 📱 Design responsive
- 🎯 Interfaccia intuitiva
- 🎨 Controlli chiari e ben organizzati

## Tecnologie Utilizzate

- **HTML5**: Struttura della pagina
- **CSS3**: Styling e layout responsive con animazioni
- **JavaScript ES6+**: Logica dell'applicazione
- **MediaPipe Pose**: Rilevamento della posizione del corpo (33 landmark)
- **MediaPipe Hands**: Rilevamento delle mani e dita (21 landmark per mano)
- **MediaPipe Face Mesh**: Rilevamento dettagliato del volto (468 landmark)
- **SVG**: Grafica vettoriale scalabile per lo stickman
- **WebRTC**: Accesso alla fotocamera del dispositivo

## Come Usare

### Requisiti

- Browser moderno (Chrome, Firefox, Safari, Edge)
- Webcam funzionante
- Connessione internet (per caricare le librerie MediaPipe)

### Opzione 1: GitHub Pages (Consigliato - Nessuna installazione!)

Puoi usare l'app direttamente online senza installare nulla:

1. Vai su **Settings** del repository GitHub
2. Nella sezione **Pages** (menu laterale sinistro)
3. In **Source**, seleziona il branch `claude/camera-position-tracking-011CUQ9vPhwzk1a9zHMLkbVY`
4. Clicca **Save**
5. Dopo qualche minuto, GitHub fornirà un URL tipo: `https://[username].github.io/[repository]/`
6. Visita l'URL e usa l'app direttamente dal browser!

**Nota**: GitHub Pages richiede HTTPS, quindi la fotocamera funzionerà senza problemi.

### Opzione 2: Installazione Locale

1. Clona il repository o scarica i file
2. Avvia un server locale nella directory del progetto

#### Con Python HTTP Server

```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000
```

#### Con Node.js HTTP Server

```bash
# Installa http-server globalmente
npm install -g http-server

# Avvia il server
http-server -p 8000
```

#### Con VS Code Live Server

- Installa l'estensione "Live Server" in VS Code
- Click destro su `index.html` e seleziona "Open with Live Server"

3. Apri il browser e vai su `http://localhost:8000`

### Utilizzo

#### Avvio Tracking
1. Clicca sul pulsante **"Avvia Fotocamera"**
2. Concedi i permessi per l'accesso alla webcam quando richiesto
3. Posizionati davanti alla fotocamera
4. Osserva lo stickman SVG che replica i tuoi movimenti in tempo reale con dettagli del volto (occhi e bocca)

#### Controlli Disponibili

**Switch Camera** (Mobile)
- Clicca su **"Cambia Camera"** per passare tra fotocamera frontale e posteriore
- Utile su smartphone e tablet con multiple fotocamere

**Tracking Mani**
- Attiva/disattiva il toggle **"Tracking Mani"** per abilitare il rilevamento delle dita
- Quando attivo, lo stickman mostrerà anche le 5 dita di ciascuna mano
- Disattivalo per migliorare le prestazioni se non necessario

**Snapshot SVG Statico**
- Clicca su **"📷 Foto Stickman"** per salvare la posa corrente
- Scarica automaticamente un file SVG statico della posizione attuale
- Perfetto per salvare pose specifiche

**Registrazione Animazione**
- Clicca su **"🔴 Avvia Registrazione"** per iniziare a registrare i tuoi movimenti
- Esegui i movimenti che vuoi catturare
- Clicca su **"⏹️ Ferma Registrazione"** per terminare
- Scarica automaticamente un file SVG animato che riproduce in loop i movimenti registrati
- Ideale per creare animazioni di esercizi, danze, o movimenti specifici

**Ferma Tracking**
- Clicca su **"Ferma Fotocamera"** per terminare e disattivare la webcam

## Struttura del Progetto

```
.
├── index.html      # Pagina principale
├── styles.css      # Stili CSS
├── app.js          # Logica JavaScript
└── README.md       # Documentazione
```

## Come Funziona

1. **Accesso alla Fotocamera**: L'app richiede l'accesso alla webcam usando l'API WebRTC (getUserMedia)
2. **Rilevamento Multi-Modello**:
   - **MediaPipe Pose**: Analizza ogni frame per rilevare 33 landmark del corpo
   - **MediaPipe Face Mesh**: Rileva 468 landmark facciali (usati per occhi e bocca)
   - **MediaPipe Hands** (opzionale): Rileva 21 landmark per ciascuna mano
3. **Elaborazione Dati**: I landmark vengono estratti, normalizzati e combinati
4. **Rendering SVG**: Lo stickman SVG viene aggiornato in tempo reale con:
   - Posizione del corpo (testa, busto, braccia, gambe)
   - Dettagli facciali (occhi e bocca)
   - Dita delle mani (se attivato)
5. **Visualizzazione**: Il video mostra i landmark sovrapposti e l'SVG mostra lo stickman con linee nere spesse
6. **Esportazione**:
   - **Snapshot**: Cattura l'SVG corrente e lo serializza come file scaricabile
   - **Animazione**: Registra fotogrammi con timestamp e li esporta come SVG animato con CSS keyframes

## Landmark Utilizzati

L'applicazione traccia i seguenti punti in tempo reale:

### Corpo (MediaPipe Pose - 33 landmark)
- **Testa**: Naso, occhi, orecchie
- **Busto**: Spalle (sinistra e destra)
- **Braccia**: Gomiti e polsi (sinistro e destro)
- **Anche**: Anche (sinistra e destra) - punto centrale del bacino
- **Gambe**: Ginocchia e caviglie (sinistra e destra)

### Volto (MediaPipe Face Mesh - 468 landmark)
- **Occhi**: Posizione occhio sinistro e destro
- **Bocca**: Contorno bocca per espressioni facciali

### Mani (MediaPipe Hands - 21 landmark per mano) *[Opzionale]*
- **Polso**: Base della mano
- **Dita**: Pollice, indice, medio, anulare, mignolo
- **Articolazioni**: Tutte le giunture delle dita

## Browser Supportati

- ✅ Chrome/Edge (Chromium) - Raccomandato
- ✅ Firefox
- ✅ Safari
- ⚠️ Mobile browsers (funzionalità limitata)

## Note Importanti

### Per il Tracking Ottimale
- È necessaria una **buona illuminazione** per un tracking accurato
- La fotocamera deve essere posizionata **frontalmente** per catturare tutto il corpo
- L'intero corpo deve essere **visibile** per un tracking completo
- Mantieni una **distanza adeguata** dalla fotocamera (circa 1.5-2 metri)

### Prestazioni
- Le prestazioni dipendono dalla **potenza del dispositivo**
- Il tracking delle **mani** richiede più risorse - attivalo solo se necessario
- Su dispositivi meno potenti, considera di disattivare il tracking mani
- Il rilevamento del volto (Face Mesh) ha un impatto minimo sulle prestazioni

### Esportazione SVG
- **Snapshot**: Salva immediatamente la posa corrente come SVG statico
- **Animazione**: Registra fino a 30 fps - durata consigliata 5-30 secondi
- I file SVG esportati sono **vettoriali** e scalabili senza perdita di qualità
- Le animazioni usano **CSS keyframes** e sono compatibili con tutti i browser moderni
- Gli SVG possono essere modificati con qualsiasi editor vettoriale (Inkscape, Illustrator, etc.)

## Risoluzione Problemi

### La fotocamera non si avvia

- Verifica i permessi della fotocamera nel browser (Settings > Privacy > Camera)
- Assicurati di usare **HTTPS** o **localhost** (richiesto da WebRTC)
- Controlla che nessun'altra app stia usando la fotocamera
- Prova a ricaricare la pagina (F5)

### Il tracking è lento o a scatti

- **Disattiva il tracking mani** se non necessario (migliora notevolmente le prestazioni)
- Riduci la complessità del modello in `app.js` (modelComplexity: 0)
- Chiudi altre schede del browser e applicazioni pesanti
- Usa un dispositivo più potente o prova su desktop invece che mobile

### Lo stickman non si muove o non appare

- Assicurati di essere **completamente visibile** nella fotocamera
- Migliora l'**illuminazione** dell'ambiente
- Allontanati dalla fotocamera (distanza ideale: 1.5-2 metri)
- Controlla la console del browser per errori (F12 > Console)

### Gli occhi/bocca non vengono tracciati

- Il tuo **viso deve essere ben illuminato** e visibile
- Guarda direttamente verso la fotocamera
- Face Mesh richiede qualche secondo per inizializzare - attendi

### Il tracking delle mani non funziona

- Assicurati che il **toggle "Tracking Mani" sia attivo** (verde)
- Le mani devono essere **ben visibili** e illuminate
- Non sovrapporre le mani tra loro
- MediaPipe Hands rileva max 2 mani contemporaneamente

### "Cambia Camera" non funziona

- Questa funzione è disponibile solo su **dispositivi con multiple fotocamere** (smartphone/tablet)
- Su desktop con una sola webcam, il bottone sarà disabilitato

### Il download SVG non parte

- Controlla le **impostazioni download** del browser
- Alcuni browser bloccano i download automatici - controlla le notifiche
- Verifica di avere spazio sufficiente sul dispositivo

## Personalizzazione

### Cambiare i colori dello stickman

Lo stickman usa linee **nere spesse** per impostazione predefinita. Per modificare i colori, modifica in `index.html` gli attributi `stroke` degli elementi SVG:

```html
<!-- Cambia il colore delle linee del corpo -->
<line id="spine" stroke="#000000" stroke-width="6" />  <!-- Nero (default) -->
<line id="spine" stroke="#FF0000" stroke-width="6" />  <!-- Rosso -->
<line id="spine" stroke="#0066FF" stroke-width="6" />  <!-- Blu -->

<!-- Cambia il colore degli occhi -->
<circle id="leftEye" fill="#000000" />  <!-- Nero (default) -->
<circle id="leftEye" fill="#FFFFFF" />  <!-- Bianco -->
```

### Cambiare lo sfondo dell'SVG

In `styles.css`, modifica il background dello stickman:

```css
#stickman {
    background: #ffffff;  /* Bianco (default) */
    background: #f0f0f0;  /* Grigio chiaro */
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);  /* Gradiente */
}
```

### Modificare lo spessore delle linee

In `index.html`, cambia l'attributo `stroke-width`:

```html
<line id="spine" stroke-width="6" />  <!-- Spesso (default) -->
<line id="spine" stroke-width="3" />  <!-- Medio -->
<line id="spine" stroke-width="10" /> <!-- Molto spesso -->
```

### Modificare la sensibilità del tracking

In `app.js`, modifica le opzioni di MediaPipe:

```javascript
// Pose tracking
pose.setOptions({
    modelComplexity: 1,  // 0, 1, o 2 (più alto = più accurato ma più lento)
    minDetectionConfidence: 0.5,  // 0.0 - 1.0
    minTrackingConfidence: 0.5    // 0.0 - 1.0
});

// Hands tracking
hands.setOptions({
    maxNumHands: 2,  // Numero massimo di mani da rilevare
    modelComplexity: 1,  // 0 o 1
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});

// Face Mesh
faceMesh.setOptions({
    maxNumFaces: 1,  // Numero massimo di visi da rilevare
    refineLandmarks: true,  // true per maggior precisione (occhi, labbra)
    minDetectionConfidence: 0.5,
    minTrackingConfidence: 0.5
});
```

## Licenza

Questo progetto è open source e disponibile sotto licenza MIT.

## Crediti

- **MediaPipe Pose**: Google MediaPipe Team
- **MediaPipe Hands**: Google MediaPipe Team
- **MediaPipe Face Mesh**: Google MediaPipe Team
- Design e implementazione: Progetto originale
- Librerie utilizzate: MediaPipe, WebRTC

## Supporto

Per problemi o domande, apri una issue nel repository.

---

Buon tracking! 🎉
