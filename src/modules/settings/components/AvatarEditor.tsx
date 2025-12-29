import { Edit2 } from 'lucide-react';

type AvatarEditorProps = {
  src?: string;
  alt: string;
  onEdit?: () => void;
};

const AvatarEditor = ({ src, alt, onEdit }: AvatarEditorProps) => {
  return (
    <div className="relative inline-block">
      <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-sm bg-primary-50">
        {src ? (
          <img src={src} alt={alt} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-primary-300 text-3xl font-bold">
            {alt.charAt(0)}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={onEdit}
        className="absolute bottom-0 right-0 w-8 h-8 bg-[#F68072] hover:bg-[#E57366] text-white rounded-full flex items-center justify-center shadow-sm transition-colors border-2 border-white"
      >
        <Edit2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default AvatarEditor;
