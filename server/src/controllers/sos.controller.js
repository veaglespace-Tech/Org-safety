const sosService = require('../services/sos.service');
const { locationCache } = require('../socket');

exports.triggerSOS = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { locationUrl } = req.body;

    const result = await sosService.triggerSOS(userId, locationUrl);
    res.status(200).json(result);
  } catch (error) {
    console.error("SOS Trigger Error:", error);
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.updateSOS = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { locationUrl } = req.body;

    const result = await sosService.updateSOS(userId, locationUrl);
    res.status(200).json(result);
  } catch (error) {
    console.error("SOS Update Error:", error);
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};

exports.updateBackgroundLocation = async (req, res) => {
  try {
    const { token, latitude, longitude, accuracy, heading, speed } = req.body;
    
    if (!token || latitude == null || longitude == null) {
      return res.status(400).json({ error: "Missing location data" });
    }

    const io = req.app.get('io');
    const locationData = {
      token,
      latitude,
      longitude,
      accuracy: accuracy || 0,
      heading: heading || null,
      speed: speed || null,
      timestamp: Date.now()
    };
    
    // Cache the location so new viewers get the latest immediately
    locationCache[token] = {
      ...locationData,
      lastUpdated: locationData.timestamp
    };

    if (io) {
      io.to(`track:${token}`).emit('location-updated', locationData);
    }

    res.status(200).json({ success: true });
  } catch (error) {
    console.error("SOS Background Update Error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.stopSOS = async (req, res) => {
  try {
    const userId = req.user.userId;

    const result = await sosService.stopSOS(userId);
    res.status(200).json(result);
  } catch (error) {
    console.error("SOS Stop Error:", error);
    if (error.message === "User not found") {
      res.status(404).json({ error: "User not found" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
};
