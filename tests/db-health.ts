import db from "../src/lib/db.js";
import { faker } from "@faker-js/faker";

try {
  const result = await db.user.create({
    data: {
      email: faker.internet.email(),
      firstName: faker.internet.username(),
      facebookId: faker.internet.password(),
    },
  });

  console.log(result);
} catch (err) {
  console.error(err);
}

db.$disconnect();
