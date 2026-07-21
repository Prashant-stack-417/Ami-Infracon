import { ApiResponse } from "../utils/apiResponse.js";

export const healthCheck = (req, res) => {
  res.status(200).json(new ApiResponse(200, { status: 'OK', timestamp: new Date().toISOString() }, "Health check passed"));
};
