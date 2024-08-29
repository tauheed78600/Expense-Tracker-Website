import { useEffect, useState } from 'react';
import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function PopupModal({state, setState, content}) {
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
        <Modal.Header closeButton>
          <Modal.Title>{content.head}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{content.body}</Modal.Body>
        <Modal.Footer>
          <Button style={{"backgroundColor":"#e26f6f"}} variant="secondary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default PopupModal;