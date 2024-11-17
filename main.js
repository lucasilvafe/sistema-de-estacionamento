// main.js
const { app, BrowserWindow, ipcMain } = require('electron');
const client = require('./db'); // Importa o cliente PostgreSQL


function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    }
  });

  win.loadFile('index.html');
}


// Função para calcular o valor total arrecadado
ipcMain.handle('get-total-arrecadado', async () => {
  try {
    const res = await client.query('SELECT SUM(taxa) AS total_arrecadado FROM historico_taxas');
    const totalArrecadado = res.rows[0].total_arrecadado || 0;
    return { success: true, totalArrecadado };
  } catch (err) {
    console.error('Erro ao calcular total arrecadado:', err);
    return { success: false, message: 'Erro ao calcular total arrecadado' };
  }
});

// Exemplo de inserção no banco de dados
ipcMain.handle('insert-veic', async (event, userData) => {
  const { placa, tipo, modelo } = userData;

  try {
    // Executa a query de inserção com a data e hora de entrada
    await client.query('INSERT INTO veiculo (placa, tipo, modelo, data_hora_entrada) VALUES ($1, $2, $3, NOW())', [placa, tipo, modelo]);
    return { success: true, message: 'Veículo inserido com sucesso!' };
  } catch (err) {
    console.error('Erro ao inserir veículo:', err);
    return { success: false, message: 'Erro ao inserir veículo' };
  }
});


// Função para buscar todos os usuários
ipcMain.handle('get-veic', async () => {
  try {
    const res = await client.query('SELECT * FROM veiculo'); // Query para obter todos os usuários
    return res.rows; // Retorna os dados dos usuários
  } catch (err) {
    console.error('Erro ao buscar usuários:', err);
    return []; // Retorna um array vazio em caso de erro
  }
});

ipcMain.handle('delete-veic', async (event, placa) => {
  try {
    const res = await client.query('SELECT data_hora_entrada FROM veiculo WHERE placa = $1', [placa]);
    if (res.rows.length === 0) {
      return { success: false, message: 'Veículo não encontrado' };
    }

    const dataHoraEntrada = new Date(res.rows[0].data_hora_entrada);
    const dataHoraSaida = new Date();

    const diffMs = dataHoraSaida - dataHoraEntrada;
    const diffHoras = Math.floor(diffMs / (9000)); //Esse valor é para afins de testes. O valor real é: (1000 * 60 * 60)
    const diffMinutos = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSegundos = Math.floor((diffMs % (1000 * 60)) / 1000);
    const taxa = diffHoras * 2.50;
    const tempoPermanencia = `${diffHoras}h ${diffMinutos}m ${diffSegundos}s`;

    // Registra a taxa no histórico
    await client.query('INSERT INTO historico_taxas (placa, taxa, data_hora_saida) VALUES ($1, $2, $3)', [placa, taxa, dataHoraSaida]);

    // Exclui o veículo do banco
    await client.query('DELETE FROM veiculo WHERE placa = $1', [placa]);
    return { 
      success: true, 
      message: `Veículo removido com sucesso!`,
      taxa,
      tempoPermanencia
    };
  } catch (err) {
    console.error('Erro ao remover veículo:', err);
    return { success: false, message: 'Erro ao remover veículo' };
  }
});



ipcMain.handle('dark-mode:toggle', () => {
  if (nativeTheme.shouldUseDarkColors) {
    nativeTheme.themeSource = 'light'
  } else {
    nativeTheme.themeSource = 'dark'
  }
  return nativeTheme.shouldUseDarkColors
})


app.whenReady().then(createWindow);


app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
