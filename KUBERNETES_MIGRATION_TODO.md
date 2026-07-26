# Kubernetes migration todo

Zielbild: `micro-bots` laeuft nicht mehr ueber Serverless Framework, API Gateway, Lambda und EventBridge, sondern als normaler Node.js Service auf der Kubernetes-Infrastruktur. Infrastructure as Code wird analog Stadt-Quest/Hubertus mit Pulumi TypeScript umgesetzt.

## Umsetzungsstatus auf `kuberntes-migration`

- Erledigt: Node HTTP-Service mit Healthcheck, CLI fuer die drei taeglichen Aufgaben, Dockerfile, Pulumi-Definition fuer Deployment, Service, IngressRoute und CronJobs sowie GitLab CI fuer Image-Build und Pulumi-Deploy.
- Erledigt: EventBridge, Lambda-Typen, Serverless Framework und AWS-spezifische Runtime-Konfiguration wurden entfernt. Slack-Aktionen laufen als geloggte In-Process-Background-Tasks mit `operationId`.
- Erledigt: Unit-Tests wurden auf direkte Payloads umgestellt; der HTTP-Healthcheck und der Background-Task-Runner sind abgedeckt.
- Vor dem ersten Deploy: die in `.gitlab-ci.yml` erwarteten geschuetzten CI-Variablen fuer GitLab OIDC, GCP Workload Identity, Kubernetes, Registry und Anwendung setzen.

## Zielarchitektur

- Ein Docker Image fuer die gesamte Anwendung bauen.
- Ein Kubernetes Deployment fuer den HTTP-Service betreiben.
- Drei Kubernetes CronJobs fuer die bisherigen Schedule-Lambdas betreiben.
- Laengere Slack-Aktionen in-process im HTTP-Service als Background Tasks ausfuehren.
- Strukturierte JSON-Logs nach stdout schreiben, damit Hubertus/Hannelore sie ueber den bestehenden OpenTelemetry Collector nach Google Cloud Logging exportieren koennen.
- Pulumi verwaltet Deployment, Service, Traefik IngressRoute, Secrets, Config und CronJobs.
- Zielcluster ist Hubertus.
- Ziel-Domain ist `microbots.hubertus.newcubator.com`.
- Secrets werden direkt als Pulumi Secrets verwaltet.
- CronJobs laufen in UTC, wie bisher.
- CronJobs werden beim ersten Kubernetes-Deploy pausiert angelegt. `SUSPEND_CRON_JOBS` ist in CI optional und standardmaessig `true`; erst nach dem Abschalten der AWS-Schedules wird es bewusst auf `false` gesetzt.
- Background Tasks werden ohne zusaetzliches Interface in-process umgesetzt.
- Der HTTP-Service startet mit einer Replica.
- Die alten API-Gateway-URLs werden beim Cutover abgerissen.

## 1. Testbaseline vor der Migration

- Aktuellen Teststand als Baseline festhalten:
  - `npm run lint`
  - `npm test -- --coverage --runInBand`
- Coverage-Luecken in migrationskritischen Bereichen vor dem Umbau schliessen:
  - `src/functions/birthday.ts`
  - `src/functions/vacation-handover.ts`
  - `src/functions/mail-signature.ts`
  - `src/birthday/filter-birthdays.ts`
  - zentrale API-Clients fuer GitLab, Moco und Slack, soweit sie durch Adapterwechsel beruehrt werden
- Bestehende Slack-Interaction-Tests als Regression Guard behalten.
- Tests fuer Fehlerfaelle ergaenzen, die im Kubernetes-Betrieb wichtig sind:
  - fehlende Environment-Konfiguration
  - Fehler beim Slack `responseUrl` Update
  - Fehler in Moco/GitLab/Slack API Calls
  - PDF-Erzeugung ohne Pflichtdaten
- Keine breite Coverage-Offensive starten; Fokus liegt auf Code, der beim Wegfall von Lambda/EventBridge angefasst wird.
- Erst nach gruener Baseline mit Runtime-Entkopplung beginnen.

## 2. Runtime von Lambda entkoppeln

- Eigene HTTP-Request-DTOs einfuehren und `APIGatewayEvent` aus den fachlichen Handlern entfernen.
- Eigene Event-DTOs fuer Slack-Aktionen behalten oder vereinheitlichen:
  - `SickNoteRequestedEvent`
  - `CompletionNoticeRequestedEvent`
  - `ShortMailRequestedEvent`
  - `PrivateChannelRequestedEvent`
- EventBridge-spezifische Wrapper aus den Event-Handlern entfernen:
  - `EventBridgeEvent<string, ...>` durch reine Payload-Parameter ersetzen.
  - `event.detail` durch direkten Zugriff auf die Payload ersetzen.
- Bisherige Lambda-Handler nur noch als Adapter betrachten und durch neue Adapter ersetzen:
  - HTTP-Adapter fuer Slack/Web.
  - CLI-Adapter fuer CronJobs.
  - Background-Task-Adapter fuer lange Slack-Aktionen.

## 3. HTTP-Service bauen

