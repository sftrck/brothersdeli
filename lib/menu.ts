// The Brothers Deli — complete menu.
// Prices are the current live ("old site") prices, per owner instruction.
// A `variants` item is priced per size; otherwise `price` (USD) is used.

export type MenuVariant = { label: string; price: number };

// A selectable choice within an option. `price` (if set) is added to the item.
export type OptionChoice = { label: string; price?: number };
// A customization on an item: a required single-select (e.g. bread, cookie
// flavor) or an optional add-on single-select (e.g. add cheese, add protein).
export type MenuOption = {
  id: string;
  label: string;
  required?: boolean;
  choices: OptionChoice[];
};

export type MenuItem = {
  id: string;
  name: string;
  desc?: string;
  price?: number;
  variants?: MenuVariant[];
  options?: MenuOption[];
  // Sub-section heading shown above this item within its category (e.g. the
  // meat groups inside Sandwiches). Set on the first item of each group.
  group?: string;
};
export type MenuCategory = {
  id: string;
  name: string;
  note?: string;
  items: MenuItem[];
};

// ---- Shared customization option sets ----
const BREADS: OptionChoice[] = [
  { label: "Whole Wheat" },
  { label: "Egg Bread" },
  { label: "Sourdough" },
  { label: "Rye" },
  { label: "Pumpernickel" },
  { label: "Ciabatta" },
];
const CHEESES: OptionChoice[] = [
  { label: "Swiss", price: 1.25 },
  { label: "Cheddar", price: 1.25 },
  { label: "Provolone", price: 1.25 },
  { label: "Pepper Jack", price: 1.25 },
  { label: "Havarti", price: 1.25 },
];
const COOKIE_FLAVORS: OptionChoice[] = [
  { label: "Chocolate Chip" },
  { label: "Peanut Butter Chocolate Chip" },
  { label: "Butterfinger Chocolate Chip" },
  { label: "Heath Chocolate Chip" },
  { label: "Reese's Stuffed Peanut Butter" },
  { label: "Nutella" },
  { label: "Milky Way" },
  { label: "Snickers" },
  { label: "Butterscotch Coconut" },
  { label: "Almond Joy" },
  { label: "Lemon Crème" },
];
const breadOption = (choices: OptionChoice[] = BREADS): MenuOption => ({
  id: "bread",
  label: "Choose your bread",
  required: true,
  choices,
});
const cheeseOption: MenuOption = {
  id: "cheese",
  label: "Add cheese (+$1.25)",
  choices: CHEESES,
};
const proteinOption: MenuOption = {
  id: "protein",
  label: "Add protein",
  choices: [
    { label: "Add chicken", price: 2.5 },
    { label: "Add salmon", price: 4.5 },
  ],
};
const soupSide: MenuOption = {
  id: "side",
  label: "Choose a side",
  required: true,
  choices: [{ label: "Popover" }, { label: "Cornbread" }],
};
const dinaMeat: MenuOption = {
  id: "meat",
  label: "Choose your meat",
  required: true,
  choices: [{ label: "Corned Beef" }, { label: "Pastrami" }],
};
// Common bundles
const breadAndCheese: MenuOption[] = [breadOption(), cheeseOption];

