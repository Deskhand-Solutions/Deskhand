# Best Practices: KI-generiertes E-Mail-Marketing

Diese Richtlinien stellen sicher, dass die KI qualitativ hochwertige, conversionstarke und technisch einwandfreie HTML-Marketing-E-Mails generiert. Sie dienen als Referenz für Benutzer (Prompt-Writing) und können als System-Instruktionen für LLMs verwendet werden.

---

## ✍️ 1. Struktur & Prompt-Briefing (Für Nutzer & KI)

Damit die KI keine generischen Standardtexte (AI Slop) erzeugt, muss das Briefing strukturiert sein. Folgende Punkte sollten im **Kontext** immer abgedeckt werden:

*   **Zielgruppe**: Wer liest die E-Mail? (z. B. „Bestehende B2B-Kunden, die Software nutzen“ vs. „Neukunden im E-Commerce“).
*   **Hauptbotschaft (Value Proposition)**: Welches konkrete Problem wird gelöst? Welcher Vorteil wird geboten?
*   **Call to Action (CTA)**: Was ist die primäre Handlung, die der Empfänger ausführen soll? (Verwende nur **einen** klaren CTA-Button, um die Klickrate zu maximieren).
*   **Dringlichkeit / Angebot**: Gibt es eine Deadline? (z. B. „Nur bis Sonntag“).

---

## 🎨 2. Design, Layout & Barrierefreiheit (Für die KI)

HTML-E-Mails verhalten sich anders als moderne Webseiten. Damit die E-Mails in allen Clients (Outlook, Apple Mail, Gmail) optimal aussehen, gelten folgende Best Practices:

*   **Breite**: Die maximale Inhaltsbreite sollte immer **600px** betragen (optimale Lesbarkeit auf Desktop & Mobil).
*   **Layout**: Einspaltige Layouts (Single Column) bevorzugen. Mehrspaltige Layouts brechen auf Smartphones oft unschön um.
*   **Inline-Styles**: Styles müssen inline auf den HTML-Elementen liegen. Viele Clients (besonders Outlook) ignorieren `<style>`-Blöcke im Header.
*   **Schriftarten**: Standard-System-Schriftarten (System-Sans, Arial, Helvetica) als Fallback verwenden, da Webfonts (wie Google Fonts) nicht von allen E-Mail-Clients geladen werden.
*   **Bilder & Alt-Texte**: Bilder blockieren standardmäßig in vielen Clients. Jedes Bild **muss** einen beschreibenden Alt-Text haben, damit der Nutzer weiß, was dort zu sehen ist (z. B. `alt="Deskhand Dashboard mit Automations-Workflow"` statt `alt="Bild1"`).

---

## 📧 3. Betreffzeilen & Preheader

Die Betreffzeile entscheidet über die Öffnungsrate. 

*   **Länge**: Zwischen 40 und 60 Zeichen (längere Betreffzeilen werden auf Mobilgeräten abgeschnitten).
*   **Preheader**: Der Vorschautext neben oder unter dem Betreff im Posteingang. Die KI sollte den Preheader im HTML einbetten (z. B. via verstecktem `div` am Anfang des `<body>`).
*   **Tonalität**: Neugier wecken, ohne wie Spam zu wirken. Vermeide reine Großbuchstaben („SALE!!!“) und inflationäre Ausrufezeichen.

---

## 💡 4. Best-Practice-Briefing-Beispiele

### A. Für einen Newsletter (Beispiel)
> **Kontext**:
> Zielgruppe: B2B-Kunden im Marketing.
> Thema: 3 Hebel zur Steigerung der E-Mail-Zustellbarkeit.
> Mehrwert: Erklärung von SPF, DKIM und Listenhygiene in einfachen Worten.
> Call to Action: Zum Blogbeitrag (Link: /blog/zustellbarkeit).
> Tonalität: Professionell, beratend, lehrreich.

### B. Für einen Produkt-Launch (Beispiel)
> **Kontext**:
> Produkt: Deskhand WhatsApp-Modul.
> Zielgruppe: Online-Händler (E-Commerce).
> Mehrwert: Automatisierter Kundensupport und Bestellbestätigungen via WhatsApp. 100% DSGVO-konform.
> Call to Action: Jetzt Demo-Termin buchen.
> Tonalität: Innovativ, dynamisch, nutzenfokussiert.
