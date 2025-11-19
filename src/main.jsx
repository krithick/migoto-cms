import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Login from './Pages/Login/Login.jsx'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import NotFound from './Utils/NotFound/NotFound.jsx'

const router = createBrowserRouter([
  {
    path: import.meta.env.VITE_APP_URL.slice(0, -1),
    element: (
        <Login />
    ),
  },
  {
    path: `${import.meta.env.VITE_APP_URL}*`,
    element: <App />,
    // children: [
    //   {
    //     path: 'dashboard',
    //     element: <Dashboard />,
    //   },
    // ]
  },
  // {
  //   path: '*',
  //   element: <NotFound />
  // }
]);
createRoot(document.getElementById('root')).render(
    <RouterProvider router={router} />
)

// createRoot(document.getElementById('root')).render(
//   <StrictMode>
//     <Login />
//     {/* <App/> */}
//   </StrictMode>,
// )
