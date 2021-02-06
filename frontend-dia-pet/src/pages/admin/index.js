import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { Chart } from "react-google-charts";
import Swal from 'sweetalert2'
import {  FiTrash2, FiSearch } from "react-icons/fi";
import Footer from '../../Footer/footer';
import '../../styles.css'

// Usando o backend do heroku
const socket = io.connect('https://backend-dia-pet.herokuapp.com/')

// Se for rodar o servidor localmente 
// const socket = io.connect('http://localhost:4000')

function Admin() {
  const [propostaAntiga, setPropostaAntiga] = useState("")
  const [propostaNova, setPropostaNova] = useState("")
  const [todasSugestoes, setTodasSugestoes] = useState([])
  const [sim, setSim] = useState(0)
  const [nao, setNao] = useState(0)
  const [abstencao, setAbstencao] = useState(0)
  const [total, setTotal] = useState(0)
  const [statusVotacao, setStatusVotacao] = useState('')
  const [qtdPessoas, setQtdPessoas] = useState(0)
  const [multiSugestoes, setMultiSugestoes] = useState(false);
  const [ data ,setData]= useState([
    ['Votos', 'Quantidade'],
    ['SIM', sim],
    ['NÃO', nao],
    ['ABSTENÇÃO', abstencao],
  ]);
  
  useEffect(()=>{
    if(multiSugestoes)
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

  },[sim,nao,abstencao,multiSugestoes])

  useEffect(() => {
    const senhaAdmin = localStorage.getItem("SENHA")
    
    if(senhaAdmin !== 'diapet_2020'){
      async function salvarSenha() {
        const { value: password } = await Swal.fire({
          title: 'Digite a senha',
          input: 'password',
          inputLabel: 'Password',
          inputPlaceholder: 'Digite a senha',
          allowOutsideClick: false,
          inputAttributes: {
            maxlength: 10,
            autocapitalize: 'off',
            autocorrect: 'off'
          }
        })
        
        if (password === 'diapet_2020') {
          localStorage.setItem("SENHA", password);
        }
        else{
          await Swal.fire({
            position: 'center',
            icon: 'error',
            title: 'Senha incorreta!',
            showConfirmButton: false,
            timer: 1500
          })
          salvarSenha()
        }
      }
      salvarSenha();
    }
  },[])

  useEffect(() => {
    socket.on('qtd_pessoas', (num) =>{
      setQtdPessoas(num)
    })

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

    socket.on('sugestoes', (sugestoes) => {
      setTodasSugestoes(sugestoes)
    })

    socket.on('multipla_escolha',(state)=>{
      setMultiSugestoes(state);
    })

    socket.on('iniciarVotacao', () => {
      setStatusVotacao('INICIADA')
    })

    socket.on('encerrarVotacao', () => {
      setStatusVotacao('ENCERRADA')
    })

    socket.on('limpar', (num) => {
      setSim(num)
      setNao(num)
      setAbstencao(num)
      setTotal(num)
    })
  })

  function multipla_escolha_opcoes(){
    socket.emit('multipla_escolha_admin')
  }

  function add_proposta_antiga(txt){
    setPropostaAntiga(txt)
    socket.emit('propostaAntiga', txt)
  }

  function add_proposta_nova(txt){
    setPropostaNova(txt)
    socket.emit('propostaNova', txt)
  }

  function remover_sugestao(posicao){
    socket.emit('removerSugestao', posicao)
  }

  function iniciar_votacao(){
    if(total){
      Swal.fire({
        title: 'Ops, lembre-se de limpar a votação anterior.',
        icon: 'warning',
        showConfirmButton: false,
        timer: 1600
      })
    }else{
      socket.emit('iniciarVotacao')
      Swal.fire({
        position: 'center',
        icon: 'success',
        title: 'Votação iniciada!',
        showConfirmButton: false,
        timer: 1500
      })
    }
  }

  function encerrar_votacao(){
    socket.emit('encerrarVotacao')
    Swal.fire({
      position: 'center',
      icon: 'error',
      title: 'Votação encerrada!',
      showConfirmButton: false,
      timer: 1500
    })
  }

  function limpar_votos(){
    Swal.fire({
      title: 'Realmente quer limpar a votação',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: `SIM`,
      cancelButtonText: `CANCELAR`,
    }).then((result) => {
      /* Read more about isConfirmed, isDenied below */
      if (result.isConfirmed) {
        socket.emit('limpar')
      } 
    })
    
  }

  function detalhe_sugestao(sugestao){
    Swal.fire({
      title: '<strong>Sugestão de Alteração</strong>',
      html:
      `<strong>Petiano(a):</strong> ${sugestao[0]} <br/> <strong>PET:</strong> ${sugestao[1]}`+
      `<br/><br/> <p> <strong>Sugestão:<br/><br/> </strong> <textarea cols="50" rows="20" 
      style="border:none;background-color:#F0F0F5;padding:10px;font-family:Roboto" >${sugestao[2]}</textarea></p>`,
      showCloseButton: true,
      showConfirmButton: false,
    })
  }

  function Item(props) {
    let sugestao = props?.value;
    
    sugestao = sugestao.split("");
    let indice = sugestao.pop();
    
    sugestao = sugestao.join('');
    sugestao = sugestao.split("||");
    
    return(
      <div className="itemSugestao" key={indice}>
        <div className="botaoRemoveSugestao"  onClick={() => remover_sugestao(indice)}>
            <FiTrash2 size={18}/>
        </div>
        <div className="nomeSugestao"> {sugestao[0]} - {sugestao[1]}</div>
        <div className="botaoVerSugestao" onClick={() => detalhe_sugestao(sugestao)}>
          <FiSearch size={20} />
        </div>
    </div> 
    )
  }

  return (

    <div className="container">

      <div className="infousuario">
        <p className="nome">Nº de pessoas conectadas: <strong>{qtdPessoas}</strong></p>
      </div>

      <div className="areapropostas">
        <div className="areaproposta">
          <p className="tituloproposta">Proposta Vigente</p>
          <textarea
            className="proposta"
            value={propostaAntiga}
            onChange={e => add_proposta_antiga(e.target.value)}
            placeholder="Escreva aqui a proposta vigente."
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
            placeholder="Escreva aqui uma sugestão de alteração para a proposta."
            cols="50"
            rows="12"
          >
          </textarea>
        </div>
      </div>

      <div className="estatisticas">
        <div className ="areaAdminSugestoes">
          <p className="tituloproposta">Sugestões de alteração</p>
          <div className="containerSugestoes">
            <ul>
              {todasSugestoes.map((item, indice) => <Item key={indice} value={item+indice} />)}
            </ul>
          </div>

        </div>
        
        <button className="botao" onClick={() => limpar_votos()}>LIMPAR VOTAÇÃO</button>

        <div className="containerCheckbox">
          <input 
            type="checkbox"
            checked={multiSugestoes}
            onChange={() => multipla_escolha_opcoes()}/>
          <label> Multiplas sugestões em votação </label>
        </div> 

        <div style={{ marginBottom: 20}}>
          <h2>Status da votação: {statusVotacao}</h2>
          <button className="botaoiniciar" onClick={() => iniciar_votacao()}>Iniciar Votação</button>
          <button className="botaoencerrar" onClick={() => encerrar_votacao()}>Encerrar Votação</button>
        </div>

      </div>

      {total !== 0 &&
        <div className="areaGrafico">
          <p className="tituloproposta">Estatísticas</p><br/>
          <h1 className="total">Total de votos: {total}</h1>
          <Chart
            loader={<div>Carregando gráfico</div>}
            width={'500px'}
            height={'300px'}
            chartType="PieChart"
            data={data}
            options={{  backgroundColor: 'none',legend:{alignment:'center'}, }}
          />
        </div>
      }    
      <Footer/>     

    </div>

  )
}

export default Admin
