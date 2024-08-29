import Spinner from 'react-bootstrap/Spinner';
import "../styles/SpinnerComponent.css"

function SpinnerComponent({state, setState}) {
  if(state)
  {
    return (
      <>
        <div id = "spinner-overlay">
          <Spinner animation="border" role="status" id = "spinner-component">
          </Spinner>
        </div>
        
      </>
      
    );
  }
  else
  {
    return(
      <>
      </>
    )
  }
  
}

export default SpinnerComponent;