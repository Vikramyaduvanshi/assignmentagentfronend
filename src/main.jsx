import { BrowserRouter  } from 'react-router-dom';

import { createRoot } from 'react-dom/client'
import { Provider } from "react-redux";
import App from './App.jsx'
import { Authprovider } from './authcontext/Authcontext.jsx';
import { store } from './redux/store.js';

createRoot(document.getElementById('root')).render(

  <BrowserRouter>
  
  
  <Authprovider>

<Provider store={store}>
<App/>

</Provider>

  </Authprovider>
  
  </BrowserRouter>

)
