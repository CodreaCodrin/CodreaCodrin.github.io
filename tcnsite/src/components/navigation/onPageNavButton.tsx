interface SquareButtonProps {
  text: string;
  title: string;
  onClick?: () => void;
}

const OnPageNavButton: React.FC<SquareButtonProps> = ({ text, title, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center w-32 h-32 border-2 transition-all duration-200 cursor-pointer"
      style={{
        borderColor: 'var(--color-border)',
        backgroundColor: 'var(--color-bg-secondary)',
        color: 'var(--color-text)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.borderColor = 'var(--color-primary)';
        e.currentTarget.style.color = 'var(--color-primary)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.borderColor = 'var(--color-border)';
        e.currentTarget.style.color = 'var(--color-text)';
      }}
    >
      <span className="text-5xl font-bold leading-none">{title}</span>
      <span className="mt-2 text-sm font-semibold tracking-wide">{text}</span>
    </button>
  );
};

export default OnPageNavButton;