export default async function handler(req, res) {
  try {
    const nome = req.query.name || '';

    const url = nome
      ? `https://api.api-ninjas.com/v1/dogs?name=${encodeURIComponent(nome)}`
      : 'https://api.api-ninjas.com/v1/dogs';

    const resposta = await fetch(url, {
      headers: {
        'X-Api-Key': process.env.API_NINJAS_KEY
      }
    });

    const texto = await resposta.text();

    res.status(resposta.status);

    try {
      return res.json(JSON.parse(texto));
    } catch {
      return res.send(texto);
    }
  } catch (erro) {
    console.error('Erro ao consultar API Ninjas:', erro);

    return res.status(500).json({
      error: 'Erro interno ao consultar a API.'
    });
  }
}
