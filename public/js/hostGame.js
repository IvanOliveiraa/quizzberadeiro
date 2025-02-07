// Inicializa a conexão com o servidor usando socket.io
var socket = io();

// Obtém os parâmetros da URL (por exemplo, o id do jogo) usando jQuery.deparam
var params = jQuery.deparam(window.location.search); // Pega o id da URL

var timer;      // Variável que armazenará a referência do temporizador
var time = 20;  // Tempo inicial (em segundos) para cada pergunta

// Quando o host se conecta ao servidor
socket.on('connect', function () {
    // Informa ao servidor que essa conexão é do host, enviando os parâmetros da URL
    socket.emit('host-join-game', params);
});

// Se o servidor não encontrar o jogo com o id fornecido
socket.on('noGameFound', function () {
    // Redireciona o usuário para a página inicial de 'join game'
    window.location.href = '../../';
});

// Quando o servidor envia os dados da pergunta e das respostas
socket.on('gameQuestions', function (data) {
    // Atualiza o conteúdo da página com a pergunta e as alternativas
    document.getElementById('question').innerHTML = data.q1;
    document.getElementById('answer1').innerHTML = data.a1;
    document.getElementById('answer2').innerHTML = data.a2;
    document.getElementById('answer3').innerHTML = data.a3;
    document.getElementById('answer4').innerHTML = data.a4;

    // Armazena a resposta correta (embora não seja utilizada depois)
    var correctAnswer = data.correct;

    // Exibe o número de jogadores que responderam (inicialmente 0) e o total de jogadores no jogo
    document.getElementById('playersAnswered').innerHTML = "Respostas coletadas: 0/ " + data.playersInGame;

    // Inicia o temporizador para a pergunta
    updateTimer();
});

// Atualiza a exibição de quantos jogadores já responderam a pergunta
socket.on('updatePlayersAnswered', function (data) {
    document.getElementById('playersAnswered').innerHTML = "Respostas coletadas:" + data.playersAnswered + " / " + data.playersInGame;
});

// Quando o tempo da pergunta acaba ou a pergunta é finalizada
socket.on('questionOver', function (playerData, correct) {
    // Para o temporizador
    clearInterval(timer);

    // Variáveis para contar quantas respostas foram dadas para cada alternativa
    var answer1 = 0;
    var answer2 = 0;
    var answer3 = 0;
    var answer4 = 0;
    var total = 0;

    // Oculta os elementos que mostram o número de jogadores que responderam e o temporizador
    document.getElementById('playersAnswered').style.display = "none";
    document.getElementById('timerText').style.display = "none";

    // Realça a resposta correta e aplica um filtro de escala de cinza nas demais
    if (correct == 1) {
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer1').innerHTML;
        // Adiciona um ícone de check (✓) antes da resposta correta
        document.getElementById('answer1').innerHTML = "&#10004" + " " + current;
    } else if (correct == 2) {
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer2').innerHTML;
        document.getElementById('answer2').innerHTML = "&#10004" + " " + current;
    } else if (correct == 3) {
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer3').innerHTML;
        document.getElementById('answer3').innerHTML = "&#10004" + " " + current;
    } else if (correct == 4) {
        document.getElementById('answer1').style.filter = "grayscale(50%)";
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer4').innerHTML;
        document.getElementById('answer4').innerHTML = "&#10004" + " " + current;
    }

    // Percorre os dados dos jogadores para contabilizar as respostas de cada alternativa
    for (var i = 0; i < playerData.length; i++) {
        if (playerData[i].gameData.answer == 1) {
            answer1 += 1;
        } else if (playerData[i].gameData.answer == 2) {
            answer2 += 1;
        } else if (playerData[i].gameData.answer == 3) {
            answer3 += 1;
        } else if (playerData[i].gameData.answer == 4) {
            answer4 += 1;
        }
        total += 1;  // Conta o total de respostas
    }

    // Converte as contagens em porcentagens para exibição do gráfico
    answer1 = answer1 / total * 100;
    answer2 = answer2 / total * 100;
    answer3 = answer3 / total * 100;
    answer4 = answer4 / total * 100;

    // Exibe os elementos gráficos (barras) que mostram a porcentagem de respostas
    document.getElementById('square1').style.display = "inline-block";
    document.getElementById('square2').style.display = "inline-block";
    document.getElementById('square3').style.display = "inline-block";
    document.getElementById('square4').style.display = "inline-block";

    // Define a altura de cada barra de acordo com a porcentagem calculada
    document.getElementById('square1').style.height = answer1 + "px";
    document.getElementById('square2').style.height = answer2 + "px";
    document.getElementById('square3').style.height = answer3 + "px";
    document.getElementById('square4').style.height = answer4 + "px";

    // Exibe o botão para avançar para a próxima pergunta
    document.getElementById('btn-cover').style.display = "block";
    document.getElementById('nextQButton').style.display = "block";
});

