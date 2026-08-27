const getAiPredictUrl = () => {
  const config = useRuntimeConfig();
  return config.ai?.predictUrl || process.env.AIRGAP_AI_PREDICT_URL || 'https://airgap-ai.aldwin-weber.fr/predire';
};

export default defineEventHandler(async (event) => {
  const rawBody = await readBody(event);

  const firstTransaction = Array.isArray(rawBody?.transactions) ? rawBody.transactions[0] : rawBody;
  const libelle = firstTransaction?.libelle ?? firstTransaction?.description ?? firstTransaction?.label ?? rawBody?.libelle ?? '';
  const montant = firstTransaction?.montant ?? firstTransaction?.amount ?? rawBody?.montant ?? rawBody?.amount ?? 0;

  if (!libelle || Number.isNaN(Number(montant))) {
    throw createError({
      statusCode: 400,
      message: 'Libellé et montant requis pour la prédiction.'
    });
  }

  const payload = {
    libelle: String(libelle),
    montant: Number(montant)
  };

  try {
    const response = await fetch(getAiPredictUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const text = await response.text();

    if (!response.ok) {
      throw new Error(`AI service error (${response.status}): ${text || response.statusText}`);
    }

    try {
      return text ? JSON.parse(text) : {};
    } catch {
      return { raw: text };
    }
  } catch (error) {
    console.error('Erreur lors de la prédiction IA:', error);
    throw createError({
      statusCode: 502,
      message: 'Erreur lors de la prédiction.'
    });
  }
});
