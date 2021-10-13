# Vacation Handover

The vacation handover bot automatically opens Gitlab issues for oncoming vacations. The bot checks the moco API for scheduled vacations and calculates the whole vacation duration. It then checks the current open Gitlab issues whether the detected vacation already has an open issue. If not it creates a new one. The bot also reminds everybody of someone's vacation one day prior to the vacation start.
