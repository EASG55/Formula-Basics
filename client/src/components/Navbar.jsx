import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Navbar() {
  const { logout } = useAuth()

  return (
    <nav className='navbar'>
      <div className='navbar-brand'>🏆 F1 Paddock</div>
      <div className='navbar-links'>
        <Link to='/' className='navbar-link'>
          Inicio
        </Link>
        <Link to='/drivers' className='navbar-link'>
          Pilotos
        </Link>
        <Link to='/races' className='navbar-link'>
          Calendario
        </Link>
        <Link to='/academy' className='navbar-link'>
          Academia
        </Link>
        <button onClick={logout} className='btn-logout'>
          Salir
        </button>
      </div>
    </nav>
  )
}
