const app = require('express')()
const http = require('http').createServer(app)
const io = require('socket.io')(http)
var port = process.env.PORT || 4000;

var total = 0
var voto_sim = 0
var voto_nao = 0
var voto_abster = 0

var propostaAntiga = ''
var propostaNova = ''
var votados = []
var sugestoes = []

let votacaoIniciada = 0
let multiplaEscolha = false

let numUsers = 0;

io.on('connection', socket => {
  let addedUser = false;

  socket.emit('total', total, votados)
  socket.emit('voto_sim', voto_sim)
  socket.emit('voto_nao', voto_nao)
  socket.emit('voto_abster', voto_abster)
  socket.emit('propostaAntiga', propostaAntiga)
  socket.emit('propostaNova', propostaNova)
  socket.emit('sugestoes', sugestoes)
  socket.emit('multipla_escolha', multiplaEscolha)
  io.emit('qtd_pessoas', numUsers)

  if(votacaoIniciada === 1){
    socket.emit('iniciarVotacao')
  }

  socket.on('multipla_escolha_admin', () => {
    multiplaEscolha = !multiplaEscolha
    io.emit('multipla_escolha', multiplaEscolha)
  })

  socket.on('novo_participante', () => {
    if (addedUser) return;

    ++numUsers;
    addedUser = true;
    io.emit('qtd_pessoas', numUsers);
  });

  socket.on('botao_sim', (usuario) => {
    if (verificaVoto(usuario)) {
      votados.push(usuario);
      total += 1;
      voto_sim += 1;
      io.emit('voto_sim', voto_sim)
      io.emit('total', total, votados)
    }
  })

  socket.on('botao_nao', (usuario) => {
    if (verificaVoto(usuario)) {
      votados.push(usuario);
      total += 1;
      voto_nao += 1;
      io.emit('voto_nao', voto_nao)
      io.emit('total', total, votados)
    }
  })

  socket.on('botao_abster', (usuario) => {
    if (verificaVoto(usuario)) {
      votados.push(usuario);
      total += 1;
      voto_abster += 1;
      io.emit('voto_abster', voto_abster)
      io.emit('total', total, votados)
    }
  })


  socket.on('limpar', () => {
    total = 0;
    voto_sim = 0
    voto_nao = 0
    voto_abster = 0
    votados = []
    io.emit('limpar', total)
  })


  socket.on('propostaAntiga', (evt) => {
    propostaAntiga = evt
    socket.broadcast.emit('propostaAntiga', evt)
  })

  socket.on('propostaNova', (evt) => {
    propostaNova = evt
    socket.broadcast.emit('propostaNova', evt)
  })

  socket.on('addSugestao', (texto) => {
    sugestoes.push(texto)
    io.emit('sugestoes', sugestoes)
  })

  socket.on('removerSugestao', (posicao) => {
    sugestoes.splice(posicao, 1)
    io.emit('sugestoes', sugestoes)
  })

  socket.on('iniciarVotacao', () => {
    votacaoIniciada = 1
    io.emit('iniciarVotacao')
  })

  socket.on('encerrarVotacao', () => {
    votacaoIniciada = 0
    io.emit('encerrarVotacao')
  })

  
  socket.on('disconnect', () => {
    if (addedUser) {
      --numUsers;

      io.emit('qtd_pessoas', numUsers);
    }
  });
})



http.listen(port, function () {
  console.log('listening on port 4000')
})

function verificaVoto(usuario) {
  // console.log(votados)
  // console.log(votados.length)

  for (let i = 0; i < votados.length; i++) {
    if (votados[i].nome === usuario.nome && votados[i].PET === usuario.PET) {
      console.log("Não é permitido mais de um voto por pessoa")
      return 0;
    }
  }
  return 1;
}
