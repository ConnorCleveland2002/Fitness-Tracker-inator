const router = require("express").Router();
const Workout = require("../models/workoutModel.js");
const ObjectId = require("mongodb");
const path = require("path");
const mongoose = require("mongoose");
const castAggregation = require("mongoose-cast-aggregation");

mongoose.plugin(castAggregation);

router.get("/exercise", function (req, res) {
  res.sendFile(path.join(__dirname, "../public/exercise.html"));
});

router.get("/stats", function (req, res) {
  res.sendFile(path.join(__dirname, "../public/stats.html"));
});

router.get("/api/workouts", (req, res) => {
  Workout.aggregate()
    .project({
      'day': 1,
      'exercises.duration': 1,
      'exercises.sets': 1,
      'exercises.weight': 1,
      'exercises.reps': 1,
      'exercises.distance': 1,
      'exercises.type': 1,
      'exercises.name': 1,
    })
    .addFields({
      totalDuration: { $sum: '$exercises.duration' },
      totalSets: { $sum: '$exercises.sets' },
      totalWeight: { $sum: '$exercises.weight' },
      totalReps: { $sum: '$exercises.reps' },
      totalDistance: { $sum: '$exercises.distance' },
    })
    .sort({ day: 1 })
    .then((workoutDB) => {
      res.json(workoutDB);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.get("/exercise", (req, res) => {
  Workout.find({})
    .sort({ day: 1 })
    .then((workoutDB) => {
      res.json(workoutDB);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.post("/api/workouts", ({ body }, res) => {
  Workout.create(body)
    .then((workoutDB) => {
      res.json(workoutDB);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.put("/api/workouts/:id", (req, res) => {
  let id = ObjectId(req.params.id);

  Workout.collection
    .findOneAndUpdate(
      {
        _id: id
      },
      {
        $push: {
          exercises: req.body,
        },
      },
      {
        new: true
      }
    )
    .then((workoutDB) => {
      res.json(workoutDB);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

router.get("/api/workouts/range", (req, res) => {
  const endDate = new Date();
  const startDate = new Date().setDate();

  Workout.aggregate([
    { $match: { day: { $gte: startDate, $lte: endDate } } },
  ])
    .project({
      'day': 1,
      'exercises.duration': 1,
      'exercises.sets': 1,
      'exercises.weight': 1,
      'exercises.reps': 1,
      'exercises.distance': 1,
      'exercises.type': 1,
      'exercises.name': 1,
    })
    .addFields({
      totalDuration: { $sum: '$exercises.duration' },
      totalSets: { $sum: '$exercises.sets' },
      totalWeight: { $sum: '$exercises.weight' },
      totalReps: { $sum: '$exercises.reps' },
      totalDistance: { $sum: '$exercises.distance' },
    })
    .sort({ day: 1 })
    .then((workoutDB) => {
      res.json(workoutDB);
    })
    .catch((err) => {
      res.status(400).json(err);
    });
});

module.exports = router;
