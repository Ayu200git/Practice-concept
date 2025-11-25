 import { Routes, Route } from 'react-router-dom';
 import Layout from './Layout';
 import Home from './components/Home';
 import About from './components/About';
 import Contact from './components/contact';
 import User from './components/User';
 import { githubInfoLoader } from './components/Github';
 import Github from './components/Github';
 
import viteLogo from '/vite.svg'
import './App.css';

function App() {

  return (
    <Routes>
      <Route path='/' element={<Layout />}>
         <Route index element={<Home />}/>
         <Route path='about' element={<About/>}/>
         <Route path='contact' element={<Contact/>}/>
         <Route path='user/:userId' element={<User />}/>
         <Route loader={  githubInfoLoader } path='github' element={<Github />}/>
      </Route>
    </Routes>
  );
}

export default App;