import express from "express";
import { body, validationResult } from "express-validator";
import { User } from "../models/userModel.js";
import { computeIndividualProjectPrice } from "../utils/api.js";

const router = express.Router();

const isValidDate = (value) => {
  const date = new Date(value);
  return !isNaN(date.getTime());
};

router.post(
  "/",
  [
    body("firstName").notEmpty().withMessage("First name is required."),
    body("lastName").notEmpty().withMessage("Last name is required."),
    body("birthDate")
      .custom(isValidDate)
      .withMessage("Birth date must be a valid date."),
    body("email").isEmail().withMessage("Email must be valid."),
    body("phoneNumber").notEmpty().withMessage("Phone number is required."),
    body("businessActivityFamily")
      .notEmpty()
      .withMessage("Business activity family is required."),
    body("insuranceDate")
      .custom(isValidDate)
      .withMessage("Insurance date must be a valid date."),
  ],
  async (request, response) => {
    const errors = validationResult(request);

    if (!errors.isEmpty()) {
      return response.status(400).json({ errors: errors.array() });
    }
    try {
      const existingUser = await User.findOne({ email: request.body.email });

      if (existingUser) {
        return response.status(201).send({ price: existingUser.productPrice });
      }

      const newUser = {
        firstName: request.body.firstName,
        lastName: request.body.lastName,
        birthDate: request.body.birthDate,
        email: request.body.email,
        phoneNumber: request.body.phoneNumber,
        businessActivityFamily: request.body.businessActivityFamily,
        insuranceDate: request.body.insuranceDate,
      };

      const price = await computeIndividualProjectPrice({
        Client: {
          BirthDate: new Date(newUser.birthDate),
          Name: newUser.lastName,
          FirstName: newUser.firstName,
          Email: newUser.email,
        },
        ProductCategory: 15,
        Freelancer: false,
        Commision: 30,
        AnnualRevenue: 300000,
        EffectDate: new Date(newUser.insuranceDate),
        ProductSpecificFields: {
          RcProPrestaServiceFields: {
            OptionList: [
              {
                Name: 0,
                IsActive: true,
              },
            ],
          },
        },
      });

      await User.create({ ...newUser, productPrice: price.Price });

      return response.status(201).send({ price: price.Price });
    } catch (error) {
      console.log(error.message);
      response.status(500).send({ message: error.message });
    }
  }
);

router.get("/", async (request, response) => {
  try {
    const users = await User.find({});

    return response.status(200).json({
      count: users.length,
      data: users,
    });
  } catch (error) {
    console.log(error.message);
    response.status(500).send({ message: error.message });
  }
});

export default router;
