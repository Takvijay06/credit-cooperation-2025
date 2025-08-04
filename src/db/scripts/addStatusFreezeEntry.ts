import { EntryStatus } from "../../common/constant";
import { FinancialEntry } from "../../models/financialEntry.model";
import mongoose from "mongoose";

//To run this script, add this line to nodemon.json
//"exec": "node --no-warnings --experimental-specifier-resolution=node --loader ts-node/esm src/db/scripts/addStatusFreezeEntry.ts"
async function run() {
  await mongoose.connect("mongodb://localhost:27017/demo-2");

  await FinancialEntry.updateMany(
    { status: { $exists: false } },
    { $set: { status: EntryStatus.PENDING } },
  );

  await FinancialEntry.updateMany(
    { isFreezed: { $exists: false } },
    { $set: { isFreezed: false } },
  );

  console.log("Fields added successfully");
  await mongoose.disconnect();
}

run();