export const MENU: MenuCategory[] = [
  {
    id: "breakfast",
    name: "Breakfast",
    note: "Egg sandwiches on a bagel or wrap. Add tomatoes $0.95, avocado $2.95.",
    items: [
      { id: "egg-only", name: "Egg Only", price: 5.95 },
      { id: "egg-cheese", name: "Egg & Cheese", price: 6.95 },
      { id: "bacon-egg-cheese", name: "Applewood Bacon, Egg & Cheese", price: 9.45 },
      { id: "ham-egg-cheese", name: "Ham, Egg & Cheese", price: 9.45 },
      { id: "pastrami-egg-cheese", name: "Pastrami, Egg & Cheese", price: 9.45 },
      { id: "sausage-egg-cheese", name: "Sausage, Egg & Cheese", price: 9.45 },
      {
        id: "power-sandwich",
        name: "Power Sandwich",
        desc: "Two eggs, greens, sausage, tomatoes, pepper jack cheese and avocado on sourdough toast.",
        price: 11.95,
      },
    ],
  },
  {
    id: "sandwiches",
    name: "Sandwiches",
    note: "All sandwiches come with chips and a pickle. Substitute potato salad on request. Breads: Egg, Multi-Grain, Rye, Pumpernickel, Sourdough, Ciabatta.",
    items: [
      // Turkey
      {
        id: "turkey-sandwich",
        group: "Turkey",
        name: "Turkey Sandwich",
        desc: "Fresh roasted turkey breast, lettuce, tomatoes on choice of bread.",
        variants: [
          { label: "Whole (1/4 lb)", price: 11.99 },
          { label: "New York (1/2 lb)", price: 17.99 },
        ],
        options: breadAndCheese,
      },
      { id: "misters-special", name: "Misters Special", desc: "Smoked turkey breast, lettuce, tomato, sweet hot mustard on choice of bread.", price: 13.5, options: [breadOption([{ label: "Egg Bread" }, { label: "Whole Wheat" }]), cheeseOption] },
      { id: "holy-smokes", name: "Holy Smokes", desc: "Hot turkey pastrami, tomatoes, sweet red onions, Russian dressing and melted provolone on rustic ciabatta.", price: 14.0 },
      { id: "miyas-dc-delight", name: "Miyas D.C. Delight", desc: "Fresh roast turkey, baby spinach, cranberry mustard, havarti, tomatoes on sweet grain bread.", price: 14.0 },
      { id: "turkey-melt", name: "Turkey Melt", desc: "Turkey, sweet red onions, tomatoes, melted pepperjack and jionaise on grilled rye.", price: 14.0 },
      { id: "kennys-california-reuben", name: "Kenny's California Reuben", desc: "Smoked turkey, cole slaw, Swiss and Russian dressing on grilled rye or pumpernickel.", price: 14.0, options: [breadOption([{ label: "Rye" }, { label: "Pumpernickel" }]), cheeseOption] },
      { id: "brother-len", name: "Brother Len", desc: "Roasted turkey topped with creamy cole slaw and dressing on egg bread.", price: 13.5 },
      { id: "mama-dora", name: "Mama Dora", desc: "Fresh roasted turkey, avocado, tomatoes and honey mustard on sourdough or wheat.", price: 14.0 },
      { id: "turkey-clubhouse", name: "Turkey Clubhouse", desc: "Grilled turkey, applewood bacon, tomatoes, swiss and Russian dressing on egg bread.", price: 14.0 },
      // Corned Beef
      {
        id: "louies-corned-beef",
        group: "Corned Beef",
        name: "Louies Corned Beef Sandwich",
        desc: "House made corned beef — cured for 10 days — on crusty Jewish rye.",
        variants: [
          { label: "Whole", price: 14.0 },
          { label: "New York", price: 18.5 },
        ],
        options: [cheeseOption],
      },
      { id: "dinas-delight", name: "Dina's Delight", desc: "Hot corned beef or pastrami, homemade cole slaw and Russian dressing on double baked rye.", price: 14.5, options: [dinaMeat] },
      { id: "brothers-reuben", name: "Brothers Reuben", desc: "Corned beef, Swiss, sauerkraut and Russian dressing on grilled rye or pumpernickel.", price: 14.5, options: [breadOption([{ label: "Rye" }, { label: "Pumpernickel" }]), cheeseOption] },
      { id: "danny-rose", name: "Danny Rose", desc: "Our own corned beef and pastrami on a double baked rye.", price: 14.5 },
      { id: "cousin-tony", name: "Cousin Tony", desc: "Hot corned beef and pastrami, tomatoes, swiss, red onions, thousand island on double baked rye.", price: 14.5 },
      { id: "papa-mike", name: "Papa Mike", desc: "Corned beef, fresh roasted turkey, swiss and dressing on grilled rye.", price: 14.5 },
      // Pastrami
      {
        id: "sid-hartmans-favorite",
        group: "Pastrami",
        name: "Sid Hartman's Favorite",
        desc: "Hot tender pastrami on double baked Jewish rye.",
        variants: [
          { label: "Whole", price: 14.0 },
          { label: "New York", price: 18.5 },
        ],
        options: [cheeseOption],
      },
      { id: "messy-bessy", name: "Messy Bessy", desc: "Pastrami, corned beef, tomatoes, cole slaw, swiss, red onion, thousand island on ciabatta.", price: 14.5 },
      { id: "the-pepe", name: "The Pepe", desc: "Pastrami smoked then steamed 3 hours, melted pepper cheese on grilled rye or pumpernickel.", price: 14.5 },
      { id: "pastrami-reuben", name: "Pastrami Reuben", desc: "Pastrami, Swiss, sauerkraut and Russian dressing on grilled rye or pumpernickel.", price: 14.5, options: [breadOption([{ label: "Rye" }, { label: "Pumpernickel" }]), cheeseOption] },
      { id: "the-hots-pepe", name: "The Hots Pepe", desc: "Pastrami, pepper cheese, onion and hot sauce on grilled rye or pumpernickel.", price: 14.5 },
      // Chicken
      { id: "jimbos-buffalo-chicken", group: "Chicken", name: "Jimbo's Buffalo Chicken", desc: "Chicken breast, buffalo sauce, lettuce, tomatoes and blue cheese on ciabatta.", price: 14.0 },
      { id: "spicy-chicken", name: "Spicy Chicken", desc: "Grilled chicken, tomato, red onion, creamy salsa and pepper cheese on ciabatta.", price: 14.0 },
      { id: "chunky-chicken-salad", name: "Daper John's Chunky Chicken Salad", desc: "Tender chicken, mayo, celery, red peppers, seasoning with lettuce and tomato.", price: 12.5, options: breadAndCheese },
      { id: "chicken-blt", name: "Chicken BLT", desc: "Grilled chicken, cheddar, bacon, lettuce and tomato on ciabatta.", price: 14.0 },
      { id: "pesto-chicken", name: "Pesto Chicken", desc: "Roasted chicken breast, tomatoes and pesto mayo on ciabatta.", price: 14.0 },
      // Beef / Brisket
      { id: "big-als-warm-roast-beef", group: "Beef & Brisket", name: "Big Al's Warm Roast Beef", desc: "Garlic roasted tri tip on sourdough, lettuce, tomato, red onion and horseradish sauce.", price: 13.99, options: breadAndCheese },
      { id: "francos-italian-beef", name: "Francos Italian Beef", desc: "Garlic roasted steak, red peppers, banana peppers, horseradish, provolone on ciabatta with Italian dip.", price: 13.99 },
      { id: "davids-french-dip", name: "David's French Dip", desc: "Garlic roasted tri tip on a ciabatta roll with au jus.", price: 13.0, options: [cheeseOption] },
      { id: "garlic-roasted-steak", name: "Garlic Roasted Steak Sandwich", desc: "Steak, red onions, apple smoked bacon and cheddar on garlic toasted ciabatta.", price: 14.5 },
      { id: "bulgogi-works", name: "BUL-GO-GI Works", desc: "Steak marinated in 8 spices, grilled, on a French roll with provolone, peppers and red onions.", price: 14.0 },
      // Pork
      { id: "smoked-ham-sandwich", group: "Pork", name: "Smoked Ham Sandwich", desc: "Choice of bread, lettuce and tomato.", price: 11.5, options: breadAndCheese },
      { id: "ellies-hot-cuban", name: "Ellie's Hot Cuban", desc: "Spicy sausage, smoked ham, pickles, onions, provolone and spicy mustard on ciabatta.", price: 13.99 },
      { id: "the-yessak", name: "The Yessak", desc: "Smoked ham, roasted turkey, sweet hot mustard, cheddar, red onions, tomatoes on sweet grain or challah.", price: 13.99 },
      { id: "real-good-blt", name: "Real Good BLT", desc: "Apple smoked bacon, tomatoes, lettuce and mayo on challah or sweet grain toast.", price: 11.5 },
      { id: "hollywood-joes", name: "Hollywood Joes", desc: "Smoked ham, melted havarti on grilled challah with sweet hot mustard.", price: 13.99 },
      { id: "grownup-grilled-cheese-bacon", name: "Grown Up Grilled Cheese #2", desc: "Grilled cheese with bacon and tomatoes.", price: 12.99 },
      // Fish
      { id: "charlies-tuna-salad", group: "Fish", name: "Charlie's Tuna Salad", desc: "White albacore tuna, red peppers, celery, mayo and lemon, with lettuce and tomato.", price: 12.5, options: breadAndCheese },
      { id: "grilled-salmon-sandwich", name: "Grilled Salmon", desc: "6oz salmon with seafood rub, toasted egg bun, baby spinach, tomatoes and cucumbers.", price: 14.99 },
      { id: "rd-tuna-melt", name: "R and D's Tuna Melt", desc: "White tuna on grilled challah with cheddar and tomatoes.", price: 12.99 },
      { id: "aidens-tuna-avocado-melt", name: "Aiden's Tuna Avocado Melt", desc: "White tuna, melted pepper cheese, avocado and tomato on grilled challah or sweet grain.", price: 12.99 },
      // Veggie
      { id: "brother-b-veggie", group: "Veggie", name: "Brother B-Veggie", desc: "Tomatoes, iceberg, avocado, cucumbers, red peppers, havarti on sweet grain with honey cup dressing.", price: 11.5 },
      { id: "grownup-grilled-cheese-tomatoes", name: "Grown Up Grilled Cheese with Tomatoes", desc: "On challah or sweet grain.", price: 8.99 },
      { id: "cousin-steves-tomato-havarti", name: "Cousin Steve's Tomato Havarti", desc: "Roasted red peppers, tomatoes, havarti, spinach, pesto and vinaigrette on sweet grain.", price: 11.5 },
      { id: "grownup-grilled-cheese", name: "Grown Up Grilled Cheese", desc: "On challah or sweet grain.", price: 7.49 },
      { id: "egg-salad", name: "Egg Salad", desc: "House made with red peppers, green onions and mayo, with lettuce and tomato.", price: 11.5, options: breadAndCheese },
      { id: "grilled-cheese-tomato-soup", name: "Grilled Cheese & Cup of Tomato Soup", desc: "Plain grilled cheese on white with a cup of homemade tomato soup.", price: 14.5 },
      // Burgers
      { id: "burger-plain", group: "Burgers", name: "Plain Burger", desc: "Served with fresh cut fries.", price: 9.99 },
      { id: "bbq-bacon-cheeseburger", name: "BBQ Bacon Cheeseburger", desc: "Served with fresh cut fries.", price: 14.0 },
      { id: "cheeseburger", name: "Cheeseburger", desc: "Served with fresh cut fries.", price: 14.0 },
      { id: "all-american-cheese", name: "All American with Cheese", desc: "6oz ground chuck, lettuce, tomato, onion, special sauce. With fries.", price: 14.0 },
      { id: "the-brothers-burger", name: "The Brothers Burger", desc: "6oz patty, melted cheese, bacon, secret sauce. With fries.", price: 14.0 },
      { id: "patty-melt", name: "Patty Melt", desc: "Grilled pumpernickel, tomatoes, onions, cheese, special sauce. With fries.", price: 14.0 },
    ],
  },
  {
    id: "salads",
    name: "Salads",
    note: "All salads are large and come with a popover. Add chicken $2.50, salmon $4.95.",
    items: [
      { id: "caesar", name: "Caesar", desc: "Romaine mix, Parmesan cheese and croutons with homemade Caesar dressing.", price: 9.99, options: [proteinOption] },
      { id: "greek-salad", name: "Greek Salad", desc: "Romaine mix, feta cheese, onions, banana peppers, croutons, black olives, cucumber, tomatoes with homemade Greek dressing.", price: 14.0, options: [proteinOption] },
      { id: "cobb-salad", name: "Cobb Salad", desc: "Bacon, chicken, tomatoes, blue cheese, avocado, eggs, croutons over mixed greens.", price: 14.0 },
      { id: "pams-strawberry-chicken", name: "Pam's Strawberry Chicken", desc: "Grilled chicken, strawberries, almonds, romaine, creamy poppyseed dressing.", price: 14.0 },
      { id: "chopped-salad", name: "Chopped Salad", desc: "Gorgonzola, tomatoes, cucumbers, green onion, artichokes, romaine, balsamic.", price: 14.0, options: [proteinOption] },
      { id: "moroccan-chicken", name: "Moroccan Chicken", desc: "Chicken, romaine, dates, avocado, almonds, beets, egg, carrots, cranberries, peppers, white balsamic.", price: 14.0 },
      { id: "thai-crunch", name: "Thai Crunch", desc: "Napa & red cabbage, cucumbers, peppers, edamame, carrots, peanuts, wontons, chicken, spicy peanut.", price: 15.99 },
      { id: "chinese-chicken-salad", name: "Chinese Chicken Salad", desc: "Crispy noodles, almonds, red peppers, green onions, mandarin oranges, chicken, wontons and romaine mix with homemade sweet and sour dressing.", price: 14.0 },
      { id: "trudys-cranberry-apple", name: "Trudy's Cranberry Apple", desc: "Apples, cranberries, candied walnuts, parmesan, romaine, lemon poppyseed.", price: 14.0, options: [proteinOption] },
      { id: "atlantic-salmon-salad", name: "Atlantic Salmon", desc: "Marinated salmon, fresh greens, chopped vegetables, balsamic vinaigrette.", price: 15.99 },
      { id: "southwest-buffalo-salad", name: "Southwest Buffalo Salad", desc: "Romaine, buffalo chicken, tortilla strips, corn, black beans, tomatoes, cucumbers, provolone.", price: 14.0 },
      { id: "house-salad", name: "House Salad", desc: "Bacon, chicken, tomatoes, red onions, provolone, eggs, romaine, maple mustard vinaigrette.", price: 14.0 },
      { id: "fruited-spinach", name: "Fruited Spinach", desc: "Spinach, pineapple, grapes, raisins, apples, strawberries, walnuts, orange yogurt dressing.", price: 14.0, options: [proteinOption] },
      { id: "pear-chicken-salad", name: "Pear Chicken Salad", desc: "Goat cheese, strawberries, blackberries, blueberries, walnuts, pomegranates, romaine, kale, honey club.", price: 14.0 },
      { id: "mediterranean-chicken-quinoa", name: "Mediterranean Chicken Quinoa", desc: "Chicken, quinoa, olives, feta, artichokes, garbanzos, tomatoes, onions, cucumbers, chipotle dressing.", price: 14.0 },
    ],
  },
  {
    id: "fit500",
    name: "Fit 500",
    note: "Healthy choices; these do not include a side. Add chips, potato salad or coleslaw $2 each.",
    items: [
      { id: "light-reuben", name: "Light Reuben", desc: "Sliced turkey, low-fat Swiss, low-sodium kraut, light Russian on dry grilled pumpernickel.", price: 10.5 },
      { id: "southwest-turkey-wrap", name: "Southwest Turkey Wrap", desc: "Smoked turkey, lettuce, cheese, red onions, cilantro salsa, whole-wheat wrap.", price: 10.5 },
      { id: "fit-turkey-club", name: "Fit Turkey Club", desc: "Roasted turkey, turkey bacon, lettuce, tomato, light mayo, whole-wheat toast.", price: 10.5 },
      { id: "roasted-spicy-steak-wrap", name: "Roasted Spicy Steak Wrap", desc: "Choice sirloin in light teriyaki, red peppers, onions, shredded lettuce.", price: 10.5 },
      { id: "asian-chicken-wrap", name: "Asian Chicken Wrap", desc: "Roasted chicken, Napa cabbage, red peppers, cucumbers, green onions, lime peanut vinaigrette.", price: 10.5 },
      { id: "grilled-salmon-side-salad", name: "Grilled Salmon & Side Salad", desc: "Grilled wild salmon, mixed green salad, white balsamic dressing.", price: 13.99 },
      { id: "bowl-chicken-chili", name: "Bowl of Chicken Chili", price: 8.0 },
    ],
  },
  {
    id: "soups",
    name: "Soups",
    note: "All soups are bowls and come with a popover and honey butter. Substitute cornbread on request.",
    items: [
      { id: "chicken-noodle", name: "Chicken Noodle", price: 8.0, options: [soupSide] },
      { id: "tomato-basil", name: "Tomato Basil", price: 8.0, options: [soupSide] },
      { id: "fluffy-matzo-ball", name: "Fluffy Matzo Ball", price: 8.0, options: [soupSide] },
      { id: "white-bean-chicken-chili", name: "White Bean Chicken Chili", price: 8.0, options: [soupSide] },
      { id: "chicken-wild-rice", name: "Chicken Wild Rice", price: 8.0, options: [soupSide] },
    ],
  },
  {
    id: "sides",
    name: "Sides",
    items: [
      { id: "popover", name: "Popover", price: 4.0 },
      { id: "cornbread", name: "Cornbread (with honey butter)", price: 3.95 },
      { id: "potato-salad", name: "Potato Salad (4oz)", price: 2.0 },
      { id: "coleslaw", name: "Coleslaw (4oz)", price: 2.0 },
      { id: "plain-chips", name: "Bag of Plain Potato Chips", price: 2.95 },
      { id: "homemade-chips", name: "Bag of Homemade Chips", price: 3.0 },
    ],
  },
  {
    id: "desserts",
    name: "Desserts",
    items: [
      {
        id: "cookie",
        name: "Cookie",
        desc: "Fresh-baked — choose your flavor.",
        price: 4.99,
        options: [
          {
            id: "flavor",
            label: "Choose your cookie",
            required: true,
            choices: COOKIE_FLAVORS,
          },
        ],
      },
      { id: "blackout-brownie", name: "Blackout Brownie", price: 5.95 },
    ],
  },
  {
    id: "drinks",
    name: "Drinks",
    items: [
      { id: "fountain-drink", name: "Fountain Drink", price: 2.25 },
      { id: "can-soda", name: "Can of Soda", price: 2.95 },
      { id: "cream-soda", name: "Cream Soda", price: 3.25 },
      { id: "diet-cream-soda", name: "Diet Cream Soda", price: 3.25 },
      { id: "root-beer", name: "Root Beer", price: 3.25 },
      { id: "black-cherry", name: "Black Cherry", price: 3.25 },
      { id: "diet-black-cherry", name: "Diet Black Cherry", price: 3.25 },
      { id: "soda-water", name: "Soda Water", price: 3.25 },
      { id: "snapple", name: "Snapple", price: 3.25 },
      { id: "iced-tea", name: "Iced Tea", price: 3.25 },
    ],
  },
];

export function findItem(id: string): MenuItem | undefined {
  for (const cat of MENU) {
    const it = cat.items.find((i) => i.id === id);
    if (it) return it;
  }
  return undefined;
}

// Price added by a selected choice within one of an item's options.
export function optionAddOn(opt: MenuOption, choiceLabel: string): number {
  return opt.choices.find((c) => c.label === choiceLabel)?.price ?? 0;
}

// True when adding this item requires the customizer (a size choice or any option).
export function needsCustomizer(item: MenuItem): boolean {
  return Boolean(
    (item.variants && item.variants.length > 1) ||
      (item.options && item.options.length > 0)
  );
}
