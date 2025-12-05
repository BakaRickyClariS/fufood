import { useParams } from 'react-router-dom';
import { SharedListDetail as Feature } from '@/modules/planning/components/features/SharedListDetail';

const SharedListDetail = () => {
  const { listId } = useParams();
  return <Feature listId={listId} />;
};

export default SharedListDetail;
