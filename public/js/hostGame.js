// Inicializa a conexão com o servidor usando socket.io
var socket = io();

// Obtém os parâmetros da URL (por exemplo, o id do jogo) usando jQuery.deparam
var params = jQuery.deparam(window.location.search); // Pega o id da URL

var timer;      // Variável que armazenará a referência do temporizador
var time = 20;  // Tempo inicial (em segundos) para cada pergunta
var showState = 'showingQuestion'; // Estado para controlar exibição: 'showingQuestion', 'showingAnswer', 'showingRanking'
var playerDataGlobal = []; // Guarda os dados dos jogadores para uso entre estados
var currentCorrectAnswer = 0; // Guarda a resposta correta para exibir na tela de resposta
var currentExplanation = ""; // Guarda o explanation da pergunta atual

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
    currentExplanation = data.explanation || "";

    // Oculta o card de explicação
    document.getElementById('explanationCard').style.display = 'none';
    document.getElementById('explanation').innerHTML = "";

    // Atualiza o número da questão e total de questões
    if (data.currentQuestionNumber && data.totalQuestions) {
        document.getElementById('questionNum').innerHTML = "Questão " + data.currentQuestionNumber + " / " + data.totalQuestions;
    }

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
    document.getElementById('playersAnswered').style.display = "none";

    // Exibe elementos de resposta e temporizador
    document.getElementById('playersAnswered').style.display = "none";
    document.getElementById('timerText').style.display = "none";

    // Oculta o botão avançar e as barras de porcentagem
    document.getElementById('btn-cover').style.display = "none";
    document.getElementById('nextQButton').style.display = "none";

    // Reset e oculta as barras até todos os resultados serem coletados
    ['square1', 'square2', 'square3', 'square4'].forEach(function (id) {
        var el = document.getElementById(id);
        el.style.display = "none";
        el.style.height = "0px";
    });

    updateTimer();
});

// Atualiza a exibição de quantos jogadores já responderam a pergunta
socket.on('updatePlayersAnswered', function (data) {
    document.getElementById('playersAnswered').style.display = "none";
});

// Quando o tempo da pergunta acaba ou a pergunta é finalizada
socket.on('questionOver', function (playerData, correct) {
    console.log('questionOver event triggered', playerData, correct);
    clearInterval(timer);
    playerDataGlobal = playerData;
    currentCorrectAnswer = correct;

    showState = 'showingAnswer';

    // Exibe resposta correta e dados
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

    // Inicializa contadores para cada resposta e total
    var answer1 = 0, answer2 = 0, answer3 = 0, answer4 = 0, total = 0;

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
    // Captura número bruto de respostas para exibir dentro das barras
    var raw1 = answer1, raw2 = answer2, raw3 = answer3, raw4 = answer4;

    // Ajusta as barras a um máximo de 200px para melhor visualização
    if (total > 0) {
        var barMax = 200;
        answer1 = (answer1 / total) * barMax;
        answer2 = (answer2 / total) * barMax;
        answer3 = (answer3 / total) * barMax;
        answer4 = (answer4 / total) * barMax;
    } else {
        answer1 = 0;
        answer2 = 0;
        answer3 = 0;
        answer4 = 0;
    }

    // Exibe os elementos gráficos (barras)
    document.getElementById('square1').style.display = "inline-block";
    document.getElementById('square2').style.display = "inline-block";
    document.getElementById('square3').style.display = "inline-block";
    document.getElementById('square4').style.display = "inline-block";

    // Define a altura de cada barra em pixels
    document.getElementById('square1').style.height = answer1 + "px";
    document.getElementById('square1').style.width = "50px";
    document.getElementById('square2').style.height = answer2 + "px";
    document.getElementById('square2').style.width = "50px";
    document.getElementById('square3').style.height = answer3 + "px";
    document.getElementById('square3').style.width = "50px";
    document.getElementById('square4').style.height = answer4 + "px";
    document.getElementById('square4').style.width = "50px";

    // Exibe número bruto dentro das barras
    document.getElementById('square1').textContent = raw1;
    document.getElementById('square2').textContent = raw2;
    document.getElementById('square3').textContent = raw3;
    document.getElementById('square4').textContent = raw4;

    // Mostra o card de explicação se houver conteúdo
    if (currentExplanation && currentExplanation.trim() !== "") {
        document.getElementById('explanationCard').style.display = 'block';
        document.getElementById('explanation').innerHTML = currentExplanation;
    } else {
        document.getElementById('explanationCard').style.display = 'none';
    }

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

        // Oculta o card de explicação ao mostrar ranking
        document.getElementById('explanationCard').style.display = 'none';

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

        // Limpa o explanation ao exibir nova pergunta
        document.getElementById('explanation').innerHTML = "";

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
    document.getElementById('questionNum').innerHTML = "";

    // Clear previous ranking if any
    var cardQuestion = document.querySelector('.card-question');
    cardQuestion.innerHTML = '<h1 style="text-align:center; margin-bottom: 20px;">A trilha chegou ao fim!</h1><h3>Ranking Final</h3><ol style="padding-left: 20px;"></ol>';
    var ol = cardQuestion.querySelector('ol');
    var winners = [data.num1, data.num2, data.num3, data.num4, data.num5];
    winners.forEach(function (winner, idx) {
        if (winner && winner.trim() !== "") {
            var li = document.createElement('li');
            li.textContent = (idx + 1) + '. ' + winner;
            ol.appendChild(li);
        }
    });

    // Create and append the "Voltar para o Início" button
    var backButton = document.createElement('button');
    backButton.textContent = "Voltar para o Início";
    backButton.style.backgroundColor = "#8B4513"; // brown color
    backButton.style.color = "white";
    backButton.style.border = "none";
    backButton.style.padding = "10px 20px";
    backButton.style.fontSize = "16px";
    backButton.style.borderRadius = "5px";
    backButton.style.cursor = "pointer";
    backButton.style.display = "block";
    backButton.style.margin = "20px auto 0 auto";
    backButton.onclick = function () {
        window.location.href = "../../"; // Adjust path as needed to go back to home
    };
    cardQuestion.appendChild(backButton);

    // Hide next question button and cover
    document.getElementById('btn-cover').style.display = "none";
    document.getElementById('nextQButton').style.display = "none";
});

// Evento que responde à requisição de tempo por parte de um jogador
socket.on('getTime', function (player) {
    socket.emit('time', {
        player: player,
        time: time
    });
});