- HTTP-Framework auswaehlen, bevorzugt Hono oder Fastify.
- Neuen Server-Entrypoint anlegen, z.B. `src/server.ts`.
- Bestehende HTTP-Endpunkte als Routen nachbauen:
  - `POST /completion-notice-command`
  - `POST /private-channel-command`
  - `POST /select-menu-handler`
  - `POST /short-mail-command`
  - `POST /sick-note-command`
  - `POST /slack-interaction`
  - `POST /mailSignature`
  - `GET /mailSignatureGenerator`
- Health Endpoint ergaenzen:
  - `GET /healthz` fuer Kubernetes Probes.
- Slack-Interaktionen weiterhin schnell mit `200` beantworten.
- Bestehende Tests fuer Command- und Interaction-Handler auf framework-unabhaengige Funktionen umstellen.

## 4. Background Tasks statt EventBridge

- `src/background/run-background-task.ts` einfuehren.
- Pro Slack-Aktion eine `operationId` erzeugen.
- Background-Task-Wrapper muss mindestens loggen:
  - `started`
  - `completed`
  - `failed`
  - `durationMs`
  - `operationId`
  - `eventType`
  - Slack User/Channel, sofern vorhanden
- Fehler im Background Task abfangen, damit keine unhandled promise rejection den Prozess unkontrolliert beendet.
- Bei Fehlern wenn moeglich Slack per `responseUrl` informieren.
- Dem Slack-User bei Fehlern die `operationId` anzeigen, damit Support/Debugging in Google Cloud Logging moeglich ist.
- `src/clients/event-bridge.ts` entfernen.
- `@aws-sdk/client-eventbridge` entfernen.

## 5. CronJobs statt Schedule-Lambdas

- CLI-Entrypoint anlegen, z.B. `src/cli.ts`.
- Commands implementieren:
  - `birthday`
  - `book-issue-reminder`
  - `vacation-handover`
- Bestehende Schedule-Handler als reine Funktionen wiederverwenden:
  - `src/functions/birthday.ts`
  - `src/functions/gitlab-issue-reminder.ts`
  - `src/functions/vacation-handover.ts`
- Kubernetes CronJobs mit Zeitplan `5 4 * * *` anlegen.
- Die aktuelle Serverless-Zeit `04:05 UTC` beibehalten.
- CronJobs waehrend des Parallelbetriebs pausieren und erst nach dem Abschalten der AWS-Schedules mit `SUSPEND_CRON_JOBS=false` aktivieren.
- CronJob-Policies festlegen:
  - `concurrencyPolicy: Forbid`
  - `restartPolicy: Never`
  - sinnvolles `backoffLimit`, vermutlich `0` oder `1`
  - History Limits fuer erfolgreiche/fehlgeschlagene Jobs

## 6. Build und Packaging

- Produktionsbuild definieren.
- Sicherstellen, dass TypeScript nach `dist/` kompiliert wird.
- `package.json` Skripte ergaenzen:
  - `build`
  - `start`
  - `start:cli`
  - optional `dev`
- Multi-stage `Dockerfile` anlegen:
  - Node 24 Alpine als Build Stage.
  - `npm ci`.
  - `npm run build`.
  - Runtime Stage mit nur Produktionsdependencies und `dist`.
- Container lokal testen:
  - HTTP-Service startet.
  - `/healthz` antwortet.
  - CLI-Commands koennen gestartet werden.
- Pruefen, ob PDF-Rendering im Alpine-Container alle benoetigten Fonts/Dependencies hat.

## 7. Dependencies aufraeumen

- Entfernen, sobald Runtime migriert ist:
  - `serverless`
  - `serverless-esbuild`
  - `serverless-prune-plugin`
  - `@aws-sdk/client-eventbridge`
  - `@types/aws-lambda`
- `serverless.yml` entfernen oder als historische Referenz in der Migration ersetzen.
- Alte AWS-spezifische npm scripts entfernen:
  - `deploy:dev`
  - `deploy:prod`
  - `invoke`
- Klaeren, ob alte SES-Berechtigung wirklich ungenutzt ist.
- Environment-Namen pruefen:
  - `AWS_ACCESS_KEY_ID_GOOGLE`
  - `AWS_SECRET_ACCESS_KEY_GOOGLE`
  - eventuell sprechender benennen, falls weiter benoetigt.

## 8. Pulumi Infrastructure as Code

- Neues Infrastruktur-Verzeichnis anlegen, z.B. `infrastructure/`.
- `Pulumi.yaml` mit TypeScript/npm Runtime anlegen.
- Pulumi Component `MicroBots` anlegen, analog Stadt-Quest:
  - Registry Pull Secret fuer GitLab Container Registry.
  - Deployment `micro-bots-web`.
  - Service `micro-bots-web`.
  - Traefik `IngressRoute`.
  - CronJob `micro-bots-birthday`.
  - CronJob `micro-bots-book-issue-reminder`.
  - CronJob `micro-bots-vacation-handover`.
