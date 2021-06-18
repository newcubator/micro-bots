const responseTemplate = (text) => ({
    response_type: 'ephemeral',
    text
});

export const completionNoticeSuccess = (orderNumber) => {
    return { statusCode: 200, body: `Danke für deine Anfrage, ich werde nach einem Projekt mit der Bestellnummer: "${orderNumber}" suchen.` };

};
export const completionNoticeErrorNoOrderNumber = () => {
    return responseTemplate('Du hast keine Bestellnummer angegeben oder deine Bestellnummer war ungültig. Versuche das Kommando noch einmal mit einer korrekten Bestellnummer aufzurufen.');
};

export const completionNoticeErrorNoProjectFound = () => {
    return responseTemplate('Es wurde zu der angegebenen Bestellnummer kein Projekt gefunden.');
};

export const completionNoticeErrorNoDealFound = () => {
    return responseTemplate('Es wurde zu der angegebenen Bestellnummer kein Deal gefunden.');
};

export const completionNoticeErrorNoContactFound = () => {
    return responseTemplate('Es wurde zu der angegebenen Bestellnummer keine Kontaktperson gefunden.');
};
