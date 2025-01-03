import { Row, Col } from 'antd';
import AboutUsText from './text.js';
import './AboutCards.css';

const AboutSectionCards = () => {
  return (
    <div className="about-us-cards-main-container">
      <div className="about-us-cards-section">
        <h2 className="about-us-cards-section__header-text">{AboutUsText.title}</h2>
        <Row gutter={[32, 32]} >
          {AboutUsText.content.map((card, index) => (
            <Col
              key={index}
              xs={24}
              md={12}
              xl={8}
              xxl={8}
            >
              <div className="about-us-cards-section__card">
                <h3 className="about-us-cards-section__cards-content__text-header">{card.title}</h3>
                <p className="about-us-cards-section__cards-content__text">{card.text}</p>
              </div>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default AboutSectionCards;
