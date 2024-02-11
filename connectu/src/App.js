import AddUser from "./Components/AddUser";
import Errorhandling from "./Components/Errorhandling";
import RemoveUser from "./Components/RemoveUser";
import UpdateUser from "./Components/UpdateUser";
import Posts from "./Components/Posts";

function App() {
  return (
    <div>
      <Posts />
      <AddUser />
      <UpdateUser />
      <RemoveUser />
      <Errorhandling />
    </div>
  );
}

export default App;


/*
import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}

export default App;
*/
