# PetCharm - Adoção / Vercel

## Estrutura

- `adocao/Index.html` — página enviada pelo projeto
- `adocao/adocao.css` — CSS enviado pelo projeto
- `adocao/adocao.js` — frontend sem chave API
- `api/dogs.js` — Function do Vercel que mantém a chave no servidor
- `.env.example` — exemplo da variável
- `.gitignore` — impede o envio de arquivos de ambiente

## Configuração no Vercel

No projeto do Vercel, em Settings > Environment Variables, crie:

`API_NINJAS_KEY` = sua chave da API Ninjas

Depois faça um novo deploy.

## Teste

Depois do deploy, a página chama:

`/api/dogs`

e para uma raça:

`/api/dogs?name=Labrador`

A chave não fica no JavaScript enviado ao navegador.
