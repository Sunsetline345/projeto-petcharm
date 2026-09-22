// ============================================================
// QUIZ "Qual produto é ideal para o seu pet?" (produtos.html)
// Carregue este arquivo antes do </body>.
//
// AJUSTE AQUI: troque pelo id/seletor real da sua vitrine de
// produtos em produtos.html (ex.: "#vitrine", "#catalogo",
// "#lista-produtos"...). Se não existir, o botão final apenas
// não rola a página (mas o texto da recomendação continua
// aparecendo normalmente).
// ============================================================
const ANCORA_PRODUTOS = "#produtos";

(function () {
  const quizBox = document.getElementById("quizpBox");
  if (!quizBox) return; // seção do quiz não está na página

  const steps = Array.from(quizBox.querySelectorAll(".quizp-step"));
  const totalQuestions = steps.filter((s) => s.dataset.step !== "result").length;
  const progressBar = document.getElementById("quizpProgressBar");
  const stepCount = document.getElementById("quizpStepCount");

  let currentIndex = 0;
  const scores = { racao: 0, brinquedos: 0, remedios: 0, trajes: 0 };

  // Textos de resultado por categoria de produto.
  // "categoriaDados" é usado para tentar filtrar/destacar produtos
  // na vitrine, caso os cards tenham o atributo data-categoria
  // (ex.: <article class="product-card" data-categoria="racao">).
  const resultados = {
    racao: {
      categoriaDados: "racao",
      icone: "🍖",
      titulo: "Ração é o produto ideal agora!",
      texto:
        "Seu pet está precisando de uma boa alimentação. Vale conferir opções de ração adequadas à idade, porte e necessidades específicas dele.",
    },
    brinquedos: {
      categoriaDados: "brinquedos",
      icone: "🎾",
      titulo: "Brinquedos vão fazer a diferença!",
      texto:
        "Seu pet está pedindo estímulo e diversão. Brinquedos interativos ajudam a gastar energia e evitar tédio (e móveis destruídos).",
    },
    remedios: {
      categoriaDados: "remedios",
      icone: "💊",
      titulo: "Remédios ou itens de saúde são a prioridade!",
      texto:
        "Pelos sinais indicados, o momento pede atenção à saúde do seu pet. Confira nossa linha de remédios e itens de cuidado — e, se os sintomas persistirem, procure um veterinário.",
    },
    trajes: {
      categoriaDados: "trajes",
      icone: "🧥",
      titulo: "Trajes são a escolha certa!",
      texto:
        "Seu pet vai se beneficiar de conforto e proteção extra no dia a dia. Vale conferir roupinhas, coleiras e acessórios para diferentes ocasiões.",
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
    let melhorChave = "racao";
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
    document.getElementById("quizpResultIcon").textContent = resultado.icone;
    document.getElementById("quizpResultTitle").textContent = resultado.titulo;
    document.getElementById("quizpResultText").textContent = resultado.texto;

    const btnVerProdutos = document.getElementById("quizpGoProdutos");
    btnVerProdutos.dataset.categoria = resultado.categoriaDados;

    const recomendados = document.getElementById("quizpRecommended");
    if (recomendados) {
      const produtos = Array.from(document.querySelectorAll(".product-grid > .product-card"))
        .filter((card) => card.dataset.categoria === resultado.categoriaDados);
      recomendados.innerHTML = produtos.length
        ? `<h4>Produtos recomendados</h4><div class="quizp-recommended-grid">${produtos.map((card) => card.outerHTML).join("")}</div>`
        : "";
    }
  }

  // Tenta destacar/filtrar produtos da vitrine que tenham
  // data-categoria="racao|brinquedos|remedios|trajes".
  // Se sua vitrine não usar esse atributo, essa função simplesmente
  // não encontra nada e não faz nada — não quebra o site.
  function destacarProdutosDaCategoria(categoria) {
    const cards = document.querySelectorAll("[data-categoria]");
    if (!cards.length) return;

    cards.forEach((card) => {
      if (card.dataset.categoria === categoria) {
        card.classList.add("quizp-produto-destaque");
        card.style.display = "";
      } else {
        card.classList.remove("quizp-produto-destaque");
        // comente a linha abaixo se preferir só destacar, sem esconder os demais
        // card.style.display = "none";
      }
    });
  }

  quizBox.addEventListener("click", function (event) {
    const opcao = event.target.closest(".quizp-option");
    if (opcao) {
      const scoresDaOpcao = JSON.parse(opcao.dataset.scores);
      somarPontos(scoresDaOpcao);

      const irmaos = opcao.parentElement.querySelectorAll(".quizp-option");
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

    if (event.target.id === "quizpRestart") {
      Object.keys(scores).forEach((chave) => (scores[chave] = 0));
      quizBox.querySelectorAll(".quizp-option.selected").forEach((b) => b.classList.remove("selected"));
      currentIndex = 0;
      showStep(currentIndex);
      return;
    }

    if (event.target.id === "quizpGoProdutos") {
      const categoria = event.target.dataset.categoria;
      if (categoria) {
        destacarProdutosDaCategoria(categoria);
      }
      const vitrine = document.querySelector(ANCORA_PRODUTOS);
      if (vitrine) {
        vitrine.scrollIntoView({ behavior: "smooth" });
      }
    }
  });

  showStep(currentIndex);
})();
