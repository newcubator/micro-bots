Recruitment Bewerber Workflow

Idee ist Bewerbungen bei uns mit Gitlab Tickets zu bearbeiten. So lässt sich
einfach dokumentieren was bereits gemacht wurde und Aufgaben lassen sich
besser koordinieren. Mit dieser Automatisierung werden Bewerbungen, welche als
Mail an uns gesendet werder in ein Ticket überführt.

Achtung: Diese Automatisierung funktioniert nur im Zusammenspiel mit Zapier.
Aktuell übernimmt ein Zap die Überwachung der Mailbox und ruft die Lambda
Function mit einer Mail ID auf. So mussten wir uns nicht um diesen Teil der
Automatisierung kümmern. Die Microsoft Graph API kennt zwar Subscriptions,
mit welchen sich Mails überwachen lassen, diese haben aber eine kurze
Gültigkeit und müssen alle 2-3 Tage erneuert werden. Diese Komplexität
können wir so erstmal sparen.

[Bewerbungs Mails Zap](https://zapier.com/editor/173632660/published)

### Microsoft App

In order to grand permissions this automation uses an azure app.

[Micro Bots App](https://portal.azure.com/#view/Microsoft_AAD_RegisteredApps/ApplicationMenuBlade/~/Overview/appId/5b846559-5861-42d4-92b0-787bef833831)

**Necessary Permissions:**

- `Mail.Read`

### Archive Ordner ID

Als Teil des Codes ist eine Folder ID eingetragen. Bei dieser handelt es sich
um den technischen Schlüssel eines Ordners in der Mailbox, welche wir
überwachen. Nachdem eine Mail in ein Ticket überführt wurde, wird sie als
gelesen markiert und in diesen Ordner verschoben. Sollte man den Ordner ändern
wollen kann man mit den folgenden Befehlen die neue ID bestimmen.

```
$ MICROSOFT_ACCESS_TOKEN=$(curl -s -X POST \
  --data-urlencode "client_id=${MICROSOFT_CLIENT_ID}" \
  --data-urlencode "client_secret=${MICROSOFT_CLIENT_SECRET}" \
  --data-urlencode "scope=https://graph.microsoft.com/.default" \
  --data-urlencode "grant_type=client_credentials" \
  "https://login.microsoftonline.com/${MICROSOFT_TOKEN}/oauth2/v2.0/token" | jq -r .access_token)

$ curl -H "Authorization: Bearer ${MICROSOFT_ACCESS_TOKEN}" "https://graph.microsoft.com/v1.0/users/info@newcubator.com/mailFolders" | jq
```
