/* ========================================
   BASE DE CONHECIMENTO - BRASILEIRÃO 2025
   Desenvolvido por Gabriel Zattera
   Otimizado com boas práticas profissionais
   ======================================== */

// ========================================
// VARIÁVEIS GLOBAIS
// ========================================
let containerCartoes = document.querySelector(".container-cartoes");
let campoBusca = document.getElementById("campo-busca");
let botaoBusca = document.getElementById("botao-busca");
let elementoCarregando = document.getElementById("carregando");
let dadosTimes = [];
let tempoDebounce = null;

// ========================================
// FUNÇÃO PRINCIPAL - INICIALIZAÇÃO
// ========================================
function inicializar() {
    // Carrega os dados ao iniciar a página
    carregarDados();
    
    // Adiciona event listeners
    if (botaoBusca) {
        botaoBusca.addEventListener('click', iniciarBusca);
    }
    
    if (campoBusca) {
        // Busca ao pressionar Enter
        campoBusca.addEventListener('keypress', (evento) => {
            if (evento.key === 'Enter') {
                iniciarBusca();
            }
        });
        
        // Busca em tempo real (com debounce)
        campoBusca.addEventListener('input', () => {
            clearTimeout(tempoDebounce);
            tempoDebounce = setTimeout(() => {
                iniciarBusca();
            }, 500); // Espera 500ms após parar de digitar
        });
    }
}

// ========================================
// CARREGAR DADOS DO JSON
// ========================================
async function carregarDados() {
    // Se já carregou, não carrega novamente
    if (dadosTimes.length > 0) {
        renderizarCartoes(dadosTimes);
        return;
    }

    mostrarCarregando(true);

    try {
        const resposta = await fetch("dados.json");
        
        if (!resposta.ok) {
            throw new Error(`Erro HTTP: ${resposta.status}`);
        }
        
        dadosTimes = await resposta.json();
        renderizarCartoes(dadosTimes);
        
    } catch (erro) {
        console.error("Erro ao carregar dados:", erro);
        mostrarErro("Não foi possível carregar os dados dos times. Verifique se o arquivo dados.json existe.");
    } finally {
        mostrarCarregando(false);
    }
}

// ========================================
// INICIAR BUSCA
// ========================================
async function iniciarBusca() {
    // Se os dados ainda não foram carregados
    if (dadosTimes.length === 0) {
        await carregarDados();
        return;
    }

    const termoBusca = sanitizarTexto(campoBusca?.value || "");
    
    // Se não há termo de busca, mostra todos
    if (!termoBusca) {
        renderizarCartoes(dadosTimes);
        return;
    }

    const dadosFiltrados = dadosTimes.filter(time => {
        const nome = sanitizarTexto(time.nome || "");
        const descricao = sanitizarTexto(time.descricao || "");
        
        return nome.includes(termoBusca) || descricao.includes(termoBusca);
    });

    renderizarCartoes(dadosFiltrados);
}

// ========================================
// RENDERIZAR CARTÕES
// ========================================
function renderizarCartoes(listaTimes) {
    if (!containerCartoes) return;

    // Limpa o container
    containerCartoes.innerHTML = "";

    // Se não há resultados
    if (!listaTimes || listaTimes.length === 0) {
        mostrarMensagem("Nenhum time encontrado. Tente buscar por outro nome ou limpe a busca.", "sem-resultados");
        return;
    }

    // Cria um fragmento para melhor performance
    const fragmento = document.createDocumentFragment();

    listaTimes.forEach(time => {
        const cartao = criarCartao(time);
        fragmento.appendChild(cartao);
    });

    containerCartoes.appendChild(fragmento);
}

// ========================================
// CRIAR CARTÃO
// ========================================
function criarCartao(time) {
    // Cria o article (cartão)
    const cartao = document.createElement("article");
    cartao.className = "cartao";

    // Título (nome do time)
    const titulo = document.createElement("h2");
    titulo.className = "cartao__titulo";
    titulo.textContent = time.nome || "Sem nome";

    // Descrição
    const descricao = document.createElement("p");
    descricao.className = "cartao__texto";
    descricao.textContent = time.descricao || "Sem descrição disponível.";

    // Ano de fundação
    const ano = document.createElement("p");
    ano.className = "cartao__texto";
    ano.innerHTML = `<strong>Fundado em:</strong> ${time.ano || "Não informado"}`;

    // Monta o cartão
    cartao.appendChild(titulo);
    cartao.appendChild(descricao);
    cartao.appendChild(ano);

    // Lista de exemplos (se existir)
    if (Array.isArray(time.exemplos) && time.exemplos.length > 0) {
        const lista = document.createElement("ul");
        lista.className = "cartao__lista";

        time.exemplos.forEach(exemplo => {
            const item = document.createElement("li");
            item.className = "cartao__item";
            item.textContent = exemplo;
            lista.appendChild(item);
        });

        cartao.appendChild(lista);
    }

    // Link para site oficial (se existir)
    if (time.link) {
        const link = document.createElement("a");
        link.className = "cartao__link";
        link.href = time.link;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        link.textContent = "Saiba mais";
        link.setAttribute("aria-label", `Visite o site oficial do ${time.nome}`);
        
        cartao.appendChild(link);
    }

    return cartao;
}

// ========================================
// FUNÇÕES AUXILIARES
// ========================================

/**
 * Sanitiza texto para busca (remove espaços, lowercase)
 */
function sanitizarTexto(texto) {
    return texto
        .toString()
        .toLowerCase()
        .trim()
        .normalize("NFD") // Remove acentos
        .replace(/[\u0300-\u036f]/g, "");
}

/**
 * Mostra/esconde indicador de carregamento
 */
function mostrarCarregando(exibir) {
    if (elementoCarregando) {
        elementoCarregando.style.display = exibir ? "flex" : "none";
    }
}

/**
 * Mostra mensagem no container de cartões
 */
function mostrarMensagem(texto, classe = "sem-resultados") {
    if (!containerCartoes) return;

    containerCartoes.innerHTML = "";
    
    const mensagem = document.createElement("p");
    mensagem.className = classe;
    mensagem.textContent = texto;
    
    containerCartoes.appendChild(mensagem);
}

/**
 * Mostra mensagem de erro
 */
function mostrarErro(mensagem) {
    mostrarMensagem(mensagem, "mensagem-erro");
}

// ========================================
// INICIALIZA QUANDO O DOM ESTIVER PRONTO
// ========================================
if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", inicializar);
} else {
    inicializar();
}