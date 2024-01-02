
const Welcome = () => {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
            <h2 className="flex justify-center font-bold text-5xl my-2">
                Welcome to CalOne!
            </h2>
            <h1 className="justify-center font text-xl text-align-left my-10">
                <p>This is a calendar application for NTNU students</p>
                <p>If you find any bugs, wish to suggest improvements, or have any feedback, feel free to contact us</p>
                <p>Enjoy :)</p>
            </h1>
        </div>
    )
}

export default Welcome;