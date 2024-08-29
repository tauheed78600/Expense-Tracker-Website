import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function PopupModal({state, setState, handleLog}) {
  const [show, setShow] = useState(false);

  const handleClose = () =>{
    setState(false);
    setShow(false);
  } 

  const handleShow = () => setShow(true);

  useEffect(()=>{
    setShow(state);
  }, [state]);

  return (
    <>

      <Modal backdrop="static" keyboard={false} show={show} onHide={handleClose} animation={false} centered>
        <Modal.Body>Are you sure you want to logout?</Modal.Body>
        <Modal.Footer>
          <Button style={{"backgroundColor":"#e26f6f"}} variant="secondary" onClick={handleClose}>
            No
          </Button>
          <Button style={{"backgroundColor":"#e26f6f"}} variant="secondary" onClick={handleLog}>
            Yes
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PopupModal;