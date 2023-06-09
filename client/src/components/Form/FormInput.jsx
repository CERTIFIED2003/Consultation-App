import { useState } from "react";
import EmailInput from "./EmailInput";
import { toast } from "react-toastify";
import axios from "axios";
import TimezoneSelect from 'react-timezone-select';

const FormInput = ({ loginUser }) => {
    const [summary, setSummary] = useState("");
    const [description, setDescription] = useState("");
    const [timezone, setTimezone] = useState("");
    const [startDateTime, setStartDateTime] = useState("");
    const [endDateTime, setEndDateTime] = useState("");
    const [guests, setGuests] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [inputState, setInputState] = useState(0);

    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (!loginUser) return toast.error("Sign in to your google account first!");
        if (!summary || !description || !timezone || !startDateTime || !endDateTime || !guests) return toast.warning("Enter all the fields to proceed!");

        setIsLoading(true);
        axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/create-event`, {
            userId: loginUser._id,
            summary,
            description,
            timezone: timezone["value"],
            startTime: startDateTime,
            endTime: endDateTime,
            guests
        })
            .then(res => {
                toast.success("Added event to your calendar successfully!");
                setTimeout(() => {
                    if (guests.length > 0) toast.success("Also sent invitation mail to guests!");
                }, 5000);
            })
            .catch(err => {
                toast.error(err.response.data);
            })
            .finally(() => {
                setIsLoading(false);
                setSummary("");
                setDescription("");
                setTimezone("");
                setStartDateTime("");
                setEndDateTime("");
                setGuests([]);
            });
    };

    return (
        <div className="form--wrapper">
            <form onSubmit={handleSubmitForm} className="form--container">
                {inputState === 0 && <SummaryInput summary={summary} setSummary={setSummary} />}
                <br />
                {inputState === 1 && <DescInput description={description} setDescription={setDescription} />}
                <br />
                {inputState === 2 && <TimezoneInput timezone={timezone} setTimezone={setTimezone} />}
                <br />
                <div className="navigation">
                    <button disabled={inputState === 0} type="button" onClick={() => inputState > 0 && setInputState(prev => prev - 1)}>
                        Previous
                    </button>
                    <button type="button" onClick={() => setInputState(prev => prev + 1)}>
                        Next
                    </button>
                </div>
            </form>
        </div>
    )
};

const SummaryInput = ({ summary, setSummary }) => {
    return (
        <div>
            <label htmlFor="summary">Summary</label>
            <br />
            <input
                type="text"
                id="summary"
                placeholder="Enter topic title"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
            />
        </div>
    );
};

const DescInput = ({ description, setDescription }) => {
    return (
        <div>
            <label htmlFor="desc">Description</label>
            <br />
            <textarea
                id="desc"
                placeholder="Enter topic description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />
        </div>
    );
};

const TimezoneInput = ({ timezone, setTimezone }) => {
    return (
        <div>
            <label htmlFor="timezone">Timezome</label>
            <br />
            <TimezoneSelect
                id="timezone"
                value={timezone}
                onChange={setTimezone}
            />
        </div>
    );
};

export default FormInput