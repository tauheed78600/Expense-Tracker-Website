import Image from 'react-bootstrap/Image';
import "../styles/NotFound.css";
import * as Components from '../Components';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import Cookies from 'universal-cookie';

function FluidExample() {
  return <Image src={require("../assets/404.jpg")} fluid />;
}


export const NotFound = () => {
    const cookies = new Cookies();
    const navigate = useNavigate();
    const handleReturn = useCallback(()=>{
        
        const accessToken = cookies.get('access_token');
        if(accessToken)
        {
            navigate("/dashboard");
        }
        else
        {
            navigate('/');
        }
    }, [navigate]);

    return (
        <>
        <div id="div-404">
            <div id="image-div">
                <FluidExample/>
                <a href="https://www.freepik.com/" style={{"fontSize":"8px", "position":"absolute", "marginLeft":"12%", "marginTop":"-30px"}}>Designed by stories / Freepik</a>
            </div>
            <span id="error-body">The page you were looking for was not found...</span>
            
            <Components.Button onClick={handleReturn}>Return Back</Components.Button>
        </div>
        
        </>
    )
}