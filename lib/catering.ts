// Catering menu — priced per person. Total = headcount × sum of selected items.
// Prices from the live catering menu. Used by both the catering page and the
// /api/catering route so the estimate is priced identically on the server.

export type CateringItem = {
  id: string;
  name: string;
  desc?: string;
  perPerson: number;
};
export type CateringGroup = {
  id: string;
  name: string;
  items: CateringItem[];
};

export const CATERING: CateringGroup[] = [
  {
    id: "breakfast-trays",
    name: "Breakfast Trays",
    items: [
      { id: "bagel-tray", name: "Bagel Tray", desc: "Assorted bagels, cream cheese, strawberry jam, sweet butter", perPerson: 5.95 },
      { id: "muffins-bagels-tray", name: "Muffins & Bagels Tray", desc: "Baked muffins and bagels, butter and cream cheese", perPerson: 5.95 },
      { id: "breakfast-tray", name: "Breakfast Tray", desc: "Cinnamon & caramel rolls, muffins, coffee cake, bagels", perPerson: 5.95 },
      { id: "bagel-egg-sandwich-tray", name: "Bagel & Egg Sandwich Tray", desc: "Egg, cheese, ham, sausage, bacon", perPerson: 9.45 },
    ],
  },
  {
    id: "hot-breakfast",
    name: "Hot Breakfast",
    items: [
      { id: "all-american-breakfast", name: "All American Breakfast", desc: "Scrambled eggs, toast, bacon, hash browns, mini rolls", perPerson: 16.0 },
      { id: "sunrise-scramble", name: "Sunrise Scramble", desc: "Scrambled eggs, mushrooms, red peppers, onions", perPerson: 10.0 },
      { id: "mexican-scramble", name: "Mexican Scramble", desc: "Scrambled eggs, sausage, peppers, onions; salsa & sour cream", perPerson: 10.0 },
      { id: "western-scramble", name: "Western Scramble", desc: "Scrambled eggs, ham, red peppers, onions", perPerson: 10.0 },
    ],
  },
  {
    id: "hot-lunches",
    name: "Hot Lunches",
    items: [
      { id: "sloppy-joe", name: "Homemade Sloppy Joe", desc: "Coleslaw, chips and pickles", perPerson: 15.99 },
      { id: "rosemary-chicken", name: "Rosemary Chicken", desc: "Red potatoes, green beans, rolls and butter", perPerson: 15.99 },
      { id: "hot-turkey-meal", name: "Hot Turkey Meal", desc: "Garlic mashed potatoes, gravy, rolls, salad", perPerson: 15.99 },
      { id: "bbq-beef", name: "BBQ Beef", desc: "Coleslaw, chips, pickles", perPerson: 15.99 },
      { id: "bbq-pork", name: "BBQ Pork", desc: "Coleslaw, chips, pickles", perPerson: 15.99 },
    ],
  },
  {
    id: "box-lunches",
    name: "Box Lunches",
    items: [
      { id: "budget-box-lunch", name: "Budget Box Lunch", desc: "Deli sandwich, chips and a sweet", perPerson: 16.99 },
      { id: "deluxe-box-lunch", name: "Deluxe Box Lunch", desc: "Any sandwich, apple, potato salad or chips, and a sweet", perPerson: 17.99 },
      { id: "salad-box-lunch", name: "Salad Box Lunch", desc: "Any salad with a popover, apple and a sweet", perPerson: 17.99 },
    ],
  },
  {
    id: "deli-bakery-trays",
    name: "Deli & Bakery Trays",
    items: [
      { id: "salad-tray", name: "Salad Tray", desc: "Any of our salads with popovers", perPerson: 14.99 },
      { id: "meat-cheese-tray", name: "Meat & Cheese Tray", desc: "Corned beef, roast beef, ham, turkey, cheeses, dills, bread", perPerson: 14.99 },
      { id: "sandwich-tray", name: "Sandwich Tray", desc: "Variety of sandwiches, cheese, dills, potato salad or slaw", perPerson: 14.99 },
      { id: "wrap-sandwich-tray", name: "Wrap Sandwich Tray", desc: "Variety of wrap sandwiches with sides", perPerson: 14.99 },
      { id: "mini-sandwich-salad-tray", name: "Mini Sandwich & Salad Tray", desc: "Mini sandwiches plus any one salad", perPerson: 14.99 },
      { id: "vegetable-tray", name: "Vegetable Tray", perPerson: 5.95 },
      { id: "fresh-fruit-tray", name: "Fresh Fruit Tray", desc: "Seasonal melons, pineapple, grapes and more", perPerson: 6.45 },
      { id: "cookies-tray", name: "Cookies", perPerson: 4.45 },
      { id: "brownies-bars-tray", name: "Brownies & Bars", perPerson: 7.95 },
    ],
  },
];

export const CATERING_MIN_HEADCOUNT = 8;

export function findCateringItem(id: string): CateringItem | undefined {
  for (const g of CATERING) {
    const it = g.items.find((i) => i.id === id);
    if (it) return it;
  }
  return undefined;
}
