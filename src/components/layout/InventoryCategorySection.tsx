import InventoryCard from '@/components/ui/InventoryCard';

import fruitImg from '@/assets/images/inventory/fruit.png';
import frozenImg from '@/assets/images/inventory/frozen.png';
import bakeImg from '@/assets/images/inventory/bake.png';
import milkImg from '@/assets/images/inventory/milk.png';
import seafoodImg from '@/assets/images/inventory/seafood.png';
import meatImg from '@/assets/images/inventory/meat.png';
import otherImg from '@/assets/images/inventory/other.png';

type CategoryItem = {
  id: string;
  title: string;
  value: number;
  img: string;
  bgColor: string;
};

const categories: CategoryItem[] = [
  {
    id: 'fruit',
    title: '蔬果類 (92)',
    value: 92,
    img: fruitImg,
    bgColor: 'bg-[#D8EBC5]',
  },
  {
    id: 'frozen',
    title: '冷凍調理類 (252)',
    value: 252,
    img: frozenImg,
    bgColor: 'bg-[#FFE895]',
  },
  {
    id: 'bake',
    title: '主食烘焙類 (49)',
    value: 49,
    img: bakeImg,
    bgColor: 'bg-[#FFD6E3]',
  },
  {
    id: 'milk',
    title: '乳製品飲料類 (3)',
    value: 3,
    img: milkImg,
    bgColor: 'bg-[#DDF0FF]',
  },
  {
    id: 'seafood',
    title: '冷凍海鮮類 (20)',
    value: 20,
    img: seafoodImg,
    bgColor: 'bg-[#FFC5A4]',
  },
  {
    id: 'meat',
    title: '肉品類 (8)',
    value: 8,
    img: meatImg,
    bgColor: 'bg-[#FFD4D4]',
  },
  {
    id: 'others',
    title: '其他 (6)',
    value: 6,
    img: otherImg,
    bgColor: 'bg-[#E2E2E2]',
  },
];

// 2. 強型別 chunkTwo()
const chunkTwo = (arr: CategoryItem[]): CategoryItem[][] => {
  const result: CategoryItem[][] = [];
  for (let i = 0; i < arr.length; i += 2) {
    result.push(arr.slice(i, i + 2));
  }
  return result;
};

const InventoryCategorySection = () => {
  const first: CategoryItem = categories[0];
  const groups: CategoryItem[][] = chunkTwo(categories.slice(1));

  return (
    <section className="px-4 mt-6">
      <div className="flex flex-col gap-4 max-w-[800px] mx-auto">
        {/* 大卡片 */}
        <InventoryCard
          title={first.title}
          value={first.value}
          img={first.img}
          bgColor={first.bgColor}
          borderColor="border-neutral-200"
          boxShadow="shadow-[0_6px_14px_-2px_rgba(0,0,0,0.06)]"
        />

        {/* 小卡片（每列 2 張） */}
        {groups.map((pair) => (
          <div key={pair[0].id} className="grid grid-cols-2 gap-4">
            {pair.map((item) => (
              <InventoryCard
                key={item.id}
                title={item.title}
                value={item.value}
                img={item.img}
                bgColor={item.bgColor}
                borderColor="border-neutral-200"
                boxShadow="shadow-[0_6px_14px_-2px_rgba(0,0,0,0.06)]"
              />
            ))}
          </div>
        ))}
      </div>
    </section>
  );
};

export default InventoryCategorySection;
