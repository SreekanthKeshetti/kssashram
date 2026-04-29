const mongoose = require("mongoose");
const dotenv = require("dotenv");
const Inventory = require("./models/Inventory");
const connectDB = require("./config/db");

dotenv.config();

const foodItems = [
  "Rice",
  "RICE BASMATHI",
  "Oil",
  "Ghee / Neyyi",
  "Kandi Pappu",
  "Mina pappu",
  "CHENA (Senigalu)",
  "Pesarlu / Green Gram",
  "BOBBARLU",
  "Seniga Pappu / Bengal Gram",
  "Pesara Pappu",
  "PUTNALA PAPPU / Putnalu",
  "Pallilu (Ground nut)",
  "Kharam Podi / CHILLI POWDER",
  "Kobbari podi / Coconut powder",
  "PASUPU (Haldi)",
  "Crystal Salt / DODDU UPPU",
  "Powder Salt / SANNA UPPU",
  "NALLA UPPU (Rock Salt)",
  "Jaggery/ BELLAM/ GUD",
  "Sugar",
  "Tamarind / CHINTHAPANDU",
  "Bombay Rava (sanna Rava)",
  "Doddu Rawa (Godhuma Rava)",
  "Idli Rava",
  "BAMBINO",
  "Doddu atukulu",
  "Paper Atukulu",
  "Murmura / MURUMURALU",
  "BESAN /Seniga Pindi",
  "Wheat Flour (Goduma Pindi)",
  "Ragi Pindi (Ragi Flour)",
  "Jonna Pindi (Jowar Flour)",
  "MAIDA",
  "Bambino (Semiyan)",
  "SABUDANA",
  "MEAL MAKER",
  "Aavalu",
  "Jilakara",
  "MENTHULU",
  "DRY MIRCHI / Red chilli",
  "Nuvvulu, (TIL)",
  "DHANIYALU",
  "Dhaniyala powder",
  "(INGUVA) HING Asafoetida",
  "TEA POWDER",
  "Coffee powder",
  "ALLAM (Ginger)",
  "ELLI GADA (Garlic)",
  "ULLIGADDA (Onion)",
  "ELACHI",
  "LAVANG",
  "DALCHINA CHEKKA",
  "SAMBAR MASALA",
  "MARVADI METHI",
  "KISSMISS",
  "KAJU",
  "Kajjur nuts",
  "Miixed Dry Fruits",
  "MIRIYALU",
  "GARAM MASALA",
  "EATING SODA",
  "CHIRANJI",
  "TARBUJA SEED",
  "PAPAD",
  "Doddu Batani",
  "Ragulu",
  "Jonnalu",
];

const nonFoodItems = [
  "White long note books",
  "White short note books",
  "Single long note books",
  "Single line short note books",
  "Four line long note books",
  "Double line long note books",
  "White lalchi & pajama",
  "Broad line long note books",
  "School socks",
  "Square line long note books",
  "Sharpeners",
  "New pants and shirts",
  "Pens",
  "Book covers",
  "Compass box",
  "Pencils",
  "Geometry compass box",
  "Crayons, colours pens kits",
  "Soap box",
  "Dictionary",
  "Exam pads",
  "Pouches",
  "Tiffin box",
  "School shoes (black)",
  "School white shoes",
  "Chappals",
  "School bags",
  "V h p hand bags",
  "Laptop bags",
  "Dhariwai blankets",
  "Blankets/bed sheets/ carpet",
  "Drafters",
  "Colours books",
  "Steel water jugs",
  "Steel plates",
  "Catoras / Small bowls",
  "Tea glass",
  "Steel glass",
  "Shirts pieces",
  "Pants pieces",
  "Plastic glass",
  "School white dresses",
  "Sweaters",
  "Towels",
  "Drawers",
  "Banians",
  "Sai vidya mandir T-shirts",
  "Sri chaithanya T-shirts",
  "Karunya sindhu red T-shirts",
  "Pillow covers",
  "Bath soaps",
  "Detergent soaps",
  "Plastic containers",
  "Small/ Big scales",
  "Erasors",
  "Sharpeners",
  "Water Bottles",
];

// Corrected Branch List
const branches = [
  { name: "Karunya Sindhu", code: "KSA" },
  { name: "Karunya Bharathi", code: "KBA" },
  { name: "Karunya Jyothi", code: "KJA" },
  { name: "KarunaSri Seva Samithi", code: "KSS" }, // Headquarters
];

const seedInventory = async () => {
  try {
    await connectDB();
    console.log("Connected... Clearing old inventory data...");
    await Inventory.deleteMany();

    let allItems = [];

    branches.forEach((branch) => {
      // 1. Process Food Items (F)
      foodItems.forEach((name, index) => {
        allItems.push({
          itemCode: `${branch.code}F${index + 1}`, // Result: KSAF1, KBAF1, etc.
          itemName: name,
          category: "Food",
          branch: branch.name,
          quantity: 0,
          unit: "kg",
        });
      });

      // 2. Process Non-Food Items (NF)
      nonFoodItems.forEach((name, index) => {
        allItems.push({
          itemCode: `${branch.code}NF${index + 1}`, // Result: KSANF1, KBANF1, etc.
          itemName: name,
          category: "Non-Food",
          branch: branch.name,
          quantity: 0,
          unit: "pieces",
        });
      });
    });

    await Inventory.insertMany(allItems);
    console.log(`✅ Success! Seeded ${allItems.length} total items.`);
    console.log(
      `KSA (Sindhu), KBA (Bharathi), KJA (Jyothi), and KSS (HQ) are now ready.`,
    );
    process.exit();
  } catch (error) {
    console.error("❌ Seeding Error:", error);
    process.exit(1);
  }
};

seedInventory();
