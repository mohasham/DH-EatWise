
import dns from 'node:dns';
import mongoose from 'mongoose';

const configureDns = (): void => {
  const configured = process.env.DNS_SERVERS;
  if (configured) {
    dns.setServers(configured.split(',').map((s) => s.trim()));
    return;
  }

  const servers = dns.getServers();
  const unusable = servers.length > 0 && servers.every((s) => s === '127.0.0.1' || s === '::1' || /^fec0:/.test(s));
  if (unusable) {
    dns.setServers(['8.8.8.8', '1.1.1.1']);
  }
};

const connectDB = async (): Promise<void> => {
  configureDns();
  const uri = process.env.MONGODB_URI;
  const dataBaseName = process.env.DB_NAME;

  if (!uri) {
    throw new Error('MONGODB_URI is not defined in environment variables');
  }

  try {
    const conn = await mongoose.connect(uri, { dbName: dataBaseName });
    console.log(`[DB] MongoDB Atlas connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('[DB] MongoDB Atlas connection error:', error);
    throw error;
  }
};

export default connectDB;