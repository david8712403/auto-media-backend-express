import mongoose from "mongoose";

interface IIgSession {
  data: any;
}

interface IgSessionDoc extends mongoose.Document {
  data: any;
  createdAt: Date;
  updatedAt: Date;
}

const igSessionSchema = new mongoose.Schema(
  {
    data: {
      type: Object,
      require: true,
    },
  },
  {
    collection: "igSession",
    timestamps: true,
    versionKey: false,
  }
);

igSessionSchema.statics.build = (attr: IIgSession) => {
  return new IgSession(attr);
};

interface igSessionModelInterface extends mongoose.Model<IgSessionDoc> {
  build(attr: IIgSession): IgSessionDoc;
}

const IgSession = mongoose.model<IgSessionDoc, igSessionModelInterface>(
  "IgSession",
  igSessionSchema
);

export { IIgSession, IgSession, IgSessionDoc };
