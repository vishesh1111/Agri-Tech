import Dexie, { Table } from 'dexie';
import {
  UserProfile,
  Farm,
  LandParcel,
  CropRecord,
  IrrigationZone,
  Livestock,
  PoultryBatch,
  MarketPrice,
  FinancialTransaction,
  FarmTask,
  ChatMessage,
  AppNotification,
  SoilHealthRecord,
  CropTask,
} from '../types';

export class KisanDatabase extends Dexie {
  userProfiles!: Table<UserProfile, string>;
  farms!: Table<Farm, string>;
  landParcels!: Table<LandParcel, string>;
  crops!: Table<CropRecord, string>;
  irrigationZones!: Table<IrrigationZone, string>;
  livestock!: Table<Livestock, string>;
  poultryBatches!: Table<PoultryBatch, string>;
  marketPrices!: Table<MarketPrice, string>;
  financialTransactions!: Table<FinancialTransaction, string>;
  farmTasks!: Table<FarmTask, string>;
  chatMessages!: Table<ChatMessage, number>;
  appNotifications!: Table<AppNotification, string>;
  soilHealthRecords!: Table<SoilHealthRecord, string>;
  cropTasks!: Table<CropTask, string>;

  constructor() {
    super('kisan_ai_web_db');
    this.version(1).stores({
      userProfiles: 'id',
      farms: 'id, farmType, primaryCropOrAnimal',
      landParcels: 'id, farmId, currentCrop',
      crops: 'id, farmId, parcelId, cropName',
      irrigationZones: 'id, farmId',
      livestock: 'id, farmId, type, tagId',
      poultryBatches: 'id, farmId',
      marketPrices: 'id, cropName, mandiName',
      financialTransactions: 'id, farmId, category, timestamp',
      farmTasks: 'id, farmId, priority, isCompleted',
      chatMessages: '++id, timestamp',
      appNotifications: 'id, farmId, severity, isRead, dateMillis',
      soilHealthRecords: 'id, farmId, timestamp',
      cropTasks: 'id, farmId, cropName, isCompleted',
    });
  }
}

export const db = new KisanDatabase();
