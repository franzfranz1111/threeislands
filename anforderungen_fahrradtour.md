# Anforderungen – Web-App „Bremer Straßencobras“ (Fahrradtour 2026)

## 1. Zugangscode
- **Auslöser:** Seitenaufruf  
- **System:** Web-App  
- **Funktion:** Vor dem Anzeigen der Inhalte muss der Nutzer einen statischen Code „text einfach“ eingeben. Bei falscher Eingabe erscheint die Meldung „falsches Passwort, bitte erneut versuchen“. Bei richtiger Eingabe bleibt der Zugang bis zum Schließen des Tabs aktiv.  
- **Zweck:** Einfacher, symbolischer Zugangsschutz.  

## 2. Hintergrundanimation (Snake)
- **Auslöser:** Seitenaufruf  
- **System:** Web-App  
- **Funktion:** Im Hintergrund läuft vollflächig eine endlose Snake-Animation (16-px Raster, Snake grün `#00FF66`, Hintergrund schwarz `#000`, Geschwindigkeit 6 Zellen/s). Animation pausiert bei inaktivem Tab, FPS auf max. 30 limitiert, respektiert „prefers-reduced-motion“ (dann statisch).  
- **Zweck:** Retro-Pixel-Look als visuelles Thema.  

## 3. Responsives Layout
- **Auslöser:** Initialer Seitenaufruf oder Resize  
- **System:** Web-App  
- **Funktion:** Inhalte skalieren für 320–414 px Breite; Menübuttons übereinander, Tap-Targets ≥ 48 px; Basis-Schriftgröße 16 px (Mobile), 18 px (Desktop); Safe-Area-Insets berücksichtigt; Animation reduziert auf ≤ 20 FPS, falls Leistung niedrig.  
- **Zweck:** Gute Bedienbarkeit und Performance auf Smartphones.  

## 4. Zentrale Menüführung
- **Auslöser:** Nach erfolgreicher Code-Eingabe  
- **System:** Web-App  
- **Funktion:** Mittig im Bildschirm erscheinen drei Menüpunkte im Retro-Pixelstil: „Strecke“, „Trailer“, „Anmelden“. Klick/Tap führt zu jeweiligem Inhalt im gleichen Dokument (Single-Page).  
- **Zweck:** Übersichtliche Navigation im Retro-Game-Design.  

## 5. Menüpunkt „Strecke“
- **Auslöser:** Klick/Tap auf Menüpunkt „Strecke“  
- **System:** Web-App  
- **Funktion:** Anzeige eines statischen Bildes (z. B. PNG/JPG) zentriert, auf max. 90 % der Viewportbreite skaliert, ohne Zoom/Interaktion.  
- **Zweck:** Darstellung der geplanten Tourstrecke.  

## 6. Menüpunkt „Trailer“
- **Auslöser:** Klick/Tap auf Menüpunkt „Trailer“  
- **System:** Web-App  
- **Funktion:** Anzeige eines eingebetteten YouTube-Videos (16:9, sichtbar mit Controls, kein Autoplay, kein Loop, Poster-Bild bis Play, Fallback-Text bei Ladefehler).  
- **Zweck:** Präsentation eines Trailers zur Tour.  

## 7. Menüpunkt „Anmelden“
- **Auslöser:** Klick/Tap auf Menüpunkt „Anmelden“  
- **System:** Web-App  
- **Funktion:** Anzeige eines statischen Infotextes (frei definierbar, z. B. Anmeldemodalitäten) und darunter eines klickbaren Links zur Telegram- oder Signal-Gruppe.  
- **Zweck:** Bereitstellung der Anmeldeinformationen über externe Gruppe.  

## 8. Retro-Pixelstil
- **Auslöser:** Darstellung aller Inhalte  
- **System:** Web-App  
- **Funktion:** Alle Texte, Buttons und UI-Elemente werden in Retro-Pixel-Schrift und Pixel-Grafikstil gerendert; Farbpalette auf wenige kontrastreiche Farben reduziert.  
- **Zweck:** Konsistenter visueller Stil passend zum Snake-Thema.  

## 9. Fallback bei fehlender Animation/Video
- **Auslöser:** Browser blockiert Canvas-Animation oder YouTube-Embed  
- **System:** Web-App  
- **Funktion:** Stattdessen wird statisch ein schwarzer Hintergrund ohne Animation angezeigt bzw. beim Trailer ein Text „Video kann nicht geladen werden“.  
- **Zweck:** Sicherstellung minimaler Nutzbarkeit.  

## 10. Einfache Architektur
- **Auslöser:** Bereitstellung/Deployment  
- **System:** Web-App  
- **Funktion:** Läuft vollständig clientseitig (HTML/CSS/JS), keine Backend-Anbindung, alle Ressourcen (Bild, Schrift, Animation, Menülogik) lokal oder per Embed geladen.  
- **Zweck:** Geringe Komplexität, einfache Veröffentlichung für den Tour-Club.  
