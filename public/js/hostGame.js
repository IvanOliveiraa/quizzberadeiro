// Inicializa a conexão com o servidor usando socket.io
var socket = io();

// Obtém os parâmetros da URL (por exemplo, o id do jogo) usando jQuery.deparam
var params = jQuery.deparam(window.location.search); // Pega o id da URL

var timer;      // Variável que armazenará a referência do temporizador
var time = 20;  // Tempo inicial (em segundos) para cada pergunta
var showState = 'showingQuestion'; // Estado para controlar exibição: 'showingQuestion', 'showingAnswer', 'showingRanking'
var playerDataGlobal = []; // Guarda os dados dos jogadores para uso entre estados
var currentCorrectAnswer = 0; // Guarda a resposta correta para exibir na tela de resposta

// Quando o host se conecta ao servidor
socket.on('connect', function () {
    socket.emit('host-join-game', params);
});

// Se o servidor não encontrar o jogo com o id fornecido
socket.on('noGameFound', function () {
    window.location.href = '../../';
});

// Quando o servidor envia os dados da pergunta e das respostas
socket.on('gameQuestions', function (data) {
    showState = 'showingQuestion';
    playerDataGlobal = [];
    currentCorrectAnswer = 0;

    // Restaura a interface para mostrar pergunta e respostas
    var cardQuestion = document.querySelector('.card-question');
    cardQuestion.innerHTML = '<h2 id="question"></h2>';

    document.getElementById('question').style.display = 'block';
    document.getElementById('answer1').style.display = 'block';
    document.getElementById('answer2').style.display = 'block';
    document.getElementById('answer3').style.display = 'block';
    document.getElementById('answer4').style.display = 'block';

    // Remove o ranking se existir
    var rankingDiv = document.getElementById('rankingContainer');
    if (rankingDiv) {
        rankingDiv.remove();
    }

    // Atualiza o conteúdo da página com a pergunta e as alternativas
    document.getElementById('question').innerHTML = data.q1;
    document.getElementById('answer1').innerHTML = data.a1;
    document.getElementById('answer2').innerHTML = data.a2;
    document.getElementById('answer3').innerHTML = data.a3;
    document.getElementById('answer4').innerHTML = data.a4;

    // Exibe o número de jogadores que responderam e o total
    document.getElementById('playersAnswered').innerHTML = "Respostas coletadas: 0/ " + data.playersInGame;

    // Exibe elementos de resposta e temporizador
    document.getElementById('playersAnswered').style.display = "block";
    document.getElementById('timerText').style.display = "block";

    // Oculta o botão avançar e as barras de porcentagem
    document.getElementById('btn-cover').style.display = "none";
    document.getElementById('nextQButton').style.display = "none";
    document.getElementById('square1').style.display = "none";
    document.getElementById('square2').style.display = "none";
    document.getElementById('square3').style.display = "none";
    document.getElementById('square4').style.display = "none";

    updateTimer();
});

// Atualiza a exibição de quantos jogadores já responderam a pergunta
socket.on('updatePlayersAnswered', function (data) {
    document.getElementById('playersAnswered').innerHTML = "Respostas coletadas:" + data.playersAnswered + " / " + data.playersInGame;
});

