## Urlaubsübergabe-Microbot

Der Urlaubsübergabe-Microbot prüft täglich die in MOCO geplanten Urlaube. Sieben Tage vor dem Urlaub erstellt er im Slack-Hauptchannel `#urlaubsübergaben` eine Hauptnachricht mit dem Zeitraum.

Im Thread der Nachricht steht eine kurze Checkliste. Die einzelnen Punkte können direkt in Slack abgehakt werden:

- offene Aufgaben und Fristen
- Vertretung und Zuständigkeiten
- Termine und wichtige Kontakte
- relevante Dokumente und Links
- nächste Schritte nach der Rückkehr

Der Microbot erstellt keine GitLab-Tickets mehr. Bereits erstellte Slack-Nachrichten werden anhand einer eindeutigen Übergabe-ID erkannt, damit der tägliche Cronjob keine Duplikate erstellt.

### Voraussetzungen

- ein Slack-Bot-Token als `SLACK_TOKEN`
- eine Slack-App mit den Berechtigungen `chat:write` und `channels:history`
- bei einem privaten Channel zusätzlich `groups:history`
- der Bot muss Mitglied von `#urlaubsübergaben` sein
- die ID des Channels als GitLab-CI-Variable `VACATION_HANDOVER_CHANNEL_ID`
- ein `MOCO_TOKEN`

Die Channel-ID ist die Kennung aus der Slack-Channel-URL oder aus den Channel-Details, zum Beispiel `C0123456789`. Der sichtbare Name `#urlaubsübergaben` wird nicht als Konfiguration verwendet, weil die Slack-API für zuverlässige Zugriffe die ID erwartet.

### Lokale Entwicklung

```text
npm run build
npm run start:cli -- vacation-handover
```

Die Ausführungszeit ist weiterhin im Kubernetes-CronJob `micro-bots-vacation-handover` in [`infrastructure/index.ts`](../infrastructure/index.ts) definiert.
