interface RecipeSeriesTagProps {
  series: string;
}

export const RecipeSeriesTag = ({ series }: RecipeSeriesTagProps) => {
  return (
    <div className="inline-flex items-center px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-sm font-medium">
      {series}
    </div>
  );
};
