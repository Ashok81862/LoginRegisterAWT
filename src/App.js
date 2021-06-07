import './App.css';
import React, {useState, useEffect} from 'react'
import Axios from 'axios'

function App() {
  const [usernameRegister, setUsernameRegister] = useState("");
  const [passwordRegister, setPasswordRegister] = useState("");

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [status, setStatus] = useState(false);

  Axios.defaults.withCredentials = true;

  const register = () => {
    Axios.post("http://localhost:3001/register", {username: usernameRegister, password: passwordRegister}).then((response) => {
      setStatus(response.data)
    })
  }

  const login = () => {
    Axios.post("http://localhost:3001/login", {username: username, password: password}).then((response) => {
     if(!response.data.auth){
       setStatus(false)
     }
     else{
       localStorage.setItem("token", response.data.token)
       setStatus(true)
     }
    })
  }

  const auth = () => {
    Axios.get("http://localhost:3001/isUserAuth", {
      "headers" : {
        "x-access-token" : localStorage.getItem("token")
      }
    }).then((response) => {
      console.log(response)
    })
  }


  useEffect(() => {
    Axios.get("http://localhost:3001/login").then((response) => {
      if(response.data.loggedIn === true)
      {
        setStatus(response.data.user[0].username)
      }
    })
  })
  return (
    <div className="App">
      <div>
         <h1>Register</h1>
         <div className="register">
            <label>Username</label>
            <input type="text" onChange={
              (event) => {
                setUsernameRegister(event.target.value)
              }
            } />

            <label>Password</label>
            <input type="password" onChange={
              (event) => {
                setPasswordRegister(event.target.value)
              }
            } />

            <button onClick={register}>Register</button>
         </div>
       </div>

       <div>
          <h1>Login</h1>
          <div className="login">
            <label>Username</label>
            <input type="text"
            onChange={
              (event) => {
                setUsername(event.target.value)
              }
            } />

            <label>Password</label>
            <input type="password"
              onChange = {
                (event) => {
                  setPassword(event.target.value)
                }
              }
            />

            <button onClick={login}>Login</button>
          </div>
       </div>
       { status && <button onClick={auth}>Check Authentication</button>}
    </div>
  );
}

export default App;
