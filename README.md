# Quiz Beradeiro

Quiz Beradeiro é uma aplicação web interativa de perguntas e respostas inspirada no Kahoot, desenvolvida para criar e hospedar quizzes em tempo real. A aplicação permite que um anfitrião crie salas de jogos onde os participantes podem se conectar usando um código PIN e competir respondendo perguntas.

## Funcionalidades

### Para o Anfitrião (Host)

- **Criação de Quizzes**: Interface intuitiva para criar quizzes personalizados com múltiplas perguntas e respostas.
- **Hospedagem de Jogos**: Capacidade de iniciar uma sala de jogo com um código PIN único para que os jogadores possam se conectar.
- **Controle do Jogo**: O anfitrião controla o fluxo do jogo, avançando para as próximas perguntas.
- **Visualização em Tempo Real**: Acompanhamento em tempo real de quantos jogadores responderam e estatísticas de respostas.
- **Resultados e Ranking**: Ao final do jogo, exibição do ranking dos 5 melhores jogadores.

### Para os Jogadores

- **Entrada Fácil**: Os jogadores podem entrar em um jogo usando o código PIN fornecido pelo anfitrião.
- **Interface Responsiva**: Interface simples e intuitiva para responder às perguntas.
- **Feedback Imediato**: Os jogadores recebem feedback imediato sobre suas respostas.
- **Pontuação Baseada em Velocidade**: Sistema de pontuação que recompensa respostas corretas e rápidas.
- **Acompanhamento de Progresso**: Os jogadores podem ver sua pontuação e posição no ranking durante o jogo.

## Tecnologias Utilizadas

- **Frontend**: HTML, CSS, JavaScript
- **Backend**: Node.js, Express.js
- **Comunicação em Tempo Real**: Socket.IO
- **Banco de Dados**: MongoDB

## Estrutura do Projeto

quizzberadeiro/
├── public/ # Arquivos do cliente
│ ├── css/ # Estilos CSS
│ ├── img/ # Imagens e recursos visuais
│ ├── js/ # Scripts JavaScript do cliente
│ │ └── libs/ # Bibliotecas JavaScript
│ ├── create/ # Interface de criação de quizzes
│ ├── host/ # Interface do anfitrião
│ └── player/ # Interface do jogador
├── server/ # Código do servidor
│ ├── server.js # Arquivo principal do servidor
│ └── utils/ # Utilitários do servidor
│ ├── liveGames.js # Gerenciamento de jogos ativos
│ └── players.js # Gerenciamento de jogadores
├── package.json # Dependências do projeto
└── README.md # Documentação do projeto

## Como Funciona

1. **Criação de Quiz**:

   - O anfitrião acessa a página de criação de quiz
   - Adiciona título, perguntas, alternativas e indica as respostas corretas
   - O quiz é salvo no banco de dados MongoDB

2. **Iniciando um Jogo**:

   - O anfitrião seleciona um quiz e cria uma sala
   - Um código PIN é gerado para a sala
   - O anfitrião compartilha o PIN com os jogadores

3. **Entrada dos Jogadores**:

   - Os jogadores acessam a página inicial
   - Inserem seu nome e o código PIN da sala
   - Entram na sala de espera até que o anfitrião inicie o jogo

4. **Durante o Jogo**:

   - O anfitrião controla o fluxo do jogo, exibindo as perguntas
   - Cada pergunta tem um temporizador de 20 segundos
   - Os jogadores selecionam suas respostas
   - Pontos são atribuídos com base na correção e velocidade da resposta
   - Após cada pergunta, estatísticas são mostradas ao anfitrião

5. **Fim do Jogo**:
   - Após todas as perguntas, o ranking final é exibido
   - Os 5 melhores jogadores são destacados

## Como Executar o Projeto

1. Certifique-se de ter o Node.js instalado
2. Clone o repositório
3. Instale as dependências: `npm install`
4. Configure a conexão com o MongoDB no arquivo `.env`
5. Inicie o servidor: ` node server/server.js`

6. Acesse a aplicação em: `http://localhost:3001`
