import { useState } from "react";
import { toast } from "react-toastify";
import axios from "axios";
import TimezoneSelect from 'react-timezone-select';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { getDay, addMonths, setHours, setMinutes, subDays, addDays } from 'date-fns';
import moment from 'moment-timezone';

const FormInput = ({ loginUser }) => {
    const [name, setName] = useState("Shubham Lal");
    const [email, setEmail] = useState("im.shubhamlal@gmail.com");
    const [phone, setPhone] = useState("9163161834");
    const [timezone, setTimezone] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState(
        setHours(setMinutes(new Date(), 0), 10, 0, 0)
    );
    const [inputState, setInputState] = useState(0);

    const handleSubmitForm = (e) => {
        e.preventDefault();
        if (!loginUser) return toast.error("Sign in to your google account first!");
        if (!name || !timezone) return toast.warning("Enter all the fields to proceed!");

        const formattedDateTime = moment(startDate).tz(timezone["value"]).format();

        setIsLoading(true);
        axios.post(`${import.meta.env.VITE_BACKEND_URL}/api/v1/create-appointment`, {
            userId: loginUser._id,
            name,
            email,
            phone,
            timezone: timezone["value"],
            startTime: formattedDateTime,
        })
            .then(res => {
                toast.success("Appointment booked successfully!");
                setTimeout(() => {
                    toast.success("Appointment details added to your Google Calendar!");
                }, 5000);
            })
            .catch(err => {
                toast.error(err.response.data);
            })
            .finally(() => {
                setIsLoading(false);
                setInputState(0);
                setName("");
            });
    };

    return (
        <div className="form--wrapper">
            <form onSubmit={handleSubmitForm} className="form--container">
                {inputState === 0 && <NameInput name={name} setName={setName} placeholderName={loginUser ? loginUser.name : "Shubham Lal"} />}

                {inputState === 1 && <EmailInput email={email} setEmail={setEmail} placeholderEmail={loginUser ? loginUser.email : "im.shubhamlal@gmail.com"} />}

                {inputState === 2 && <PhoneInput phone={phone} setPhone={setPhone} />}

                {inputState === 3 && <TimezoneInput timezone={timezone} setTimezone={setTimezone} />}

                {inputState === 4 && <DateTimeInput startDate={startDate} setStartDate={setStartDate} />}

                {inputState === 5 && <DisplayInfo name={name} email={email} phone={phone} timezone={timezone} startDate={startDate} />}

                <div className="navigation">
                    <div>
                        {inputState > 0 && (
                            <button type="button" onClick={() => inputState > 0 && setInputState(prev => prev - 1)}>
                                Previous
                            </button>
                        )}
                    </div>
                    <div>
                        {inputState < 5 && (
                            <button type="button" onClick={() => {
                                if (inputState === 0 && !name) return toast.warn("Enter your full name to proceed!");
                                if (inputState === 1 && !name) return toast.warn("Enter your email to proceed!");
                                if (inputState === 2 && !name) return toast.warn("Enter your phone no. to proceed!");
                                if (inputState === 3 && !timezone) return toast.warn("Select your local timezone to proceed!");
                                setInputState(prev => prev + 1)
                            }}>
                                Next
                            </button>
                        )}
                        {inputState === 5 && (
                            <button type="submit">
                                {isLoading ? "Booking" : "Book"}
                            </button>
                        )}
                    </div>
                </div>
            </form>
        </div>
    )
};

const NameInput = ({ name, setName, placeholderName }) => {
    return (
        <div>
            <label htmlFor="name">Your Full Name</label>
            <br />
            <input
                type="text"
                id="name"
                placeholder={placeholderName}
                value={name}
                onChange={(e) => setName(e.target.value)}
            />
        </div>
    );
};

const EmailInput = ({ email, setEmail, placeholderEmail }) => {
    return (
        <div>
            <label htmlFor="email">Your Email Address</label>
            <br />
            <input
                type="email"
                id="email"
                placeholder={placeholderEmail}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
            />
        </div>
    );
};

const PhoneInput = ({ phone, setPhone }) => {
    return (
        <div>
            <label htmlFor="phone">Your Phone Number</label>
            <br />
            <input
                type="number"
                id="phone"
                placeholder="9163161834"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
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

const DateTimeInput = ({ startDate, setStartDate }) => {
    const isWeekday = (date) => {
        const day = getDay(date);
        return day !== 0 && day !== 6;
    };
    return (
        <DatePicker
            selected={startDate}
            includeDateIntervals={[
                { start: subDays(new Date(), 0), end: addDays(new Date(), 60) },
            ]}
            onChange={(date) => setStartDate(date)}
            minDate={new Date()}
            maxDate={addMonths(new Date(), 2)}
            dateFormat="MMMM d, yyyy h:mm aa"
            filterDate={isWeekday}
            showTimeSelect
            timeIntervals={60}
            minTime={setHours(setMinutes(new Date(), 0), 10, 0, 0)}
            maxTime={setHours(setMinutes(new Date(), 30), 16, 0, 0)}
            inline
            fixedHeight
        />
    );
};

const DisplayInfo = ({ name, email, phone, timezone, startDate }) => {
    const formattedDate = `${startDate.getDate()}/${startDate.getMonth() + 1}/${startDate.getFullYear()}, ${startDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    return (
        <div>
            <div>
                <span>Name: </span>
                <span>{name}</span>
            </div>
            <div>
                <span>Email: </span>
                <span>{email}</span>
            </div>
            <div>
                <span>Phone: </span>
                <span>{phone}</span>
            </div>
            <div>
                <span>Timezone: </span>
                <span>{timezone["value"]}</span>
            </div>
            <div>
                <span>Appointment: </span>
                <span>{formattedDate}</span>
            </div>
        </div>
    )
}

export default FormInput