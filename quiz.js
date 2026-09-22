// ============================================================
// QUIZ "Qual serviço é ideal para o seu pet?"
// Carregue este arquivo DEPOIS do script.js, antes do </body>.
// ============================================================

(function () {
  const quizBox = document.getElementById("quizBox");
  if (!quizBox) return; // seção do quiz não está na página

  const steps = Array.from(quizBox.querySelectorAll(".quiz-step"));
  const totalQuestions = steps.filter((s) => s.dataset.step !== "result").length;
  const progressBar = document.getElementById("quizProgressBar");
  const stepCount = document.getElementById("quizStepCount");

  let currentIndex = 0; // índice dentro de "steps"
  const scores = { banho: 0, tosa: 0, banho_tosa: 0, hidratacao: 0 };

  // Textos de resultado por serviço (valor precisa bater com as
  // <option> do <select id="servico"> no formulário de contato)
  const resultados = {
    banho: {
      valorSelect: "Banho",
      icone: "🛁",
      titulo: "Banho é o ideal para o seu pet!",
      texto:
        "Pelo seu perfil, um banho completo já resolve: deixa o pet limpo, cheiroso e confortável, sem precisar de tosa ou hidratação neste momento.",
    },
    tosa: {
      valorSelect: "Tosa higiênica",
      icone: "✂️",
      titulo: "Tosa higiênica é a recomendação certa!",
      texto:
        "O foco do seu pet agora é aparência e conforto no corte do pelo. A tosa higiênica vai deixar tudo alinhado e sob controle.",
    },
    banho_tosa: {
      valorSelect: "Banho e tosa",
      icone: "🐩",
      titulo: "Banho e tosa: o combo completo!",
      texto:
        "Seu pet vai se beneficiar do pacote completo: higiene e aparência cuidadas de uma vez só, com o máximo de conforto.",
    },
    hidratacao: {
      valorSelect: "Hidratação",
      icone: "💧",
      titulo: "Hidratação é o que seu pet precisa!",
      texto:
        "Sinais de pelo ressecado, queda ou pele sensível pedem um cuidado extra. A hidratação vai repor a saúde do pelo e da pele.",
    },
  };

  function showStep(index) {
    steps.forEach((step, i) => {
      step.hidden = i !== index;
    });

    const isResult = steps[index].dataset.step === "result";
    if (!isResult) {
      const questionNumber = index + 1;
      const percent = (questionNumber / totalQuestions) * 100;
      progressBar.style.width = percent + "%";
      stepCount.textContent = `Pergunta ${questionNumber} de ${totalQuestions}`;
    } else {
      progressBar.style.width = "100%";
      stepCount.textContent = "Resultado";
    }
  }

  function somarPontos(scoresObj) {
    Object.keys(scoresObj).forEach((chave) => {
      if (scores.hasOwnProperty(chave)) {
        scores[chave] += scoresObj[chave];
      }
    });
  }

  function calcularResultado() {
    let melhorChave = "banho";
    let melhorPontuacao = -1;
    Object.keys(scores).forEach((chave) => {
      if (scores[chave] > melhorPontuacao) {
        melhorPontuacao = scores[chave];
        melhorChave = chave;
      }
    });
    return resultados[melhorChave];
  }

  function exibirResultado() {
    const resultado = calcularResultado();
    document.getElementById("quizResultIcon").textContent = resultado.icone;
    document.getElementById("quizResultTitle").textContent = resultado.titulo;
    document.getElementById("quizResultText").textContent = resultado.texto;

    const btnAgendar = document.getElementById("quizGoContact");
    btnAgendar.dataset.servico = resultado.valorSelect;
  }

  // Clique nas opções de cada pergunta
  quizBox.addEventListener("click", function (event) {
    const opcao = event.target.closest(".quiz-option");
    if (opcao) {
      const scoresDaOpcao = JSON.parse(opcao.dataset.scores);
      somarPontos(scoresDaOpcao);

      // pequeno feedback visual antes de avançar
      const irmaos = opcao.parentElement.querySelectorAll(".quiz-option");
      irmaos.forEach((b) => b.classList.remove("selected"));
      opcao.classList.add("selected");

      setTimeout(function () {
        currentIndex++;
        if (currentIndex >= steps.length) {
          currentIndex = steps.length - 1;
        }
        showStep(currentIndex);
        if (steps[currentIndex].dataset.step === "result") {
          exibirResultado();
        }
      }, 250);
      return;
    }

    // Botão "Refazer o quiz"
    if (event.target.id === "quizRestart") {
      Object.keys(scores).forEach((chave) => (scores[chave] = 0));
      quizBox.querySelectorAll(".quiz-option.selected").forEach((b) => b.classList.remove("selected"));
      currentIndex = 0;
      showStep(currentIndex);
      return;
    }

    // Botão "Agendar esse serviço" -> leva ao formulário e pré-seleciona o serviço
    if (event.target.id === "quizGoContact") {
      const servicoRecomendado = event.target.dataset.servico;
      const selectServico = document.getElementById("servico");
      if (selectServico && servicoRecomendado) {
        selectServico.value = servicoRecomendado;
        // dispara o evento change, caso script.js dependa dele (ex.: liberar horários)
        selectServico.dispatchEvent(new Event("change"));
      }
      const contato = document.getElementById("contato");
      if (contato) {
        contato.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  // estado inicial
  showStep(currentIndex);
})();
