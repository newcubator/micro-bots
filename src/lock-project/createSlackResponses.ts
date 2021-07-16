const responseTemplate = (text) => ({
  response_type: "ephemeral",
  text,
});

export const lockUnlockProjectErrorNoProjectId = () => {
  return responseTemplate(
    "Du hast keine Projekt ID angegeben oder deine Projekt ID war ungültig. Versuche das Kommando noch einmal mit einer korrekten Projekt ID aufzurufen."
  );
};

export const lockUnlockProjectErrorNoProjectFound = () => {
  return responseTemplate("Es wurde zu der angegebenen Projekt ID kein Projekt gefunden.");
};

export const lockProjectSuccess = (projectId: string) => {
  return responseTemplate(`Ich habe das Projekt mit der ID: ${projectId} erfolgreich gesperrt.`);
};

export const unlockProjectSuccess = (projectId: string) => {
  return responseTemplate(`Ich habe das Projekt mit der ID: ${projectId} erfolgreich entsperrt.`);
};
