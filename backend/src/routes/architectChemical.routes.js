const express = require("express");
const router = express.Router();
const ArchitectChemical = require("../models/ArchitectChemical");

/* Create */
router.post("/", async (req, res) => {
  try {
    const record = await ArchitectChemical.create(req.body);
    res.status(201).json(record);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

/* Get All */
router.get("/", async (req, res) => {
  const records = await ArchitectChemical.find().sort({ createdAt: -1 });
  res.json(records);
});

/* Get By ID */
router.get("/:id", async (req, res) => {
  const record = await ArchitectChemical.findById(req.params.id);
  if (!record) return res.status(404).json({ message: "Not found" });
  res.json(record);
});

/* Update */
router.put("/:id", async (req, res) => {
  const record = await ArchitectChemical.findByIdAndUpdate(
    req.params.id,
    req.body,
    { new: true, runValidators: true },
  );
  res.json(record);
});

/* Delete */
router.delete("/:id", async (req, res) => {
  await ArchitectChemical.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted successfully" });
});

module.exports = router;
