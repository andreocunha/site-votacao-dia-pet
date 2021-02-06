import logoPet from "./logo-pet.png";
import "./style.css";

const Footer = (props) => {
  return (
    <footer className={props?.space ? "footer-com-margem" : ""}  >
      <div className="footer-container" >
            <div className="colLogo">
              <p className="footer-text">
                <a  className="footer-text"
                  href="https://pet.inf.ufes.br/"
                  target="_blank"
                  rel="noopener noreferrer">
                Site desenvolvido pelo grupo                    
                <br/> PET Engenharia de Computação
                <br/> @2021 PET Ufes
                </a>
              </p>
            </div>
            <br/>
            <div >
              <img alt="logoPET" src={logoPet} className="logoPet" />
            </div>
            <br/>
            <div >
              <p className="footer-text">
                Para nos informar sobre algum problema ou
                <br/> sugestão, envie um e-mail para 
                <br/> petengcomp@inf.ufes.br
              </p>
            </div>
      </div>
    </footer>
  );
};

export default Footer;
