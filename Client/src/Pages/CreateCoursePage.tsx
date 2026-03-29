import { useCallback, useState } from 'react';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Footer from '../Components/Footer';
import Header from '../Components/Header';
import { CourseMainInfo } from '../Components/ui/Events/course/CourseMainInfo';
import { CourseVisitorsInfo } from '../Components/ui/Events/course/CourseVisitorsInfo';
import { CourseButton } from '../Components/ui/forms/CourseButton';
import { useCreateCourse } from '../hooks/useCreateCourse';
import { useAuth } from '../hooks/useAuth';
import { normalizeRole } from '../utils/roleUtils';
import styles from '../styles/pages/CreateCoursePage.module.css';

const CreateCoursePage: React.FC = () => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [maxUsersAmount, setMaxUsersAmount] = useState(0);

  const { user, isLoading: isAuthLoading, isInitialized } = useAuth();
  const { createCourse, isLoading } = useCreateCourse();
  const normalizedRole = normalizeRole(user?.role);
  const canCreateCourse =
    isInitialized &&
    !isAuthLoading &&
    (normalizedRole === 'TEACHER' || normalizedRole === 'ADMIN');

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!name.trim()) {
        toast.error('Введите название курса');
        return;
      }

      if (!description.trim()) {
        toast.error('Введите описание курса');
        return;
      }

      if (description.trim().length < 10) {
        toast.error('Описание должно содержать минимум 10 символов');
        return;
      }

      if (!canCreateCourse) {
        toast.error('Создавать курсы могут только преподаватели или администраторы');
        return;
      }

      try {
        const courseData = {
          name: name.trim(),
          description: description.trim(),
          tags: tags,
          maxUsersAmount: maxUsersAmount,
        };

        await createCourse(courseData, previewFile || undefined);

        setName('');
        setDescription('');
        setPreviewFile(null);
        setPreviewUrl('');
        setTagInput('');
        setTags([]);
        setMaxUsersAmount(0);

        toast.success('Курс успешно создан!');
      } catch (err) {
        if (
          typeof err === 'object' &&
          err !== null &&
          'response' in err &&
          (err as { response?: { status?: number } }).response?.status === 403
        ) {
          toast.error('Недостаточно прав для создания курса');
          return;
        }
        console.error('Ошибка создания курса:', err);
        toast.error('Произошла ошибка при создании курса');
      }
    },
    [
      name,
      description,
      tags,
      maxUsersAmount,
      createCourse,
      previewFile,
      canCreateCourse,
    ]
  );

  const handleTagAdd = useCallback((tag: string) => {
    setTags(prevTags =>
      prevTags.includes(tag) ? prevTags : [...prevTags, tag]
    );
  }, []);

  const handleTagRemove = useCallback((tag: string) => {
    setTags(prevTags => prevTags.filter(existingTag => existingTag !== tag));
  }, []);

  const handlePreviewChange = useCallback((file: File | null, url: string) => {
    setPreviewFile(file);
    setPreviewUrl(url);
  }, []);

  return (
    <>
      <Header />
      <div className={styles.container}>
        <form onSubmit={handleSubmit} className={styles.form}>
          <CourseMainInfo
            name={name}
            description={description}
            previewUrl={previewUrl}
            isLoading={isLoading}
            onNameChange={setName}
            onDescriptionChange={setDescription}
            onPreviewChange={handlePreviewChange}
          />

          <CourseVisitorsInfo
            tagInput={tagInput}
            tags={tags}
            maxUsersAmount={maxUsersAmount}
            isLoading={isLoading}
            onTagInputChange={setTagInput}
            onTagAdd={handleTagAdd}
            onTagRemove={handleTagRemove}
            onMaxUsersAmountChange={setMaxUsersAmount}
          />

          <CourseButton
            type="submit"
            className={styles.publishCourse}
            disabled={isLoading || !canCreateCourse}
          >
            {isLoading ? 'Создание' : 'Опубликовать курс'}
          </CourseButton>
        </form>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />

      <Footer />
    </>
  );
};

export default CreateCoursePage;
