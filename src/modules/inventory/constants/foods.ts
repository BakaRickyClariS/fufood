import americanSoft from '@/assets/images/foods/americanSoft.webp';
import banana from '@/assets/images/foods/banana.webp';
import breakfastLeftover from '@/assets/images/foods/breakfastLeftover.webp';
import butterRoll from '@/assets/images/foods/butterRoll.webp';
import cabbage from '@/assets/images/foods/cabbage.webp';
import carrot from '@/assets/images/foods/carrot.webp';
import cauliflower from '@/assets/images/foods/cauliflower.webp';
import cinnamonRoll from '@/assets/images/foods/cinnamonRoll.webp';
import citrus from '@/assets/images/foods/citrus.webp';
import freshToast from '@/assets/images/foods/freshToast.webp';
import freshUdon from '@/assets/images/foods/freshUdon.webp';
import frozenBerries from '@/assets/images/foods/frozenBerries.webp';
import frozenCabbage from '@/assets/images/foods/frozenCabbage.webp';
import lemonIce from '@/assets/images/foods/iceCream.webp';
import lemonTart from '@/assets/images/foods/lemon.webp';
import mainlandAchoy from '@/assets/images/foods/mainlandAchoy.webp';
import persimmon from '@/assets/images/foods/persimmon.webp';
import rice from '@/assets/images/foods/rice.webp';
import skinOn from '@/assets/images/foods/skinOn.webp';
import strawBerries from '@/assets/images/foods/strawBerries.webp';
import edamame from '@/assets/images/foods/edamame.webp';
import mexicanPotato from '@/assets/images/foods/mexicanPotato.webp';
import frozenCauliflower from '@/assets/images/foods/frozenCauliflower.webp';
import chocoIceCream from '@/assets/images/foods/chocoIceCream.webp';

export type FoodItem = {
  id: string;
  name: string;
  img: {
    alt: string;
    src: string;
  };
  quantity: number;
  unit: string;
  addedAt: string;
  expireAt: string;
  notes?: string;
  category?: string;
};

const vegList: FoodItem[] = [
  {
    id: 'veg-1',
    name: '大陸A菜',
    img: { alt: 'mainlandAchoy', src: mainlandAchoy },
    quantity: 6,
    unit: '把',
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
    notes: '好市多購入，季節限定',
    category: '蔬果類',
  },
  {
    id: 'veg-2',
    name: '結球甘藍',
    img: { alt: 'cabbage', src: cabbage },
    quantity: 24,
    unit: '顆',
    addedAt: '2026/01/01',
    expireAt: '2026/01/05',
    notes: '有機種植',
    category: '蔬果類',
  },
  {
    id: 'veg-3',
    name: '白花椰菜',
    img: { alt: 'cauliflower', src: cauliflower },
    quantity: 1,
    unit: '顆',
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
    category: '蔬果類',
  },
  {
    id: 'veg-4',
    name: '好市多香蕉',
    img: { alt: 'banana', src: banana },
    quantity: 10,
    unit: '根',
    addedAt: '2025/12/28',
    expireAt: '2026/02/03',
    category: '蔬果類',
  },
  {
    id: 'veg-5',
    name: '紅羅蔔',
    img: { alt: 'carrot', src: carrot },
    quantity: 5,
    unit: '根',
    addedAt: '2026/01/05',
    expireAt: '2026/01/13',
    category: '蔬果類',
  },
];

const fruitList: FoodItem[] = [
  {
    id: 'fruit-1',
    name: '柑橘',
    img: { alt: 'citrus', src: citrus },
    quantity: 3,
    unit: '顆',
    addedAt: '2026/01/01',
    expireAt: '2026/01/31',
    category: '蔬果類',
  },
  {
    id: 'fruit-2',
    name: '柿子',
    img: { alt: 'persimmon', src: persimmon },
    quantity: 3,
    unit: '顆',
    addedAt: '2026/01/03',
    expireAt: '2026/02/10',
    category: '蔬果類',
  },
  {
    id: 'fruit-3',
    name: '苗栗內湖草莓',
    img: { alt: 'strawBerries', src: strawBerries },
    quantity: 40,
    unit: '顆',
    addedAt: '2026/01/06',
    expireAt: '2026/01/14',
    category: '蔬果類',
  },
];

