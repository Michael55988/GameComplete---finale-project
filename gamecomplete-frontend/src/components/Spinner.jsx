import './Spinner.css';

function Spinner({ size = 'medium' }) {
  return (
    <div className={`gc-spinner gc-spinner-${size}`}>
      <div className="gc-spinner-ring"></div>
    </div>
  );
}

export default Spinner;
