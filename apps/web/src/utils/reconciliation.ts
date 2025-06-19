import { db } from '@t3chat/lib/db';

export interface ReconciliationResult {
  added: number;
  updated: number;
  deleted: number;
}

export const reconcileTable = async <T extends Record<string, any>>(
  table: any,
  localKey: string,
  localValue: any,
  serverData: T[],
  reconciliationKey: string = '_id',
  compareFields: string[] = ['updatedAt'],
  preserveOrder: boolean = false
): Promise<ReconciliationResult> => {
  try {
    const localRecords = await table.where(localKey).equals(localValue).toArray();

    const localRecordMap = new Map(
      localRecords.map((record: T) => [record[reconciliationKey], record])
    );
    const serverRecordMap = new Map(
      serverData.map((record: T) => [record[reconciliationKey], record])
    );

    const recordsToAdd: T[] = [];
    const recordsToUpdate: T[] = [];
    const recordsToDelete: any[] = [];

    for (const serverRecord of serverData) {
      const localRecord = localRecordMap.get(serverRecord[reconciliationKey]);
      if (!localRecord) {
        recordsToAdd.push(serverRecord);
      } else {
        const needsUpdate = compareFields.some(
          (field) =>
            (localRecord as Record<string, any>)[field] !==
            (serverRecord as Record<string, any>)[field]
        );

        if (needsUpdate) {
          recordsToUpdate.push(serverRecord);
        }
      }
    }

    for (const localRecord of localRecords) {
      if (!serverRecordMap.has((localRecord as T)[reconciliationKey])) {
        recordsToDelete.push((localRecord as T)[reconciliationKey]);
      }
    }

    if (recordsToDelete.length > 0) {
      await table.bulkDelete(recordsToDelete);
    }

    if (recordsToUpdate.length > 0) {
      for (const record of recordsToUpdate) {
        await table.put(record);
      }
    }

    if (recordsToAdd.length > 0) {
      if (preserveOrder) {
        // Insert records one by one to preserve order, using put() to handle duplicates
        for (const record of recordsToAdd) {
          await table.put(record);
        }
      } else {
        // Use bulkPut for better performance when order doesn't matter
        await table.bulkPut(recordsToAdd);
      }
    }

    const result: ReconciliationResult = {
      added: recordsToAdd.length,
      updated: recordsToUpdate.length,
      deleted: recordsToDelete.length,
    };

    console.log({ recordsToAdd });

    console.log('Table reconciliation complete:', result);
    return result;
  } catch (error) {
    console.error('Error during table reconciliation:', error);
    // Fallback to simple sync if reconciliation fails
    await table.where(localKey).equals(localValue).delete();

    if (preserveOrder) {
      // Insert records one by one to preserve order, using put() to handle duplicates
      for (const record of serverData) {
        await table.put(record);
      }
    } else {
      await table.bulkPut(serverData);
    }

    return {
      added: serverData.length,
      updated: 0,
      deleted: 0,
    };
  }
};

export const reconcileMessagesByUuid = async (
  conversationId: string,
  serverMessages: any[]
): Promise<ReconciliationResult> => {
  return reconcileTable(
    db.messages,
    'conversationUuid',
    conversationId,
    serverMessages.map((message) => ({
      ...message,
      conversationUuid: conversationId,
    })),
    'messageUuid',
    ['content', 'status', 'updatedAt', 'resumableStreamId', '_id'],
    true
  );
};