// Quando o tempo da pergunta acaba ou a pergunta é finalizada
socket.on('questionOver', function (playerData, correct) {
    clearInterval(timer);
    playerDataGlobal = playerData;
    currentCorrectAnswer = correct;

    showState = 'showingAnswer';

    // Exibe resposta correta e dados
    document.getElementById('playersAnswered').style.display = "none";
    document.getElementById('timerText').style.display = "none";

    // Realça a resposta correta
    if (correct == 1) {
        document.getElementById('answer2').style.filter = "grayscale(50%)";
        document.getElementById('answer3').style.filter = "grayscale(50%)";
        document.getElementById('answer4').style.filter = "grayscale(50%)";
        var current = document.getElementById('answer1').innerHTML;
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

    // Exibe as barras de porcentagem
    document.getElementById('square1').style.display = "inline-block";
    document.getElementById('square2').style.display = "inline-block";
    document.getElementById('square3').style.display = "inline-block";
    document.getElementById('square4').style.display = "inline-block";

    // Exibe o botão avançar
    document.getElementById('btn-cover').style.display = "block";
    document.getElementById('nextQButton').style.display = "inline-block";
});

// Função que é chamada quando o host clica no botão para a próxima pergunta
function nextQuestion() {
    if (showState === 'showingAnswer') {
        showState = 'showingRanking';

        // Oculta perguntas, respostas e barras
        document.getElementById('question').style.display = 'none';
        document.getElementById('answer1').style.display = 'none';
        document.getElementById('answer2').style.display = 'none';
        document.getElementById('answer3').style.display = 'none';
        document.getElementById('answer4').style.display = 'none';
        document.getElementById('square1').style.display = "none";
        document.getElementById('square2').style.display = "none";
        document.getElementById('square3').style.display = "none";
        document.getElementById('square4').style.display = "none";

        // Remove filtros das respostas
        document.getElementById('answer1').style.filter = "none";
        document.getElementById('answer2').style.filter = "none";
        document.getElementById('answer3').style.filter = "none";
        document.getElementById('answer4').style.filter = "none";

        // Monta e mostra o ranking dentro do card-question
        var cardQuestion = document.querySelector('.card-question');
        cardQuestion.innerHTML = '<h3>Ranking após rodada</h3><ol style="padding-left: 20px;"></ol>';
        var ol = cardQuestion.querySelector('ol');
        playerDataGlobal.sort(function (a, b) {
            return b.gameData.score - a.gameData.score;
        });
        playerDataGlobal.forEach(function (player, idx) {
            var li = document.createElement('li');
            li.textContent = (idx + 1) + '. ' + player.name + ': ' + player.gameData.score + ' pontos';
            ol.appendChild(li);
        });

        // Atualiza botão avançar
        document.getElementById('btn-cover').style.display = 'block';
        document.getElementById('nextQButton').style.display = 'inline-block';

    } else if (showState === 'showingRanking') {
        showState = 'showingQuestion';

        // Remove ranking
        var cardQuestion = document.querySelector('.card-question');
        cardQuestion.innerHTML = '';

        // Exibe novamente elementos de contagem e temporizador
        document.getElementById('playersAnswered').style.display = "block";
        document.getElementById('timerText').style.display = "block";

        // Reinicia contador visual para 20 segundos
        document.getElementById('num').innerHTML = " 20";

        // Informa ao servidor para próxima pergunta
        socket.emit('nextQuestion');
    }
}

// Função que inicia e atualiza o temporizador para a pergunta
function updateTimer() {
    time = 20;
    timer = setInterval(function () {
        time -= 1;
        document.getElementById('num').textContent = " " + time;
        if (time == 0) {
            socket.emit('timeUp');
        }
    }, 1000);
}

// Evento que indica que o jogo acabou
socket.on('GameOver', function (data) {
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

    document.getElementById('timerText').innerHTML = "";
    document.getElementById('question').innerHTML = "A trilha chegou ao fim!";
    document.getElementById('playersAnswered').innerHTML = "";

    document.getElementById('winner1').style.display = "block";
    document.getElementById('winner2').style.display = "block";
    document.getElementById('winner3').style.display = "block";
    document.getElementById('winner4').style.display = "block";
    document.getElementById('winner5').style.display = "block";
    document.getElementById('winnerTitle').style.display = "block";

    document.getElementById('winner1').innerHTML = "1. " + data.num1;
    document.getElementById('winner2').innerHTML = "2. " + data.num2;
    document.getElementById('winner3').innerHTML = "3. " + data.num3;
    document.getElementById('winner4').innerHTML = "4. " + data.num4;
    document.getElementById('winner5').innerHTML = "5. " + data.num5;
});

// Evento que responde à requisição de tempo por parte de um jogador
socket.on('getTime', function (player) {
    socket.emit('time', {
        player: player,
        time: time
    });
});
