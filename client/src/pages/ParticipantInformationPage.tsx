const ParticipantInformationPage: React.FC = () => {
    return (
        <>
            <h1>Contact Information</h1>
            <p>Add contact info for all interested parties who will receive inspection correspondence</p>
            <br></br>
            <h3>Client Information</h3>

            <div className="input-container">
                <form>
                    <p>First Name</p>
                    <input type="text" placeholder="Joe" />
                </form>
                <form>
                    <p>Last Name</p>
                    <input type="text" placeholder="Smith" />
                </form>
                <form>
                    <p>Email</p>
                    <input type="text" placeholder="joe.smith@xyz.com" />
                </form>
            </div>

            <br></br>
            <h3>Agent Information</h3>

            <div className="input-container">
                <form>
                    <p>First Name</p>
                    <input type="text" placeholder="Joe" />
                </form>
                <form>
                    <p>Last Name</p>
                    <input type="text" placeholder="Smith" />
                </form>
                <form>
                    <p>Email</p>
                    <input type="text" placeholder="joe.smith@xyz.com" />
                </form>
            </div>
        </>
    );
};
export default ParticipantInformationPage;