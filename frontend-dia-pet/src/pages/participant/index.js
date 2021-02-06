import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { Chart } from "react-google-charts";
import Swal from 'sweetalert2'
import { AiFillEdit } from "react-icons/ai";
import Footer from '../../Footer/footer';
import '../../styles.css'


// Usando o backend do heroku
const socket = io.connect('https://backend-dia-pet.herokuapp.com/')

// Se for rodar o servidor localmente 
// const socket = io.connect('http://localhost:4000')

function Participant() {
  const [nome, setNome] = useState("")
  const [PET, setPET] = useState("")
  const [propostaAntiga, setPropostaAntiga] = useState("")
  const [propostaNova, setPropostaNova] = useState("")
  const [sim, setSim] = useState(0)
  const [nao, setNao] = useState(0)
  const [abstencao, setAbstencao] = useState(0)
  const [total, setTotal] = useState(0)
  const [multiSugestoes, setMultiSugestoes] = useState(false);
  const [data, setData] = useState([
    ['Votos', 'Quantidade'],
    ['SIM', sim],
    ['NÃO', nao],
    ['ABSTENÇÃO', abstencao],
  ]);

  let count = 0;


  useEffect(() => {
    if (multiSugestoes)
      setData([
        ['Votos', 'Quantidade'],
        ['1', sim],
        ['2', nao],
        ['3', abstencao],
      ]);
    else
      setData([
        ['Votos', 'Quantidade'],
        ['SIM', sim],
        ['NÃO', nao],
        ['ABSTENÇÃO', abstencao],
      ])

  }, [sim, nao, abstencao, multiSugestoes])

  useEffect(() => {
    const nomeUsuario = localStorage.getItem("NOME")
    const petUsuario = localStorage.getItem("PET")

    if (nomeUsuario === null || petUsuario === null) {
      dadosUsuario();
    }
    else {
      setNome(nomeUsuario)
      setPET(petUsuario)
    }

    if (count === 0) {
      socket.emit('novo_participante')
      count++;
    }
  }, [])


  useEffect(() => {
    socket.on('voto_sim', (num) => {
      setSim(num)
    })

    socket.on('voto_nao', (num) => {
      setNao(num)
    })

    socket.on('voto_abster', (num) => {
      setAbstencao(num)
    })

    socket.on('total', (num) => {
      setTotal(num)
    })

    socket.on('propostaAntiga', (txt) => {
      setPropostaAntiga(txt)
    })

    socket.on('propostaNova', (txt) => {
      setPropostaNova(txt)
    })

    socket.on('multipla_escolha', (state) => {
      setMultiSugestoes(state);
    })


    socket.on('iniciarVotacao', () => {
      (async () => {
        const nomeUsuario = localStorage.getItem("NOME")
        const petUsuario = localStorage.getItem("PET")

        if (nomeUsuario === null || petUsuario === null) {
          await dadosUsuario();
          votacaoIniciada()
        }
        else {
          votacaoIniciada()
        }
      })()
    })

    socket.on('encerrarVotacao', () => {
      // Swal.close()

      Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Votação encerrada!',
        showConfirmButton: false,
        timer: 1500
      })
    })

    socket.on('limpar', (num) => {
      setSim(num)
      setNao(num)
      setAbstencao(num)
      setTotal(num)
    })
  })

  function botao_sim() {
    socket.emit('botao_sim', { nome, PET })
  }

  function botao_nao() {
    socket.emit('botao_nao', { nome, PET })
  }

  function botao_abster() {
    socket.emit('botao_abster', { nome, PET })
  }

  function add_proposta_antiga(txt) {
    setPropostaAntiga(txt)
    socket.emit('propostaAntiga', txt)
  }

  function add_proposta_nova(txt) {
    setPropostaNova(txt)
    socket.emit('propostaNova', txt)
  }


  async function dadosUsuario() {
    const { value: formValues } = await Swal.fire({
      title: 'Login',
      html:
        '<input id="swal-input1" placeholder="Nome completo" class="swal2-input">' +
        `<select id="swal-input2" placeholder="PET" class="swal2-input">
            <option value="Selecionar PET">Selecionar PET</option>
            <option value="EngComp">EngComp</option>
            <option value="Mecânica">Mecânica</option>
            <option value="Elétrica">Elétrica</option>
            <option value="Economia">Economia</option>
            <option value="Educação Física">Educação Física</option>
            <option value="Matemática">Matemática</option>
            <option value="Psicologia">Psicologia</option>
            <option value="Serviço Social">Serviço Social</option>
            <option value="Administração">Administração</option>
            <option value="Licenciaturas">Licenciaturas</option>
            <option value="Cultura">Cultura</option>
            <option value="Educação">Educação</option>
            <option value="ProdBio">ProdBio</option>
        </select>`,
      focusConfirm: false,
      allowOutsideClick: false,
      preConfirm: () => {
        return [
          document.getElementById('swal-input1').value,
          document.getElementById('swal-input2').value
        ]
      }
    })

    if (formValues[1] !== "Selecionar PET" && formValues[0]) {
      setNome(formValues[0])
      localStorage.setItem("NOME", formValues[0])
      setPET(formValues[1])
      localStorage.setItem("PET", formValues[1])
    }
    else {
      await Swal.fire({
        position: 'center',
        icon: 'error',
        title: 'Preencha os campos corretamente',
        showConfirmButton: false,
        timer: 1500
      })
      dadosUsuario()
    }
  }

  function votacaoIniciada() {
    Swal.fire({
      title: 'Qual o seu voto?',
      showConfirmButton: true,
      showDenyButton: true,
      showCancelButton: true,
      allowOutsideClick: false,
      allowEscapeKey: false,
      confirmButtonText: multiSugestoes ? `1` : `SIM`,
      denyButtonText: multiSugestoes ? `2` : `NÃO`,
      cancelButtonText: multiSugestoes ? `3` : `ABSTER`,
    }).then((result) => {
      if (result.isConfirmed) {
        botao_sim()
      }
      else if (result.isDenied) {
        botao_nao()
      }
      else if (result.isDismissed) {
        botao_abster()
      }
    })
  }

  async function sugestaoDeAlteracao() {
    const { value: text } = await Swal.fire({
      input: 'textarea',
      inputLabel: 'Sugestão de alteração',
      inputPlaceholder: 'Escreva sua sugestão de alteração aqui...',
      inputAttributes: {
        'aria-label': 'Escreva sua sugestão de alteração aqui'
      },
      showCancelButton: true
    })

    if (text) {
      socket.emit('addSugestao', `${nome}||${PET}||${text}`)
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Sua sugestão foi enviada!',
        showConfirmButton: false,
        timer: 1500
      })
      // Swal.fire(text)
    }
  }

  return (
    <div className="container">

      <div className="infousuario">
        <p className="nome">Petiano: {nome} </p>
        <p className="nome">PET: {PET}</p>
        <AiFillEdit size={20} onClick={() => dadosUsuario()} />
      </div>


      <div className="areapropostas">
        <div className="areaproposta">
          <p className="tituloproposta">Proposta Vigente</p>
          <textarea
            className="proposta"
            value={propostaAntiga}
            onChange={e => add_proposta_antiga(e.target.value)}
            placeholder="Proposta Vigente"
            disabled={true}
            cols="50"
            rows="12"
          >
          </textarea>
        </div>

        <div className="areaproposta">
          <p className="tituloproposta">Sugestão de Alteração</p>
          <textarea
            className="proposta"
            value={propostaNova}
            onChange={e => add_proposta_nova(e.target.value)}
            placeholder="Sugestão de Alteração"
            disabled={true}
            cols="50"
            rows="12"
          >
          </textarea>
        </div>
      </div>

      <div className="botaosugestao">
        <button className="botao" onClick={() => sugestaoDeAlteracao()}>Sugerir alteração</button>
      </div>


      {total !== 0 &&
        <>
          <p className="tituloproposta">Estatísticas</p><br />
          <div className="areaGrafico">
            <h1 className="total">Total de votos: {total}</h1>
            <Chart
              width={'500px'}
              height={'300px'}
              chartType="PieChart"
              data={data}
              options={{ backgroundColor: 'none', legend: { alignment: 'center' }, }}
            />
          </div>
        </>
      }
      <Footer space={!total} />

    </div>
  )
}

export default Participant
