import PropTypes from 'prop-types';
import backImage from '../images/back.png';

const Card = ({ data }) => {
  const displayImage = data.hidden ? backImage : data.image;

  return (
    <div className="card">
      <img src={displayImage} alt={data.code} />
    </div>
  );
};

Card.propTypes = {
  data: PropTypes.shape({
    image: PropTypes.string,
    code: PropTypes.string,
  }).isRequired,
};

export default Card;
