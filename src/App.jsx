import {Routes,Route } from 'react-router-dom';
import { Home } from './pages/home';
import { Login } from './pages/login';
import { PrivateRoute } from './routes/privateroutes';
import { Checking } from './pages/checking_assignment';
import { Batches } from './pages/batches';


function App() {
  

  return (
    <>
     

<Routes>


<Route path='/login' element={<Login/>}/>

<Route element={<PrivateRoute/>}>
<Route path='/' element={<Home/>}/>
<Route path='/checking' element={<Checking/>}/>
<Route path='/batches/:id' element={<Batches/>}/>

</Route>

</Routes>


    </>
  )
}

export default App