const frozenList: FoodItem[] = [
  {
    id: 'frozen-1',
    name: '帶皮薯條',
    img: { alt: 'skinOn', src: skinOn },
    quantity: 50,
    unit: '根',
    addedAt: '2026/01/01',
    expireAt: '2026/01/10',
    category: '冷凍類',
  },
  {
    id: 'frozen-2',
    name: '冷凍富麗菜水餃',
    img: { alt: 'frozenCabbage', src: frozenCabbage },
    quantity: 40,
    unit: '顆',
    addedAt: '2025/11/01',
    expireAt: '2026/01/02',
    category: '冷凍類',
  },
  {
    id: 'frozen-3',
    name: '冷凍莓果',
    img: { alt: 'frozenBerries', src: frozenBerries },
    quantity: 30,
    unit: '顆',
    addedAt: '2026/01/05',
    expireAt: '2026/01/13',
    category: '冷凍類',
  },
  {
    id: 'frozen-4',
    name: '冷凍毛豆',
    img: { alt: 'edamame', src: edamame },
    quantity: 40,
    unit: '顆',
    addedAt: '2025/12/25',
    expireAt: '2026/01/31',
    category: '冷凍類',
  },
  {
    id: 'frozen-5',
    name: '墨西哥薯球',
    img: { alt: 'mexicanPotato', src: mexicanPotato },
    quantity: 50,
    unit: '顆',
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
    category: '冷凍類',
  },
  {
    id: 'frozen-6',
    name: '冷凍花椰菜',
    img: { alt: 'frozenCauliflower', src: frozenCauliflower },
    quantity: 50,
    unit: '顆',
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
    category: '冷凍類',
  },
];

const dessertList: FoodItem[] = [
  {
    id: 'dessert-1',
    name: '檸檬冰淇淋',
    img: { alt: 'lemonIce', src: lemonIce },
    quantity: 1,
    unit: '桶',
    addedAt: '2026/12/01',
    expireAt: '2026/12/05',
    category: '其他',
  },
  {
    id: 'dessert-2',
    name: '桶裝巧克力冰淇淋',
    img: { alt: 'chocoIceCream', src: chocoIceCream },
    quantity: 1,
    unit: '桶',
    addedAt: '2026/01/01',
    expireAt: '2026/03/06',
    category: '其他',
  },
  {
    id: 'dessert-3',
    name: '肉桂捲',
    img: { alt: 'cinnamonRoll', src: cinnamonRoll },
    quantity: 9,
    unit: '顆',
    addedAt: '2026/01/01',
    expireAt: '2026/01/10',
    category: '其他',
  },
  {
    id: 'dessert-4',
    name: '美式軟餅乾',
    img: { alt: 'americanSoft', src: americanSoft },
    quantity: 20,
    unit: '片',
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
    category: '其他',
  },
  {
    id: 'dessert-5',
    name: '檸檬塔',
    img: { alt: 'lemonTart', src: lemonTart },
    quantity: 2,
    unit: '個',
    addedAt: '2026/01/01',
    expireAt: '2026/01/05',
    category: '其他',
  },
];

const staplesList: FoodItem[] = [
  {
    id: 'staple-1',
    name: '原味生吐司',
    img: { alt: 'freshToast', src: freshToast },
    quantity: 1,
    unit: '條',
    addedAt: '2026/01/01',
    expireAt: '2026/01/03',
    category: '主食',
  },
  {
    id: 'staple-2',
    name: '早餐沒吃完的三明治',
    img: { alt: 'breakfastLeftover', src: breakfastLeftover },
    quantity: 1,
    unit: '個',
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
    category: '主食',
  },
  {
    id: 'staple-3',
    name: '米',
    img: { alt: 'rice', src: rice },
    quantity: 1,
    unit: '包',
    addedAt: '2026/01/01',
    expireAt: '2027/01/05',
    category: '主食',
  },
  {
    id: 'staple-4',
    name: '生烏龍麵',
    img: { alt: 'freshUdon', src: freshUdon },
    quantity: 3,
    unit: '包',
    addedAt: '2026/01/01',
    expireAt: '2026/01/21',
    category: '主食',
  },
  {
    id: 'staple-5',
    name: '奶油餐包',
    img: { alt: 'butterRoll', src: butterRoll },
    quantity: 12,
    unit: '個',
    addedAt: '2026/01/05',
    expireAt: '2026/01/13',
    category: '主食',
  },
];

export const foodData: Record<string, FoodItem[]> = {
  fruit: [...vegList, ...fruitList],
  frozen: frozenList,
  bake: staplesList,
  milk: [],
  seafood: [],
  meat: [],
  others: dessertList,
};
