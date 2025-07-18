// This is a simplified storage interface for the crypto pump radar app
// Currently, all data is fetched from external APIs, so no persistent storage is needed

export interface IStorage {
  // Add any future storage methods here if needed
}

export class MemStorage implements IStorage {
  constructor() {
    // Initialize storage if needed
  }
}

export const storage = new MemStorage();
