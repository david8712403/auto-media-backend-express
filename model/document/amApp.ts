import mongoose from "mongoose";

interface IAutoMediaApp {
  name: string;
  webhook: string | null;
}

interface AutoMediaAppDoc extends mongoose.Document {
  name: string;
  webhook: string | null;
  createdAt: Date;
  updatedAt: Date;
}

const autoMediaAppSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    webhook: {
      type: String,
      require: false,
    },
  },
  {
    collection: "autoMediaApp",
    timestamps: true,
    versionKey: false,
  }
);

autoMediaAppSchema.statics.build = (attr: IAutoMediaApp) => {
  return new AutoMediaApp(attr);
};

interface autoMediaAppModelInterface extends mongoose.Model<AutoMediaAppDoc> {
  build(attr: IAutoMediaApp): AutoMediaAppDoc;
}

const AutoMediaApp = mongoose.model<
  AutoMediaAppDoc,
  autoMediaAppModelInterface
>("autoMediaApp", autoMediaAppSchema);

export { IAutoMediaApp, AutoMediaApp, AutoMediaAppDoc };
