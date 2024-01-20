// Header component
interface HeaderProps {
    label: string;
}

const Header: React.FC<HeaderProps> = ({ label }) => (
    <div className="flex flex-col items-center justify-center mt-20">
        <h2>{label}</h2>
    </div>
);

export default Header;