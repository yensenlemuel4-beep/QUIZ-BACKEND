module.exports = (mongoose) => {
  const hadiahSchema = new mongoose.Schema({
    name: {
      type: String,
      required: true,
    },
    quota: {
      type: Number,
      required: true,
    },
    remaining: {
      type: Number,
      required: true,
    },
  });

  const gachaHistorySchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    prize: {
      type: String,
      default: null,
    },
  });

  const limitGachaSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    count: {
      type: Number,
      default: 0,
    },
  });

  return {
    Hadiah: mongoose.models.Hadiah || mongoose.model('Hadiah', hadiahSchema),
    GachaHistory:
      mongoose.models.GachaHistory ||
      mongoose.model('GachaHistory', gachaHistorySchema),
    LimitGacha:
      mongoose.models.LimitGacha ||
      mongoose.model('LimitGacha', limitGachaSchema),
  };
};
