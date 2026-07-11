const fs = require("fs");
const path = require("path");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  let filePath = path.join(__dirname, "../appsumo_codes.txt");

  if (!fs.existsSync(filePath)) {
    filePath = path.join(__dirname, "../codes.txt");
  }

  if (!fs.existsSync(filePath)) {
    console.error(`\x1b[31mError: Codes file not found.\x1b[0m`);
    console.log("Please create either 'appsumo_codes.txt' or 'codes.txt' file inside the 'ismamstudio' directory containing your AppSumo codes (one code per line).");
    process.exit(1);
  }

  console.log(`Reading codes from ${filePath}...`);
  const content = fs.readFileSync(filePath, "utf-8");
  
  // Split by line and clean codes
  const codes = content
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length >= 3);

  const totalCodes = codes.length;
  console.log(`Found ${totalCodes} codes in codes.txt.`);

  if (totalCodes === 0) {
    console.log("\x1b[33mNo valid codes found in the file.\x1b[0m");
    process.exit(0);
  }

  console.log("Importing codes to database, please wait...");
  const startTime = Date.now();

  try {
    // Map codes to Prisma data shape
    const data = codes.map((code) => ({
      code: code,
      isRedeemed: false,
    }));

    // Perform bulk create using createMany and skip duplicates
    const result = await prisma.appSumoValidCode.createMany({
      data: data,
      skipDuplicates: true,
    });

    const endTime = Date.now();
    const duration = ((endTime - startTime) / 1000).toFixed(2);

    console.log(`\n\x1b[32mSuccess! Imported AppSumo codes.\x1b[0m`);
    console.log(`- Total codes in file: ${totalCodes}`);
    console.log(`- Successfully imported: ${result.count}`);
    console.log(`- Duplicates skipped: ${totalCodes - result.count}`);
    console.log(`- Time taken: ${duration}s`);

  } catch (error) {
    console.error("\x1b[31mError during import:\x1b[0m", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
