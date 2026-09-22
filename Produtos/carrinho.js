const CHAVE_CARRINHO = "petcharm-carrinho";

(function () {
  const itensEl = document.getElementById("cartItems");
  if (!itensEl) return;
  const totalEl = document.getElementById("cartTotal");
  const countEl = document.getElementById("cartCount");
  const feedbackEl = document.getElementById("cartFeedback");
  let carrinho = JSON.parse(localStorage.getItem(CHAVE_CARRINHO) || "[]");

  function dinheiro(valor) { return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" }); }
  function salvar() { localStorage.setItem(CHAVE_CARRINHO, JSON.stringify(carrinho)); }
  function renderizar() {
    itensEl.innerHTML = "";
    let total = 0;
    let quantidade = 0;
    if (!carrinho.length) itensEl.innerHTML = '<p class="cart-empty">Seu carrinho está vazio.</p>';
    carrinho.forEach((item) => {
      total += item.preco * item.quantidade;
      quantidade += item.quantidade;
      const linha = document.createElement("div");
      linha.className = "cart-item";
      linha.innerHTML = `<div><div class="cart-item-name">${item.nome}</div><div class="cart-item-price">${dinheiro(item.preco * item.quantidade)}</div></div><button class="remove-item" data-id="${item.id}" type="button">Remover</button><div class="cart-item-actions"><button data-action="menos" data-id="${item.id}" type="button">−</button><span>${item.quantidade}</span><button data-action="mais" data-id="${item.id}" type="button">+</button></div>`;
      itensEl.appendChild(linha);
    });
    totalEl.textContent = dinheiro(total);
    countEl.textContent = quantidade;
    salvar();
  }
  function adicionar(card) {
    const item = carrinho.find((produto) => produto.id === card.dataset.id);
    if (item) item.quantidade += 1;
    else carrinho.push({ id: card.dataset.id, nome: card.dataset.nome, preco: Number(card.dataset.preco), quantidade: 1 });
    renderizar();
    feedbackEl.textContent = "Produto adicionado ao carrinho.";
  }
  itensEl.addEventListener("click", (event) => {
    const alvo = event.target.closest("button");
    if (!alvo) return;
    const item = carrinho.find((produto) => produto.id === alvo.dataset.id);
    if (!item) return;
    if (alvo.classList.contains("remove-item") || (alvo.dataset.action === "menos" && item.quantidade === 1)) carrinho = carrinho.filter((produto) => produto.id !== item.id);
    else if (alvo.dataset.action === "menos") item.quantidade -= 1;
    else if (alvo.dataset.action === "mais") item.quantidade += 1;
    renderizar();
  });
  document.addEventListener("click", (event) => {
    const botao = event.target.closest(".add-cart");
    if (botao) adicionar(botao.closest(".product-card"));
  });
  document.getElementById("cartToggle")?.addEventListener("click", () => {
    const painel = document.getElementById("cartPanel");
    painel.classList.toggle("is-open");
    document.getElementById("cartToggle").setAttribute("aria-expanded", painel.classList.contains("is-open"));
  });
  document.getElementById("cartClose")?.addEventListener("click", () => document.getElementById("cartPanel").classList.remove("is-open"));
  document.getElementById("checkoutButton")?.addEventListener("click", () => { feedbackEl.textContent = carrinho.length ? "Pedido preparado! A integração de pagamento pode ser adicionada depois." : "Adicione um produto antes de finalizar."; });
  renderizar();
})();