// This file is deprecated in favor of the modal-based PostFormFeature inside SharedListDetail
// But we keep the export to avoid breaking other imports temporarily if any relative import exists (though we fixed most)
// Actually, since we are using PostFormFeature directly, we can just make this file a pass-through or empty component if needed.
// However, the error was "Module ... has no exported member 'CreatePostFeature'".
// Since we renamed it to PostFormFeature in the file `d:\...\modules\planning\components\features\CreatePost.tsx`,
// we need to update the import here IF we still use this route.
// But we are moving away from the route.
// To fix the build error TS2305 quickly:

import { PostFormFeature } from '@/modules/planning/components/features/CreatePost';

// We just export it as CreatePostFeature alias if needed, or update usage.
export { PostFormFeature as CreatePostFeature };

const CreatePostRoute = () => {
    return null; // Route is deprecated
};
export default CreatePostRoute;
