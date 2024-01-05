import React from 'react';
import { Link } from 'react-router-dom';
import '../css/Navbar.css'; // Make sure the path is correct

const Navbar = () => {
  // This state will be used in the future to handle dynamic changes
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);

  return (
    <header>
      <nav className="navbar-container navbar navbar-expand-lg navbar-light">
        <p><Link to="/" className="navbar-brand navbar-text"><span>B</span>ook A <span>B</span>ite</Link></p>
        <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarSupportedContent" style={{ flexDirection: 'row-reverse' }}>
          <ul className='navbar-nav ml-auto'>
            <li className="nav-item">
              <form className="d-flex" action="/find">
                <label className="pr-2" htmlFor="search">Search:</label>
                <input className="form-control" type="text" id="search" name="search" autoComplete="off" placeholder="Name, Location, Type" />
              </form>
            </li>
            <li className="nav-item">
              <Link to="/restaurants" className="nav-link">Restaurants</Link>
            </li>
            <li className="nav-item">
              <Link to="/offers" className="nav-link">Offers</Link>
            </li>
            {!isLoggedIn ? (
              <>
                <li className="nav-item mr-0">
                  <Link to="/login" className="nav-link">Log in</Link>
                </li>
                <li className="nav-item ml-0">
                  <Link to="/signup" className="nav-link">Sign in</Link>
                </li>
              </>
            ) : (
              <li className="nav-item">
                <Link to="/myaccount" className="nav-link">My Account</Link>
              </li>
            )}
          </ul>
        </div>
      </nav>
    </header>
  );
};

export default Navbar;
