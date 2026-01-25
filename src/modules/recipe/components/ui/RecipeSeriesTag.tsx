type RecipeSeriesTagProps = {
  series: string;
  className?: string;
};

export const RecipeSeriesTag = ({
  series,
  className = '',
}: RecipeSeriesTagProps) => {
  return (
    <div
      className={`inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium ${className}`}
    >
      {series}
    </div>
  );
};
