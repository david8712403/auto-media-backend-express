import mongoose from "mongoose";

interface ILineUser {
  userId: string;
  displayName: string;
  language: string | null;
  pictureUrl: string;
}

interface LineUserDoc extends mongoose.Document {
  userId: string;
  displayName: string;
  language: string;
  pictureUrl: string;
  createdAt: Date;
  updatedAt: Date;
}

const lineUserSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      require: true,
    },
    displayName: {
      type: String,
      require: true,
    },
    language: {
      type: String,
      require: false,
    },
    pictureUrl: {
      type: String,
      require: true,
    },
  },
  {
    collection: "lineUser",
    timestamps: true,
    versionKey: false,
  }
);

lineUserSchema.statics.build = (attr: ILineUser) => {
  return new LineUser(attr);
};

interface lineUserModelInterface extends mongoose.Model<LineUserDoc> {
  build(attr: ILineUser): LineUserDoc;
}

const LineUser = mongoose.model<LineUserDoc, lineUserModelInterface>(
  "LineUser",
  lineUserSchema
);

export { ILineUser, LineUser, LineUserDoc };
