var socket = io();
var playerAnswered = false;
var correct = false;
var name;
var score = 0;

var params = jQuery.deparam(window.location.search); //Gets the id from url

socket.on('connect', function () {
    //Tell server that it is host connection from game view
    socket.emit('player-join-game', params);

    document.getElementById('answer1').style.visibility = "visible";
    document.getElementById('answer2').style.visibility = "visible";
    document.getElementById('answer3').style.visibility = "visible";
    document.getElementById('answer4').style.visibility = "visible";
});

socket.on('noGameFound', function () {
    window.location.href = '../../';//Redirect user to 'join game' page 
});

function answerSubmitted(num) {
    if (playerAnswered == false) {
        playerAnswered = true;

        socket.emit('playerAnswer', num);//Sends player answer to server

        //Hiding buttons from user
        document.getElementById('answer1').style.visibility = "hidden";
        document.getElementById('answer2').style.visibility = "hidden";
        document.getElementById('answer3').style.visibility = "hidden";
        document.getElementById('answer4').style.visibility = "hidden";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Recebido! Aguarde os colegas...";

    }
}

//Get results on last question
socket.on('answerResult', function (data) {
    if (data == true) {
        correct = true;
    }
});

socket.on('questionOver', function (playerData) {
    if (correct == true) {
        document.getElementById('message').style.color = "#b0f8b2";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Você Acertou!";
    } else {
        document.getElementById('message').style.color = "#ec957f";
        document.getElementById('message').style.display = "block";
        document.getElementById('message').innerHTML = "Você Errou!";
    }
    document.getElementById('answer1').style.visibility = "hidden";
    document.getElementById('answer2').style.visibility = "hidden";
    document.getElementById('answer3').style.visibility = "hidden";
    document.getElementById('answer4').style.visibility = "hidden";
    socket.emit('getScore');

    // Exibir ranking após cada rodada
    if (Array.isArray(playerData)) {
        // Ordena por score decrescente
        playerData.sort(function (a, b) {
            return b.gameData.score - a.gameData.score;
        });

        // Monta o HTML do ranking
        var rankingList = document.getElementById('rankingList');
        rankingList.innerHTML = '';
        playerData.forEach(function (player, idx) {
            var li = document.createElement('li');
            li.textContent = (idx + 1) + '. ' + player.name + ': ' + player.gameData.score + ' pontos';
            // Destaca o próprio jogador
            if (player.playerId === socket.id) {
                li.style.fontWeight = 'bold';
                li.style.color = '#1a7f37';
            }
            rankingList.appendChild(li);
        });

        // Exibe o modal
        var rankingModal = document.getElementById('rankingModal');
        rankingModal.style.display = 'block';

        // Esconde o modal após 5 segundos
        setTimeout(function () {
            rankingModal.style.display = 'none';
        }, 5000);
    }
});

socket.on('newScore', function (data) {
    document.getElementById('scoreText').innerHTML = "Score: " + data;
});

socket.on('nextQuestionPlayer', function () {
    correct = false;
    playerAnswered = false;

    document.getElementById('answer1').style.visibility = "visible";
    document.getElementById('answer2').style.visibility = "visible";
    document.getElementById('answer3').style.visibility = "visible";
    document.getElementById('answer4').style.visibility = "visible";
    document.getElementById('message').style.display = "none";
    document.getElementById('message').style.color = "#fbecd7";

});

socket.on('hostDisconnect', function () {
    window.location.href = "../../";
});

socket.on('playerGameData', function (data) {
    for (var i = 0; i < data.length; i++) {
        if (data[i].playerId == socket.id) {
            document.getElementById('nameText').innerHTML = "Nome: " + data[i].name;
            document.getElementById('scoreText').innerHTML = "Pontuação: " + data[i].gameData.score;
        }
    }
});

socket.on('GameOver', function () {
    document.getElementById('answer1').style.visibility = "hidden";
    document.getElementById('answer2').style.visibility = "hidden";
    document.getElementById('answer3').style.visibility = "hidden";
    document.getElementById('answer4').style.visibility = "hidden";
    document.getElementById('message').style.display = "block";
    document.getElementById('message').innerHTML = "A Trilha chegou ao fim...";
});
