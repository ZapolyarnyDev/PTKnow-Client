import type { LessonDTO } from '../../../types/lesson';

interface Props {
  lesson: LessonDTO;
}

export const LessonCard = ({ lesson }: Props) => {
  const begin = new Date(lesson.beginAt);
  const end = new Date(lesson.endsAt);

  const time =
    begin.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) +
    ' - ' +
    end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return (
    <div className={`lesson lesson-${lesson.state.toLowerCase()}`}>
      <div>
        <h3>{lesson.name}</h3>
        <p>{lesson.description}</p>
      </div>

      <div>{time}</div>
    </div>
  );
};
