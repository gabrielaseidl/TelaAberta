// Pergunta à API se ela está funcionando e mostra o resultado no rodapé
async function verificarApi() {
  const elemento = document.getElementById('status-api');

  try {
    const resposta = await fetch('/api/saude');   // requisição GET para o backend

    if (!resposta.ok) {                            // ok = status entre 200 e 299
      throw new Error(`HTTP ${resposta.status}`);
    }

    const dados = await resposta.json();           // converte o JSON em objeto JS
    elemento.textContent = `● ${dados.mensagem}`;  // atualiza o DOM
    elemento.classList.add('ok');
  } catch (erro) {
    elemento.textContent = '● Não foi possível conectar à API';
    elemento.classList.add('erro');
  }
}

verificarApi();