import { memo, useCallback } from 'react';
import styles from '../../../../styles/pages/CreateCoursePage.module.css';
import { CourseButton } from '../../forms/CourseButton';
import { CourseFormInput } from '../../forms/CourseForm';

interface CourseVisitorsInfoProps {
  tagInput: string;
  tags: string[];
  maxUsersAmount: number;
  isLoading: boolean;
  onTagInputChange: (value: string) => void;
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onMaxUsersAmountChange: (count: number) => void;
}

const CourseVisitorsInfoComponent = ({
  tagInput,
  tags,
  maxUsersAmount,
  isLoading,
  onTagInputChange,
  onTagAdd,
  onTagRemove,
  onMaxUsersAmountChange,
}: CourseVisitorsInfoProps) => {
  const handleTagInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && tagInput.trim()) {
        e.preventDefault();
        onTagAdd(tagInput.trim());
        onTagInputChange('');
      }
    },
    [tagInput, onTagAdd, onTagInputChange]
  );

  const handleParticipantsSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onMaxUsersAmountChange(parseInt(e.target.value, 10));
    },
    [onMaxUsersAmountChange]
  );

  const handleTagInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onTagInputChange(e.target.value);
    },
    [onTagInputChange]
  );

  const handleRemoveTag = useCallback(
    (tag: string) => {
      onTagRemove(tag);
    },
    [onTagRemove]
  );

  return (
    <div className={styles.visitorsInfo}>
      <div className={styles.inputsFields}>
        <p>Информация для посетителей</p>

        <label htmlFor="tagsCourse">Теги курса</label>
        <div className={styles.tagsContainer}>
          <div className={styles.tagsList}>
            {tags.map((tag, index) => (
              <span key={index} className={styles.tag}>
                {tag}
                <CourseButton
                  type="button"
                  onClick={() => handleRemoveTag(tag)}
                  className={styles.tagRemove}
                  disabled={isLoading}
                >
                  ×
                </CourseButton>
              </span>
            ))}
          </div>

          <CourseFormInput
            type="text"
            id="tagsCourse"
            value={tagInput}
            onInputChange={handleTagInputChange}
            onInputKeyDown={handleTagInputKeyDown}
            placeholder="Введите тег и нажмите Enter"
            className={styles.titleInput}
            disabled={isLoading}
          />
        </div>
      </div>

      <div className={styles.participantsSection}>
        <div className={styles.participantsControl}>
          <label htmlFor="countUsers">Максимум участников</label>
          <span className={styles.participantsValue}>{maxUsersAmount}</span>
        </div>

        <CourseFormInput
          type="range"
          id="countUsersSlider"
          min={0}
          max={20}
          value={maxUsersAmount}
          onInputChange={handleParticipantsSliderChange}
          className={styles.participantsSlider}
          disabled={isLoading}
        />
      </div>
    </div>
  );
};

export const CourseVisitorsInfo = memo(CourseVisitorsInfoComponent);
