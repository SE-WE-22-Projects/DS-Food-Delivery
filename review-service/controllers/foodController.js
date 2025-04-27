const Food = require('../models/Food');

// Create a new food item
exports.createFood = async (req, res) => {
  try {
    const food = new Food(req.body);
    await food.save();
    res.status(201).json({ success: true, data: food });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Get all food items
exports.getAllFoods = async (req, res) => {
  try {
    const foods = await Food.find();
    res.status(200).json({ success: true, data: foods });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Get a single food item by ID
exports.getFoodById = async (req, res) => {
  try {
    const food = await Food.findById(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food not found' });
    }
    res.status(200).json({ success: true, data: food });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// Update a food item
exports.updateFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food not found' });
    }
    res.status(200).json({ success: true, data: food });
  } catch (err) {
    res.status(400).json({ success: false, error: err.message });
  }
};

// Delete a food item
exports.deleteFood = async (req, res) => {
  try {
    const food = await Food.findByIdAndDelete(req.params.id);
    if (!food) {
      return res.status(404).json({ success: false, error: 'Food not found' });
    }
    res.status(200).json({ success: true, data: {} });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};