import * as faker from "faker";
import { createConnection, getRepository } from "typeorm";
import { User } from "../entity/user.entity";

createConnection().then(async () => {
  const repository = getRepository(User);

  for (let i = 0; i < 30; i++) {
    await repository.save({
      id: faker.datatype.uuid(),
      first_name: faker.name.firstName(),
      last_name: faker.name.lastName(),
      email: faker.internet.email(),
      is_ambassador: true,
    });
  }

  process.exit();
});
