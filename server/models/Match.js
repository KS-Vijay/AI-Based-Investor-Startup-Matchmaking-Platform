import mongoose from 'mongoose';

const MatchSchema = new mongoose.Schema(
  {
    startup: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StartupForm',
      required: true,
      index: true,
    },
    startupUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    investor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InvestorForm',
      required: true,
      index: true,
    },
    investorUser: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    score: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    recommendationLevel: {
      type: String,
      enum: ['Highly Recommended', 'Recommended', 'Consider', 'Pass'],
      default: 'Recommended',
    },
    whyWorks: {
      type: [String],
      default: [],
    },
    potentialConcerns: {
      type: [String],
      default: [],
    },
    strategicFit: {
      type: String,
      default: '',
    },
    nextSteps: {
      type: String,
      default: '',
    },
    calculatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

// Ensure unique match per startup & investor pair
MatchSchema.index({ startup: 1, investor: 1 }, { unique: true });

const Match = mongoose.model('Match', MatchSchema);
export default Match;
