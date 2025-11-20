const FoodCard = () => {
  return (
    <div className="bg-white rounded-2xl p-3 shadow-sm aspect-[3/4] flex flex-col relative overflow-hidden">
      <div className="absolute top-3 left-3 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-full backdrop-blur-sm">
        大陸A菜
      </div>
      <div className="flex-1 bg-neutral-100 rounded-xl mb-2"></div>
      <div className="flex justify-between items-end">
        <div>
          <p className="text-xs text-neutral-500">剩餘</p>
          <p className="text-lg font-bold text-neutral-900">6</p>
        </div>
        <div className="text-[10px] text-neutral-400 text-right">
          <p>請購 2026/01/01</p>
          <p>過期 2026/01/14</p>
        </div>
      </div>
    </div>
  );
};

export default FoodCard;
