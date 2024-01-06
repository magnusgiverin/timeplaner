import BreakLine from "~/components/General/BreakLine";

const Welcome = () => {
    return (
      <div className="mt-20">
        <h2 className="flex justify-center font-bold text-5xl my-4 pt-10">
          Welcome to TimePlaner!
        </h2>
        <BreakLine />
        <h1 className="justify-center font text-xl text-align-left mt-10">
          <p>This is a calendar application for NTNU students</p>
          <p>
            If you find any bugs, wish to suggest improvements, or have any
            feedback, feel free to contact us
          </p>
          <p>Enjoy :)</p>
        </h1>
        <BreakLine />
      </div>
    );
  };
  
  export default Welcome;
  