import { setServers } from "node:dns";
import mongoose from "mongoose";

export async function connectDatabase(uri: string, dnsServers?: string[]): Promise<void> {
  if (dnsServers?.length) {
    setServers(dnsServers);
  }
  await mongoose.connect(uri);
  console.log("MongoDB connected");
}
