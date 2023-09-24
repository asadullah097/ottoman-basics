import { connect, model, start, close, Schema } from "ottoman";

async function createUser() {
  await connect({
    connectionString: "couchbase://localhost",
    bucketName: "ottomanBucket",
    username: "Administrator",
    password: "password123@",
  });
  //create schema
  const IssueSchema = new Schema(
    {
      title: String,
      description: String,
    },
    {
      timestamps: true,
    }
  );
  const CardSchema = new Schema(
    {
      cardNumber: String,
      zipCode: String,
      issues: [
        {
          type: IssueSchema,
          ref: "Issue",
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  const CatSchema = new Schema({
    name: String,
    age: Number,
    gender: String,
  });
  const userSchema = new Schema(
    {
      type: String,
      isActive: Boolean,
      name: String,
      cards: [
        {
          type: CardSchema,
          ref: "Card",
        },
      ],
      cat: [
        {
          type: CatSchema,
          ref: "Cat",
        },
      ],
    },
    {
      timestamps: true,
    }
  );
  //create model

  const Issue = model("Issue", IssueSchema, { collectionName: "issues" });
  const Card = model("Card", CardSchema, { collectionName: "cards" });
  const Cat = model("Cat", CatSchema, { collectionName: "cats" });
  const User = model("User", userSchema, { collectionName: "users" });
  try {
    await start();

    console.log("Ottoman is ready!");

    // Initialize data
    const issueDoc = await Issue.create({ title: "stolen card" });
    const cardDoc = await Card.create({
      cardNumber: "4242 4242 4242 4242",
      zipCode: "42424",
      issues: [issueDoc.id],
    });
    const cat1Doc = await Cat.create({ name: "Figaro", age: 6 });
    const cat2Doc = await Cat.create({
      name: "Garfield",
      age: 5,
      gender: "male",
    });
    const userDoc = new User({
      type: "userPopulate",
      isActive: false,
      name: "Asad ullah",
      card: cardDoc.id,
      cats: [cat1Doc.id, cat2Doc.id],
    });
    const saved = await userDoc.save();

    // Define query options
    const options = { select: "card, cats, name", populate: "*", lean: true };

    // Execute a lean=true query
    const userWithLean = await User.findById(saved.id, options);

    // Execute a lean=false query
    options.lean = false;
    const userWithoutLean = await User.findById(saved.id, options);

    console.log(userWithLean);
    console.log(userWithoutLean);

    await close();
    console.log(`User successfully created`);
  } catch (e) {
    console.log(`ERROR: ${e}`);
  }
}

createUser();
