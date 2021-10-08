# Project Completion Notice

A Slack Slash Command that maks it easy to generate project completion notices that are then send to the client. After calling command all ather the needed information for the PDF can be entered interactivly. The final pdf is then posted in the slack thread of the command.

## Technical Flow

```mermaid
seqdiag {
  //activation = none;

  Slack  -> commandHandler [label = "Slash Command"];
  Slack <-- commandHandler [label = "Message Projekt Dropdown"];
  Slack -> interactivityHandler [label = "Dropdown Selection"];
           interactivityHandler -> eventHandler [label = "AWS Event"];
           interactivityHandler -> Slack [label = "Update Message"];
  Slack <-- interactivityHandler
  eventHandler -> Slack [label = "Upload PDF"];
  eventHandler -> Slack [label = "Update Message"];
}
```

As Slack only gives 3 seconds for handling interactions the geatering and generation of the PDF is done decoupled via Amazon EventBridge.

This implementation uses [Slack user interactions](https://api.slack.com/interactivity/handling). For this only one endpoint for all implementations can be configured. Fos now this is done only for this functionality.
