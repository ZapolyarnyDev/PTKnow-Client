import { memo, useCallback } from 'react';
import styles from '../../../../styles/pages/CreateCoursePage.module.css';
import { CourseButton } from '../../forms/CourseButton';
import { CourseFormInput } from '../../forms/CourseForm';

interface CourseVisitorsInfoProps {
  tagInput: string;
  tags: string[];
  participantsCount: number;
  courseType: 'private' | 'public';
  isLoading: boolean;
  onTagInputChange: (value: string) => void;
  onTagAdd: (tag: string) => void;
  onTagRemove: (tag: string) => void;
  onParticipantsChange: (count: number) => void;
  onCourseTypeChange: (type: 'private' | 'public') => void;
}

const CourseVisitorsInfoComponent = ({
  tagInput,
  tags,
  participantsCount,
  courseType,
  isLoading,
  onTagInputChange,
  onTagAdd,
  onTagRemove,
  onParticipantsChange,
  onCourseTypeChange,
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
      onParticipantsChange(parseInt(e.target.value, 10));
    },
    [onParticipantsChange]
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

  const handleSetPrivate = useCallback(() => {
    onCourseTypeChange('private');
  }, [onCourseTypeChange]);

  const handleSetPublic = useCallback(() => {
    onCourseTypeChange('public');
  }, [onCourseTypeChange]);

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
          <label htmlFor="countUsers">Количество участников</label>
          <span className={styles.participantsValue}>{participantsCount}</span>
        </div>

        <CourseFormInput
          type="range"
          id="countUsersSlider"
          min={0}
          max={20}
          value={participantsCount}
          onInputChange={handleParticipantsSliderChange}
          className={styles.participantsSlider}
          disabled={isLoading}
        />
      </div>

      <div className={styles.typeCourse}>
        <p>Тип курса</p>
        <div className={styles.changeType}>
          <CourseButton
            type="button"
            onClick={handleSetPrivate}
            className={`${styles.typeButton} ${
              courseType === 'private' ? styles.typeButtonActive : ''
            }`}
            disabled={isLoading}
          >
            Приватный
          </CourseButton>

          <CourseButton
            type="button"
            onClick={handleSetPublic}
            className={`${styles.typeButton} ${
              courseType === 'public' ? styles.typeButtonActive : ''
            }`}
            disabled={isLoading}
          >
            Публичный
          </CourseButton>
        </div>
      </div>
    </div>
  );
};

export const CourseVisitorsInfo = memo(CourseVisitorsInfoComponent);
