// URLs de paginação
let proximaUrl = 'https://pokeapi.co/api/v2/pokemon?limit=20';
let anteriorUrl = null;

// Lista de favoritos
let favoritos = [];

async function buscarPokemons(url) {
  // Exibe o 'loading' enquanto busca os dados
  document.getElementById('loading').style.display = 'block';

  try {
    const resposta = await fetch(url);
    const dados = await resposta.json();

    // Atualiza as URLs para a próxima e anterior página
    proximaUrl = dados.next;
    anteriorUrl = dados.previous;

    // Remove o 'loading' e exibe os botões de navegação
    document.getElementById('loading').style.display = 'none';
    document.getElementById('botoes-navegacao').style.display = 'flex';

    // Cria a lista de promessas para buscar os detalhes de cada Pokémon
    const promessasPokemons = dados.results.map(pokemon => fetch(pokemon.url).then(res => res.json()));

    // Aguarda todas as promessas serem resolvidas
    const detalhesPokemons = await Promise.all(promessasPokemons);

    // Cria o HTML e o insere na página
    const listaPokemons = document.getElementById('lista-pokemons');
    listaPokemons.innerHTML = ''; // Limpa a lista antes de adicionar novos Pokémon

    detalhesPokemons.forEach(pokemon => {
      const cardPokemon = document.createElement('div');
      cardPokemon.classList.add('cartao-pokemon');
      cardPokemon.innerHTML = `
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="imagem-pokemon">
        <h3 class="nome-pokemon">${pokemon.name.toUpperCase()}</h3>
        <p class="id-pokemon">#${pokemon.id}</p>
        <p class="tipos-pokemon">Tipo: ${pokemon.types.map(tipo => tipo.type.name).join(', ')}</p>
        <button onclick="adicionarAosFavoritos(${JSON.stringify(pokemon).replace(/"/g, "'")})">Adicionar aos Favoritos</button>
      `;
      listaPokemons.appendChild(cardPokemon);
    });

  } catch (erro) {
    console.error("Erro ao buscar Pokémons:", erro);
    document.getElementById('lista-pokemons').innerHTML = '<p>Erro ao carregar os Pokémons. Tente novamente mais tarde.</p>';
  }
}

// Função para adicionar um Pokémon à lista de favoritos
function adicionarAosFavoritos(pokemon) {
  // Verifica se o Pokémon já está na lista para evitar duplicatas
  const jaExiste = favoritos.some(fav => fav.id === pokemon.id);
  if (!jaExiste) {
    // Adiciona uma propriedade de anotação vazia
    pokemon.anotacao = '';
    favoritos.push(pokemon);
    renderizarFavoritos();
    alert(`${pokemon.name.toUpperCase()} foi adicionado aos favoritos!`);
  } else {
    alert(`${pokemon.name.toUpperCase()} já está na sua lista de favoritos!`);
  }
}

// Função para remover um Pokémon dos favoritos
function removerDosFavoritos(pokemonId) {
  favoritos = favoritos.filter(pokemon => pokemon.id !== pokemonId);
  renderizarFavoritos();
}

// Função para editar um Pokémon favorito
function editarFavorito(pokemonId) {
  const pokemon = favoritos.find(fav => fav.id === pokemonId);
  if (pokemon) {
    const novaAnotacao = prompt('Digite sua anotação para este Pokémon:', pokemon.anotacao);
    if (novaAnotacao !== null) {
      pokemon.anotacao = novaAnotacao;
      renderizarFavoritos();
    }
  }
}

// Função para renderizar a lista de favoritos
function renderizarFavoritos() {
  const listaFavoritos = document.getElementById('lista-favoritos');
  listaFavoritos.innerHTML = ''; // Limpa a lista antes de renderizar

  if (favoritos.length === 0) {
    listaFavoritos.innerHTML = '<p>Você ainda não tem Pokémons favoritos.</p>';
    return;
  }

  favoritos.forEach(pokemon => {
    const cardFavorito = document.createElement('div');
    cardFavorito.classList.add('cartao-pokemon');
    cardFavorito.innerHTML = `
      <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}" class="imagem-pokemon">
      <h3 class="nome-pokemon">${pokemon.name.toUpperCase()}</h3>
      <p class="anotacao-pokemon">Anotação: ${pokemon.anotacao || 'Nenhuma'}</p>
      <div class="botoes-favoritos">
        <button onclick="editarFavorito(${pokemon.id})">Editar</button>
        <button onclick="removerDosFavoritos(${pokemon.id})">Remover</button>
      </div>
    `;
    listaFavoritos.appendChild(cardFavorito);
  });
}

// Eventos de clique para os botões de navegação
document.addEventListener('DOMContentLoaded', () => {
  buscarPokemons(proximaUrl);
  renderizarFavoritos(); // Renderiza a lista de favoritos vazia ao carregar a página

  document.getElementById('botao-proximo').addEventListener('click', () => {
    if (proximaUrl) {
      buscarPokemons(proximaUrl);
    }
  });

  document.getElementById('botao-anterior').addEventListener('click', () => {
    if (anteriorUrl) {
      buscarPokemons(anteriorUrl);
    }
  });
});