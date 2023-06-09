import { Link } from "react-router-dom";
import "./style.css";

const Navbar = () => {
    return (
        <nav className="navbar">
            <div>
                <Link to="/"><h1>Consultant Booking</h1></Link>
            </div>
        </nav>
    )
}

export default Navbar