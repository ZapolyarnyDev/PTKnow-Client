import count_people from '../../../../assets/icons/ui-icons/count_people.svg';
import styles from './PreviewEvent.module.css';

interface PreviewEventProps {
  imageUrl: string;
  title: string;
  description: string;
  participantsCount?: number;
  buttonText?: string;
  onButtonClick?: () => void;
  imageAlt?: string;
}

const PreviewEvent: React.FC<PreviewEventProps> = ({
  imageUrl,
  title,
  description,
  participantsCount = 0,
  buttonText = 'Участвовать',
  onButtonClick,
  imageAlt = 'Preview',
}) => {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <img src={imageUrl} alt={imageAlt} className={styles.image} />
      </div>

      <div className={styles.previewInformation}>
        <div className={styles.content}>
          <h3 className={styles.title}>{title}</h3>
          <p className={styles.description}>{description}</p>

          {participantsCount > 0 && (
            <div className={styles.participants}>
              <img src={count_people} alt="" />
              {participantsCount}
            </div>
          )}
        </div>
        <button onClick={onButtonClick} className={styles.button}>
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default PreviewEvent;
