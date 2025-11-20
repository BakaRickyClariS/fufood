import americanSoft from '@/assets/images/foods/americanSoft.png';
import banana from '@/assets/images/foods/banana.png';
import breakfastLeftover from '@/assets/images/foods/breakfastLeftover.png';
import butterRoll from '@/assets/images/foods/butterRoll.png';
import cabbage from '@/assets/images/foods/cabbage.png';
import carrot from '@/assets/images/foods/carrot.png';
import cauliflower from '@/assets/images/foods/cauliflower.png';
import cinnamonRoll from '@/assets/images/foods/cinnamonRoll.png';
import citrus from '@/assets/images/foods/citrus.png';
import freshToast from '@/assets/images/foods/freshToast.png';
import freshUdon from '@/assets/images/foods/freshUdon.png';
import frozenBerries from '@/assets/images/foods/frozenBerries.png';
import frozenCabbage from '@/assets/images/foods/frozenCabbage.png';
import lemonIce from '@/assets/images/foods/iceCream.png';
import lemonTart from '@/assets/images/foods/lemon.png';
import mainlandAchoy from '@/assets/images/foods/mainlandAchoy.png';
import persimmon from '@/assets/images/foods/persimmon.png';
import rice from '@/assets/images/foods/rice.png';
import skinOn from '@/assets/images/foods/skinOn.png';
import strawBerries from '@/assets/images/foods/strawBerries.png';
import edamame from '@/assets/images/foods/edamame.png';
import mexicanPotato from '@/assets/images/foods/mexicanPotato.png';
import frozenCauliflower from '@/assets/images/foods/frozenCauliflower.png';
import chocoIceCream from '@/assets/images/foods/chocoIceCream.png';

export interface FoodItem {
  name: string;
  img: {
    alt: string;
    src: string;
  };
  quantity: number;
  addedAt: string;
  expireAt: string;
}

const vegList: FoodItem[] = [
  {
    name: '大陸A菜',
    img: { alt: 'mainlandAchoy', src: mainlandAchoy },
    quantity: 6,
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
  },
  {
    name: '結球甘藍',
    img: { alt: 'cabbage', src: cabbage },
    quantity: 24,
    addedAt: '2026/01/01',
    expireAt: '2026/01/05',
  },
  {
    name: '白花椰菜',
    img: { alt: 'cauliflower', src: cauliflower },
    quantity: 1,
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
  },
  {
    name: '好市多香蕉',
    img: { alt: 'banana', src: banana },
    quantity: 10,
    addedAt: '2025/12/28',
    expireAt: '2026/02/03',
  },
  {
    name: '紅羅蔔',
    img: { alt: 'carrot', src: carrot },
    quantity: 5,
    addedAt: '2026/01/05',
    expireAt: '2026/01/13',
  },
];

const fruitList: FoodItem[] = [
  {
    name: '柑橘',
    img: { alt: 'citrus', src: citrus },
    quantity: 3,
    addedAt: '2026/01/01',
    expireAt: '2026/01/31',
  },
  {
    name: '柿子',
    img: { alt: 'persimmon', src: persimmon },
    quantity: 3,
    addedAt: '2026/01/03',
    expireAt: '2026/02/10',
  },
  {
    name: '苗栗內湖草莓',
    img: { alt: 'strawBerries', src: strawBerries },
    quantity: 40,
    addedAt: '2026/01/06',
    expireAt: '2026/01/14',
  },
];

const frozenList: FoodItem[] = [
  {
    name: '帶皮薯條',
    img: { alt: 'skinOn', src: skinOn },
    quantity: 50,
    addedAt: '2026/01/01',
    expireAt: '2026/01/10',
  },
  {
    name: '冷凍富麗菜水餃',
    img: { alt: 'frozenCabbage', src: frozenCabbage },
    quantity: 40,
    addedAt: '2025/11/01',
    expireAt: '2026/01/02',
  },
  {
    name: '冷凍莓果',
    img: { alt: 'frozenBerries', src: frozenBerries },
    quantity: 30,
    addedAt: '2026/01/05',
    expireAt: '2026/01/13',
  },
  {
    name: '冷凍毛豆',
    img: { alt: 'edamame', src: edamame },
    quantity: 40,
    addedAt: '2025/12/25',
    expireAt: '2026/01/31',
  },
  {
    name: '墨西哥薯球',
    img: { alt: 'mexicanPotato', src: mexicanPotato },
    quantity: 50,
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
  },
  {
    name: '冷凍花椰菜',
    img: { alt: 'frozenCauliflower', src: frozenCauliflower },
    quantity: 50,
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
  },
];

const dessertList: FoodItem[] = [
  {
    name: '檸檬冰淇淋',
    img: { alt: 'lemonIce', src: lemonIce },
    quantity: 1,
    addedAt: '2026/12/01',
    expireAt: '2026/12/05',
  },
  {
    name: '桶裝巧克力冰淇淋',
    img: { alt: 'chocoIceCream', src: chocoIceCream },
    quantity: 1,
    addedAt: '2026/01/01',
    expireAt: '2026/03/06',
  },
  {
    name: '肉桂捲',
    img: { alt: 'cinnamonRoll', src: cinnamonRoll },
    quantity: 9,
    addedAt: '2026/01/01',
    expireAt: '2026/01/10',
  },
  {
    name: '美式軟餅乾',
    img: { alt: 'americanSoft', src: americanSoft },
    quantity: 20,
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
  },
  {
    name: '檸檬塔',
    img: { alt: 'lemonTart', src: lemonTart },
    quantity: 2,
    addedAt: '2026/01/01',
    expireAt: '2026/01/05',
  },
];

const staplesList: FoodItem[] = [
  {
    name: '原味生吐司',
    img: { alt: 'freshToast', src: freshToast },
    quantity: 1,
    addedAt: '2026/01/01',
    expireAt: '2026/01/03',
  },
  {
    name: '早餐沒吃完的三明治',
    img: { alt: 'breakfastLeftover', src: breakfastLeftover },
    quantity: 1,
    addedAt: '2026/01/01',
    expireAt: '2026/01/14',
  },
  {
    name: '米',
    img: { alt: 'rice', src: rice },
    quantity: 1,
    addedAt: '2026/01/01',
    expireAt: '2027/01/05',
  },
  {
    name: '生烏龍麵',
    img: { alt: 'freshUdon', src: freshUdon },
    quantity: 3,
    addedAt: '2026/01/01',
    expireAt: '2026/01/21',
  },
  {
    name: '奶油餐包',
    img: { alt: 'butterRoll', src: butterRoll },
    quantity: 12,
    addedAt: '2026/01/05',
    expireAt: '2026/01/13',
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
