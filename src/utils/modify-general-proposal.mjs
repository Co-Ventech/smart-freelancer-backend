export const updateGeneralProposal = (clientName, proposal) => {
    const greeting = clientName ? `Hey ${clientName}, \n` : `Hey, how are you?\n`;
    return `
${greeting}
${proposal}
    `;
};
