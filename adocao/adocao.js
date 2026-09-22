const API_URL = '/api/dogs';

const buscaRaca = document.getElementById('buscaRaca');
const seletorRaca = document.getElementById('seletorRaca');
const botaoBuscar = document.getElementById('botaoBuscar');
const resultadoRaca = document.getElementById('resultadoRaca');
const mensagemStatus = document.getElementById('mensagemStatus');
const sugestoesRacas = document.getElementById('sugestoesRacas');
let racas = [];
let ultimaBusca = '';

function mostrarStatus(mensagem, tipo = '') {
  mensagemStatus.textContent = mensagem;
  mensagemStatus.className = `status-message ${tipo}`.trim();
}

function normalizarRaca(raca) {
  return {
    name: raca.name || 'Raça sem nome',
    image_link: raca.image_link || '',
    good_with_children: raca.good_with_children || 'Não informado',
    good_with_other_dogs: raca.good_with_other_dogs || 'Não informado',
    shedding: raca.shedding || 'Não informado',
    energy: raca.energy || 'Não informado',
    trainability: raca.trainability || 'Não informado',
    grooming: raca.grooming || 'Não informado',
    characteristics: raca.characteristics || 'Consulte nossa equipe para saber mais sobre esta raça.'
  };
}

function atualizarSugestoes(lista) {
  sugestoesRacas.innerHTML = '';
  lista.forEach(raca => {
    const option = document.createElement('option');
    option.value = raca.name;
    sugestoesRacas.appendChild(option);
  });
}

function atualizarSeletor(lista) {
  seletorRaca.innerHTML = '<option value="">Selecione uma raça</option>';
  lista.forEach((raca, indice) => {
    const option = document.createElement('option');
    option.value = indice;
    option.textContent = raca.name;
    seletorRaca.appendChild(option);
  });
  seletorRaca.disabled = lista.length === 0;
}

function exibirRaca(raca) {
  const imagem = raca.image_link
    ? `<img class="breed-image" src="${raca.image_link}" alt="Cão da raça ${raca.name}" />`
    : '<div class="breed-image" role="img" aria-label="Imagem não disponível"></div>';
  resultadoRaca.innerHTML = `${imagem}
    <div>
      <p class="eyebrow">Perfil para adoção</p>
      <h2>${raca.name}</h2>
      <p>${raca.characteristics}</p>
      <div class="breed-facts">
        <div class="breed-fact"><strong>Boa com crianças</strong><span>${raca.good_with_children}</span></div>
        <div class="breed-fact"><strong>Boa com outros cães</strong><span>${raca.good_with_other_dogs}</span></div>
        <div class="breed-fact"><strong>Nível de energia</strong><span>${raca.energy}</span></div>
        <div class="breed-fact"><strong>Facilidade de adestramento</strong><span>${raca.trainability}</span></div>
        <div class="breed-fact"><strong>Queda de pelo</strong><span>${raca.shedding}</span></div>
        <div class="breed-fact"><strong>Necessidade de tosa</strong><span>${raca.grooming}</span></div>
      </div>
    </div>`;
  resultadoRaca.hidden = false;
}

async function consultarRacas(nome = '') {
  mostrarStatus('Consultando raças disponíveis...');
  seletorRaca.disabled = true;
  const url = nome ? `${API_URL}?name=${encodeURIComponent(nome)}` : API_URL;

  try {
    const resposta = await fetch(url);

    if (!resposta.ok) {
      let detalhe = '';
      try {
        const erroApi = await resposta.json();
        detalhe = erroApi.error || erroApi.message || '';
      } catch (_) {
        try {
          detalhe = await resposta.text();
        } catch (_) {}
      }

      const mensagem = detalhe
        ? `API respondeu com status ${resposta.status}: ${detalhe}`
        : `API respondeu com status ${resposta.status}.`;

      throw new Error(mensagem);
    }

    const dados = await resposta.json();
    racas = Array.isArray(dados) ? dados.map(normalizarRaca) : [];

    if (!racas.length) {
      atualizarSeletor([]);
      atualizarSugestoes([]);
      resultadoRaca.hidden = true;
      mostrarStatus(
        nome ? `Nenhuma raça encontrada para “${nome}”. Tente outro nome.` : 'A API não retornou raças disponíveis.',
        'error'
      );
      return;
    }

    atualizarSeletor(racas);
    atualizarSugestoes(racas);
    seletorRaca.value = '0';
    exibirRaca(racas[0]);
    mostrarStatus(`${racas.length} raça(s) encontrada(s).`, 'success');
  } catch (erro) {
    racas = [];
    atualizarSeletor([]);
    atualizarSugestoes([]);
    resultadoRaca.hidden = true;
    const detalhe = erro && erro.message ? erro.message : 'Erro desconhecido.';
    mostrarStatus(`Não foi possível consultar a API agora. ${detalhe}`, 'error');
  }
}

function buscar() {
  const nome = buscaRaca.value.trim();

  if (nome.length < 2) {
    mostrarStatus(
      'Digite o nome de uma raça ou pelo menos duas letras e clique em Pesquisar.',
      'error'
    );

    buscaRaca.focus();
    return;
  }

  ultimaBusca = nome;
  consultarRacas(nome);
}


botaoBuscar.addEventListener('click', buscar);
buscaRaca.addEventListener('keydown', evento => {
  if (evento.key === 'Enter') buscar();
});
seletorRaca.addEventListener('change', () => {
  const raca = racas[Number(seletorRaca.value)];
  if (raca) exibirRaca(raca);
});

mostrarStatus('Digite o nome de uma raça ou pelo menos duas letras e clique em Pesquisar.'
);