- Namespace-Strategie festlegen:
  - analog Stadt-Quest Namespace vermutlich nicht von Pulumi verwalten lassen.
  - Namespace als Stack Config referenzieren.
- Zielcluster Hubertus verwenden.
- Pulumi Stack Config definieren:
  - `namespace`
  - `domain`: `microbots.hubertus.newcubator.com`
  - `image-tag`
  - Ressourcenrequests/-limits
  - alle nicht-geheimen Config-Werte
- Pulumi Secrets definieren:
  - `SLACK_TOKEN`
  - `MOCO_TOKEN`
  - `GITLAB_TOKEN`
  - `REGISTRY_ACCESS_TOKEN`
  - weitere bisherige Env-Secrets
- Kubernetes Probes definieren:
  - readinessProbe auf `/healthz`
  - livenessProbe auf `/healthz`
- Ressourcen konservativ starten:
  - 1 Replica
  - kleine CPU/Memory Requests
  - Limits nach realem PDF-Verbrauch festlegen

## 9. GitLab CI/CD

- Bestehende AWS-Deploy-Logik entfernen.
- Test-Stage behalten:
  - `npm run lint`
  - `npm run test`
  - `npm run build`
- Build-Stage ergaenzen:
  - Docker-in-Docker oder bestehendes Build-Image verwenden.
  - Login in GitLab Registry.
  - Image als `registry.gitlab.com/newcubator/newcubator/micro-bots:sha-$CI_COMMIT_SHORT_SHA` bauen.
  - Image pushen.
- Deploy-Stage analog Stadt-Quest/Hubertus:
  - GitLab OIDC fuer Google Credentials.
  - `pulumi login gs://newcubator-pulumi`.
  - `pulumi config set image-tag sha-$CI_COMMIT_SHORT_SHA`.
  - `pulumi preview` fuer Merge Requests.
  - `pulumi up --yes` auf `main`.
  - `resource_group: production`.
- Optional scheduled drift check ergaenzen, analog Hubertus:
  - `pulumi preview --refresh --diff --expect-no-changes`.

## 10. Slack Cutover

- Ziel-Domain `microbots.hubertus.newcubator.com` verwenden.
- Slack App Request URLs auf die neue Domain umstellen:
  - Slash Commands.
  - Interactivity Endpoint.
  - Mail Signature Links.
- Hardcodierte API-Gateway-URL in `src/functions/mail-signature.ts` ersetzen.
- Alte Lambda/API-Gateway-Endpunkte beim Cutover entfernen.
- Fuer den Cutover ein kurzes Rollback-Szenario definieren:
  - vorheriges Serverless Deployment bei Bedarf erneut deployen.
  - Slack URLs im Notfall temporaer zurueck auf API Gateway setzen, falls die Infrastruktur noch rekonstruierbar ist.

## 11. Observability und Betrieb

- JSON Logger einfuehren, z.B. pino.
- Standardfelder definieren:
  - `service`
  - `version`
  - `operationId`
  - `eventType`
  - `status`
  - `durationMs`
- Google Cloud Logging Query fuer `operationId` dokumentieren.
- Fehler mit Stacktrace loggen, aber keine Tokens oder kompletten Slack Payloads.
- Container-Logs lokal und im Cluster pruefen.
- Kubernetes Restart/Crash sichtbar machen:
  - Deployment Status
  - Pod Restarts
  - CronJob Failures
- Optional spaeter Metriken ueber OTLP ergaenzen.

## 12. Tests und Verifikation

- Unit Tests nach Handler-Entkopplung anpassen.
- Tests fuer Background-Task-Wrapper ergaenzen:
  - success logging
  - error logging
  - keine unhandled rejection
  - Slack error response bei Fehler
- Tests fuer HTTP-Adapter ergaenzen:
  - Slack Payload parsing
  - schnelle `200` Response
  - Background Task wird gestartet
- Tests fuer CLI-Adapter ergaenzen:
  - korrekter Command ruft korrekte Task auf
  - unbekannter Command beendet mit Fehler
- Docker Smoke Tests:
  - `docker run ... node dist/cli.js birthday`
  - `docker run ... node dist/server.js`
- Pulumi Preview lokal pruefen.

## 13. Reihenfolge der Umsetzung

1. Migration in einem neuen Branch starten, getrennt vom `serverless-v4` Spike.
2. Testbaseline pruefen und migrationskritische Tests ergaenzen.
3. Handler von AWS-Typen entkoppeln.
4. Background-Task-Wrapper mit strukturierter Nachvollziehbarkeit bauen.
5. HTTP-Service einfuehren und Endpunkte portieren.
6. CLI fuer CronJobs einfuehren.
7. Tests gruen bekommen.
8. Dockerfile und Build-Skripte bauen.
9. Pulumi-Infrastruktur anlegen.
10. GitLab CI auf Image Build und Pulumi Deploy umbauen.
11. In Dev/Staging deployen.
12. Slack URLs testweise umstellen.
13. Produktion cutover.
14. Serverless/AWS-Reste entfernen.
15. Alte AWS-Ressourcen nach Beobachtungszeitraum abbauen.
