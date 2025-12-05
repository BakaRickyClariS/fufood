import { useParams } from 'react-router-dom';
import { CreatePostFeature } from '@/modules/planning/components/features/CreatePost';

const CreatePost = () => {
  const { listId } = useParams();
  return <CreatePostFeature listId={listId} />;
};

export default CreatePost;
