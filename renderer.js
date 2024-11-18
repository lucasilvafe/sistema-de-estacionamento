// renderer.js
const { ipcRenderer } = require('electron');

loadVeic();

// Função para enviar dados do usuário para o processo principal
async function insertVeic(placa, modelo, tipo) {
  try {
    const response = await ipcRenderer.invoke('insert-veic', { placa, modelo, tipo });
    if (response.success) {
      console.log(response.message);
      alert('Veículo cadastrado com sucesso!');
      
      resetForm(); // Reseta o formulário após o envio bem-sucedido
      loadVeic(); // Atualiza a lista de veículos
    } else {
      console.error(response.message);
      alert('Erro ao inserir veículo');
    }
  } catch (error) {
    console.error('Erro ao inserir veículo:', error);
  }
}


document.getElementById('veicForm').addEventListener('submit', (event) => {


  // Pega os valores dos campos do formulário
  const modelo = document.getElementById('modelo').value;
  const placa = document.getElementById('placa').value;
  
  // Obtém o valor do tipo de veículo selecionado
  const tipo = document.querySelector('input[name="tipo"]:checked').value;

  // Chama a função para inserir o veículo
  insertVeic(placa, modelo, tipo);
});

loadVeic();

// Função para limpar o formulário
function resetForm() {
  document.getElementById('placa').value = '';
  document.getElementById('tipo').value = '';
  document.getElementById('modelo').value = '';
}


// Função para carregar os usuários e exibir na interface
async function loadVeic() {
  try {
    const users = await ipcRenderer.invoke('get-veic');

    // Seleciona o elemento onde os dados serão exibidos
    const userList = document.getElementById('listaVeiculos');
    userList.innerHTML = ''; // Limpa o conteúdo atual

    // Adiciona cada veículo à lista
    users.forEach(veic => {
      const userItem = document.createElement('li');

      // Formata a data/hora de entrada para exibição amigável
      const dataHoraEntrada = new Date(veic.data_hora_entrada).toLocaleString();

      // Atualiza o conteúdo com a hora de entrada
      userItem.innerHTML = `<div id="placa-back-ground"><div id="placa-cor"><p>${veic.placa.toUpperCase()}</p></div></div> <p>${dataHoraEntrada}</p>  <p>${veic.tipo}</p>  <p>${veic.modelo.toUpperCase()}</p>`;
      userList.appendChild(userItem);

      // Botão de exclusão
      const deleteButton = document.createElement('button');
      deleteButton.innerHTML = '<img id="seta" src="assets/icons/arrow.png" alt="Remover">'; // Ícone de lixeira + texto
      deleteButton.classList.add('delete-button'); // Adiciona uma classe para estilização
      deleteButton.addEventListener('click', () => deleteVeic(veic.placa));

      // Adiciona o botão de exclusão ao item da lista
      userItem.appendChild(deleteButton);
    });
  } catch (error) {
    console.error('Erro ao carregar veículos:', error);
  }
}

// Função para carregar o valor total arrecadado e exibir na interface
async function loadTotalArrecadado() {
  try {
    const response = await ipcRenderer.invoke('get-total-arrecadado');
    if (response.success) {
      const totalArrecadado = response.totalArrecadado;
      const tot = document.getElementById('totalArrecadado');
      tot.innerHTML = `R$ ${totalArrecadado}`;
    } else {
      console.error(response.message);
      alert(response.message);
    }
  } catch (error) {
    console.error('Erro ao carregar total arrecadado:', error);
  }
}

// Chama a função `loadTotalArrecadado` ao inicializar a aplicação para exibir o valor total atual
document.addEventListener('DOMContentLoaded', loadTotalArrecadado);

// Atualiza o valor total arrecadado após a exclusão de um veículo
async function deleteVeic(placa) {
  try {
    const response = await ipcRenderer.invoke('delete-veic', placa);
    if (response.success) {
      console.log(response.message);
      alert(`Veículo removido com sucesso!\nTaxa a pagar: R$${response.taxa.toFixed(2)}\nTempo de permanência: ${response.tempoPermanencia}`);
      loadVeic(); // Atualiza a lista após a exclusão
      loadTotalArrecadado(); // Atualiza o valor total arrecadado
    } else {
      console.error(response.message);
      alert(response.message);
    }
  } catch (error) {
    console.error('Erro ao remover veículo:', error);
  }
}

document.getElementById('btn-cadastro').addEventListener('click', () => {
  location.reload(); // Atualiza a página
});