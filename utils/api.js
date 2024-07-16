import { SPVIE_URL } from "../config.js";
import axios from "axios";

const axiosInstance = axios.create({
  baseURL: SPVIE_URL,
  headers: {
    "Authorization-Broker-Code": "60169",
    "Authorization-Broker-Token": "30d2a5a5-a33b-4ad0-8ce0-009b669a56d7",
  },
});

export const computeIndividualProjectPrice = async (data) => {
  try {
    const response = await axiosInstance.post(
      "/Products/ComputeIndividualProjectPrice",
      {
        ...data,
      }
    );

    return response.data;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw error;
  }
};
