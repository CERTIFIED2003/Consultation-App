function userHooks() {
    const handleLoginEvent = () => {
        window.location.href = `${import.meta.env.VITE_BACKEND_URL}/api/v1/auth`;
    };

    return {
        handleLoginEvent,
    };
}

export default userHooks;