// Função que é chamada quando o host clica no botão para a próxima pergunta
function nextQuestion() {
    // Oculta o botão de próxima pergunta e as barras de porcentagem
    document.getElementById('nextQButton').style.display = "none";
    document.getElementById('square1').style.display = "none";
    document.getElementById('square2').style.display = "none";
    document.getElementById('square3').style.display = "none";
    document.getElementById('square4').style.display = "none";

    // Remove os filtros aplicados às respostas (volta à exibição normal)
    document.getElementById('answer1').style.filter = "none";
    document.getElementById('answer2').style.filter = "none";
    document.getElementById('answer3').style.filter = "none";
    document.getElementById('answer4').style.filter = "none";

    // Exibe novamente os elementos de contagem de respostas e o temporizador
    document.getElementById('playersAnswered').style.display = "block";
    document.getElementById('timerText').style.display = "block";

    // Reinicia o contador visual para 20 segundos
    document.getElementById('num').innerHTML = " 20";

    // Informa ao servidor que deve ser iniciada a próxima pergunta
    socket.emit('nextQuestion');
}

// Função que inicia e atualiza o temporizador para a pergunta
function updateTimer() {
    time = 20; // Define o tempo para 20 segundos
    timer = setInterval(function () {
        time -= 1;  // Decrementa o tempo a cada segundo
        document.getElementById('num').textContent = " " + time;  // Atualiza a exibição do tempo
        if (time == 0) {
            // Quando o tempo chega a zero, emite o evento 'timeUp' para o servidor
            socket.emit('timeUp');
        }
    }, 1000); // Intervalo de 1 segundo (1000 milissegundos)
}

// Evento que indica que o jogo acabou
socket.on('GameOver', function (data) {
    // Oculta o botão de próxima pergunta, as barras e as alternativas
    document.getElementById('btn-cover').style.display = "none";
    document.getElementById('nextQButton').style.display = "none";
    document.getElementById('square1').style.display = "none";
    document.getElementById('square2').style.display = "none";
    document.getElementById('square3').style.display = "none";
    document.getElementById('square4').style.display = "none";

    document.getElementById('answer1').style.display = "none";
    document.getElementById('answer2').style.display = "none";
    document.getElementById('answer3').style.display = "none";
    document.getElementById('answer4').style.display = "none";

    // Limpa o texto do temporizador e exibe a mensagem de Game Over na pergunta
    document.getElementById('timerText').innerHTML = "";
    document.getElementById('question').innerHTML = "A trilha chegou ao fim!";
    document.getElementById('playersAnswered').innerHTML = "";

    // Exibe os elementos que mostrarão os vencedores
    document.getElementById('winner1').style.display = "block";
    document.getElementById('winner2').style.display = "block";
    document.getElementById('winner3').style.display = "block";
    document.getElementById('winner4').style.display = "block";
    document.getElementById('winner5').style.display = "block";
    document.getElementById('winnerTitle').style.display = "block";

    // Atualiza a lista de vencedores com os dados recebidos do servidor
    document.getElementById('winner1').innerHTML = "1. " + data.num1;
    document.getElementById('winner2').innerHTML = "2. " + data.num2;
    document.getElementById('winner3').innerHTML = "3. " + data.num3;
    document.getElementById('winner4').innerHTML = "4. " + data.num4;
    document.getElementById('winner5').innerHTML = "5. " + data.num5;
});

// Evento que responde à requisição de tempo por parte de um jogador
socket.on('getTime', function (player) {
    // Envia ao servidor o tempo atual, associado ao jogador que solicitou
    socket.emit('time', {
        player: player,
        time: time
    });
});
