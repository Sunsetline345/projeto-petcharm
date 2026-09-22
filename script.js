
const HORARIOS = ['08:00', '09:30', '11:00', '13:30', '15:00', '16:30'];
const CHAVE_AGENDAMENTOS = 'petcharm-agendamentos';

function obterAgendamentos() {
  try {
    return JSON.parse(localStorage.getItem(CHAVE_AGENDAMENTOS)) || [];
  } catch {
    return [];
  }
}

function salvarAgendamentos(agendamentos) {
  localStorage.setItem(CHAVE_AGENDAMENTOS, JSON.stringify(agendamentos));
}

function mostrarLembrete() {
  const lembrete = document.getElementById('lembrete');
  if (!lembrete) return;

  const proximos = obterAgendamentos()
    .filter(agendamento => new Date(`${agendamento.data}T${agendamento.horario}`) >= new Date())
    .sort((a, b) => `${a.data}${a.horario}`.localeCompare(`${b.data}${b.horario}`));
  const proximo = proximos[0];

  if (proximo) {
    const dataFormatada = new Date(`${proximo.data}T12:00:00`).toLocaleDateString('pt-BR');
    lembrete.textContent = `Lembrete: ${proximo.petNome} tem ${proximo.servico} em ${dataFormatada} às ${proximo.horario}.`;
  }
}

// ========= Comum: menu mobile, ano no rodapé =========
document.addEventListener('DOMContentLoaded', () => {
  const videoHero = document.querySelector('.hero-video');
  if (videoHero) {
    let voltando = false;
    let quadroReverso;

    const reproduzirParaFrente = () => {
      voltando = false;
      videoHero.play().catch(() => {});
    };

    const reproduzirParaTras = () => {
      voltando = true;
      videoHero.pause();

      const voltar = () => {
        if (!voltando) return;
        videoHero.currentTime = Math.max(0, videoHero.currentTime - 0.033);

        if (videoHero.currentTime <= 0.01) {
          videoHero.currentTime = 0;
          reproduzirParaFrente();
          return;
        }

        quadroReverso = requestAnimationFrame(voltar);
      };

      cancelAnimationFrame(quadroReverso);
      quadroReverso = requestAnimationFrame(voltar);
    };

    videoHero.addEventListener('ended', reproduzirParaTras);
    videoHero.addEventListener('play', () => {
      if (voltando) videoHero.pause();
    });
  }

  // Preenche o ano automaticamente no footer
  const ano = document.getElementById('ano');
  if (ano) ano.textContent = new Date().getFullYear();

  // Menu mobile (toggle)
  const toggle = document.querySelector('.menu-toggle');
  const menu = document.getElementById('menu');
  if (toggle && menu) {
    toggle.addEventListener('click', () => menu.classList.toggle('open'));
    menu.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => menu.classList.remove('open'))
    );
  }

  const data = document.getElementById('data');
  const horario = document.getElementById('horario');
  if (data && horario) {
    const hoje = new Date();
    const hojeFormatado = hoje.toISOString().split('T')[0];
    data.min = hojeFormatado;

    data.addEventListener('change', () => {
      const dataEscolhida = new Date(`${data.value}T12:00:00`);
      const domingo = dataEscolhida.getDay() === 0;
      horario.innerHTML = '';

      if (!data.value || domingo) {
        horario.disabled = true;
        horario.innerHTML = '<option value="">Escolha um dia de segunda a sábado</option>';
        return;
      }

      const ocupados = obterAgendamentos()
        .filter(agendamento => agendamento.data === data.value)
        .map(agendamento => agendamento.horario);
      const disponiveis = HORARIOS.filter(hora => !ocupados.includes(hora));

      horario.disabled = disponiveis.length === 0;
      horario.innerHTML = '<option value="">Escolha um horário</option>';
      disponiveis.forEach(hora => {
        const option = document.createElement('option');
        option.value = hora;
        option.textContent = hora;
        horario.appendChild(option);
      });

      if (!disponiveis.length) {
        horario.innerHTML = '<option value="">Todos os horários estão ocupados</option>';
      }
    });
  }

  mostrarLembrete();
});

// ========= Validação simples do formulário =========
const form = document.getElementById('formContato');
if (form) {
  form.addEventListener('submit', (e) => {
    e.preventDefault(); // impede o envio padrão
    const feedback = document.getElementById('feedback');
    feedback.style.display = 'block';

    // Pega valores dos campos
    const nome = form.querySelector('#nome')?.value.trim();
    const email = form.querySelector('#email')?.value.trim();
    const petNome = form.querySelector('#petNome')?.value.trim();
    const petRaca = form.querySelector('#petRaca')?.value.trim();
    const servico = form.querySelector('#servico')?.value;
    const data = form.querySelector('#data')?.value;
    const horario = form.querySelector('#horario')?.value;
    const seletorHorario = form.querySelector('#horario');
    const mensagem = form.querySelector('#mensagem')?.value.trim();

    // Regex básico para validar e-mail
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '');

    if (!nome || !emailOk || !petNome || !petRaca || !servico || !data || !horario || !mensagem) {
      feedback.classList.add('erro');
      feedback.textContent = 'Por favor, preencha o serviço, a data, o horário e os demais campos.';
      return;
    }

    const agendamentos = obterAgendamentos();
    const horarioOcupado = agendamentos.some(agendamento =>
      agendamento.data === data && agendamento.horario === horario
    );
    if (horarioOcupado) {
      feedback.classList.add('erro');
      feedback.textContent = 'Esse horário acabou de ser reservado. Escolha outro, por favor.';
      return;
    }

    agendamentos.push({ nome, email, petNome, petRaca, servico, data, horario, mensagem });
    salvarAgendamentos(agendamentos);
    feedback.classList.remove('erro');
    const dataFormatada = new Date(`${data}T12:00:00`).toLocaleDateString('pt-BR');
    feedback.textContent = `Agendamento confirmado para ${petNome}: ${servico}, em ${dataFormatada} às ${horario}.`;
    form.reset();
    if (seletorHorario) {
      seletorHorario.disabled = true;
      seletorHorario.innerHTML = '<option value="">Escolha primeiro uma data</option>';
    }
    mostrarLembrete();
  });
}
