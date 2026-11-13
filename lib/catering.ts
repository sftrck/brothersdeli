// Catering menu — priced per person. Total = headcount × sum of selected items.
// Prices from the live catering menu. Used by both the catering page and the
// /api/catering route so the estimate is priced identically on the server.

import { SANDWICH_NAMES } from "@/lib/menu";

export type CateringChoice = {
  id: string;
  label: string;
  options: string[];
  // Only offered when the headcount is at least this (e.g. a 2nd salad at 20+).
  minHeadcount?: number;
  // Pick several from `options` (checkbox list); empty = let the deli decide.
  multi?: boolean;
  // Pick a quantity for each of `options` (e.g. how many of each sandwich).
  qty?: boolean;
};

// Sentinel option so an optional choice (e.g. the 2nd salad) can be left off.
export const NO_SECOND_SALAD = "No second salad";

// Multi-select trays: "Variety" (the default) means the deli assembles the
// tray; picking specific sandwiches/wraps turns Variety off.
export const VARIETY = "Variety";
// Wraps offered on the Wrap Sandwich Tray.
export const WRAP_TRAY_SANDWICHES = [
  "Southwest Turkey",
  "Turkey Club with Bacon",
  "Ham",
  "Roast Beef",
  "Corned Beef",
  "Pastrami",
  "Chicken",
];
// Budget Box Lunch — pick how many of each (all come with cheese and lettuce).
export const BUDGET_BOX_SANDWICHES = [
  "Deli sandwich with cheese and lettuce",
  "Turkey",
  "Ham",
  "Smoked Turkey",
  "Roast Beef",
  "Corned Beef",
  "Pastrami",
];
// Deluxe Box Lunch / Sandwich & Mini trays — the budget quick-picks (plus Turkey
// with Avocado), then every sandwich on the menu so any one can be chosen.
const DELUXE_QUICK_PICKS = BUDGET_BOX_SANDWICHES.flatMap((s) =>
  s === "Turkey" ? [s, "Turkey with Avocado"] : [s]
);
export const DELUXE_BOX_SANDWICHES = [
  ...DELUXE_QUICK_PICKS,
  ...SANDWICH_NAMES.filter((n) => !DELUXE_QUICK_PICKS.includes(n)),
];
export type CateringItem = {
  id: string;
  name: string;
  desc?: string;
  perPerson: number;
  // Some trays require one or more choices (which salad, which side[s]).
  chooses?: CateringChoice[];
  // Box lunches: let the customer label each box with a name.
  names?: boolean;
};
export type CateringGroup = {
  id: string;
  name: string;
  items: CateringItem[];
};

// Salads a tray can feature, and the sides a sandwich tray can include.
export const CATERING_SALADS = [
  "Caesar",
  "Greek",
  "Cobb",
  "Chopped",
  "Thai Crunch",
  "Trudy's Cranberry Apple",
  "House",
  "Fruited Spinach",
  "Southwest Buffalo",
  "Chinese Chicken",
  "Mediterranean Chicken Quinoa",
  "Moroccan Chicken",
  "Salmon",
  "Caesar Chicken",
];
export const CATERING_SIDES = ["Potato Salad", "Coleslaw", "Chips"];
export const SALAD_TRAY_BREAD = ["Popover", "Cornbread"];
export const BUDGET_SIDES = ["Chips", "Potato Salad", "Coleslaw", "Green Salad"];

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
      { id: "all-american-breakfast", name: "All American Breakfast", desc: "Scrambled eggs, bacon, hash browns, mini rolls", perPerson: 16.0 },
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
      { id: "budget-box-lunch", name: "Budget Box Lunch", desc: "Deli sandwich, chips and a sweet", perPerson: 16.99, names: true, chooses: [{ id: "sandwiches", label: "Sandwiches — pick a quantity of each", options: BUDGET_BOX_SANDWICHES, qty: true }] },
      { id: "deluxe-box-lunch", name: "Deluxe Box Lunch", desc: "Any sandwich, apple, potato salad or chips, and a sweet", perPerson: 17.99, names: true, chooses: [{ id: "sandwiches", label: "Sandwiches — pick a quantity of each", options: DELUXE_BOX_SANDWICHES, qty: true }] },
      { id: "salad-box-lunch", name: "Salad Box Lunch", desc: "Any salad with a popover, apple and a sweet", perPerson: 17.99, names: true, chooses: [{ id: "salads", label: "Salads — pick a quantity of each", options: CATERING_SALADS, qty: true }] },
    ],
  },
  {
    id: "deli-bakery-trays",
    name: "Deli & Bakery Trays",
    items: [
      { id: "salad-tray", name: "Salad Tray", desc: "Any of our salads with a side", perPerson: 14.99, chooses: [{ id: "salad", label: "Choose a salad", options: CATERING_SALADS }, { id: "bread", label: "Choose a side", options: SALAD_TRAY_BREAD }] },
      { id: "meat-cheese-tray", name: "Meat & Cheese Tray", desc: "Corned beef, roast beef, ham, turkey, cheeses, dills and bread — served with potato salad", perPerson: 14.99 },
      { id: "budget-sandwich-tray", name: "Budget Sandwich Tray", desc: "A variety of sandwiches with cheese, lettuce, tomatoes, condiments and kosher dill, plus a mini dessert. Served with two sides.", perPerson: 17.99, chooses: [{ id: "side1", label: "First side", options: BUDGET_SIDES }, { id: "side2", label: "Second side", options: BUDGET_SIDES }, { id: "sandwiches", label: "Pick your sandwiches (or let the deli decide)", options: BUDGET_BOX_SANDWICHES, multi: true }] },
      { id: "sandwich-tray", name: "Sandwich Tray", desc: "Variety of sandwiches, cheese and dills", perPerson: 14.99, chooses: [{ id: "side", label: "Choose a side", options: CATERING_SIDES }, { id: "sandwiches", label: "Pick your sandwiches (or let the deli decide)", options: BUDGET_BOX_SANDWICHES, multi: true }] },
      { id: "wrap-sandwich-tray", name: "Wrap Sandwich Tray", desc: "Any sandwich or salad can be made into a wrap — your pick or the deli's.", perPerson: 14.99, chooses: [{ id: "side", label: "Choose a side", options: CATERING_SIDES }, { id: "sandwiches", label: "Pick your wraps (or let the deli decide)", options: WRAP_TRAY_SANDWICHES, multi: true }] },
      { id: "mini-sandwich-salad-tray", name: "Mini Sandwich & Salad Tray", desc: "Mini sandwiches plus a salad. Orders of 20 or more can pick a second salad.", perPerson: 14.99, chooses: [{ id: "sandwiches", label: "Pick your sandwiches (or let the deli decide)", options: BUDGET_BOX_SANDWICHES, multi: true }, { id: "salad", label: "Choose a salad", options: CATERING_SALADS }, { id: "salad2", label: "Second salad (20+ people)", options: [NO_SECOND_SALAD, ...CATERING_SALADS], minHeadcount: 20 }] },
      { id: "vegetable-tray", name: "Vegetable Tray", perPerson: 5.95 },
      { id: "fresh-fruit-tray", name: "Fresh Fruit Tray", desc: "Seasonal melons, pineapple, grapes and more", perPerson: 6.45 },
      { id: "cookies-tray", name: "Cookies", perPerson: 4.45, chooses: [{ id: "size", label: "Cookie size", options: ["Big cookies", "Small cookies (cut in half)"] }] },
      { id: "brownies-bars-tray", name: "Brownies & Bars", perPerson: 7.95, chooses: [{ id: "size", label: "Size", options: ["Big", "Small (cut in half)"] }] },
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
