import "./style.css";
import userHooks from "../../hooks/user";
import FormInput from "./FormInput";

const Form = ({ loginUser }) => {
    const { handleLoginEvent } = userHooks();

    return (
        <>
            {!loginUser ? (
                <div className="wrapper auth-buttons">
                    <button onClick={handleLoginEvent} className="google-btn">
                        <span className="google-icon"></span>
                        <span className="google-text">Connect</span>
                    </button>
                </div>
            ) : (
                <FormInput loginUser={loginUser} />
            )}
        </>
    )
}

export default Form