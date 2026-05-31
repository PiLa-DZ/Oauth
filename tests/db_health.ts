import db from "../src/lib/db.js";
import { faker } from "@faker-js/faker";

try {
  const result = await db.user.create({
    data: {
      email: faker.internet.email(),
      hashPassword: faker.internet.password(),
    },
  });

  console.log(result);
} catch (err) {
  console.error(err);
} finally {
  db.$disconnect();
}
