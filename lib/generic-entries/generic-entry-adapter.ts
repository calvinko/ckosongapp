import useSWR from "swr";
import { GenericEntry, GenericEntryCreate } from "../../ts/types/genericEntry.interface";
import { fetcherWithShortMaxAge } from "../fetcher";

/**
 * Create Generic Entry
 * 
 * @param entry Create DTO
 * @returns     Created GenericEntry
 */
export const createEntry = async (entry: GenericEntryCreate): Promise<GenericEntry> => {
  const res = await fetch("/api/generic-entry", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(entry)
  });

  if (res.status >= 400) {
    console.error("Failed to create entry entry=" + entry);
    throw new Error("Failed to create entry");
  }

  const resJson = await res.json()
  return resJson?.data;
}

/**
 * Hook to get all Entries from indexName
 * 
 * @param indexName index name
 * @returns         list of GenericEntries, undefined if not loaded
 */
export const useAllEntriesOnIndex = (indexName: string): GenericEntry[] => {
  const { data, error } = useSWR(`/api/generic-entry?indexName=${indexName}`, fetcherWithShortMaxAge);

  if (error) {
    console.error("Error loading entries useAllEntriesOnIndex error=" + error);
    return null;
  }

  return data ? data?.data : undefined;
}

/**
 * Get Entries from indexName and pk
 * 
 * @param indexName index name
 * @param pk        primary key
 * @param pType     primary key type
 * @returns         list of GenericEntries
 */
export const getEntriesForPk = async (indexName: string, pk: string, pType: string): Promise<GenericEntry[]> => {
  const res = await fetch(`/api/generic-entry?pk=${pk}&pType=${pType}&indexName=${indexName}`, {
    method: "GET",
  });

  if (res.status >= 400) {
    console.error(`Failed to get entry for pk=${pk} pType=${pType} indexName=${indexName} text=${res.text}`);
    throw new Error(`Failed to get entry for pk=${pk} pType=${pType} indexName=${indexName}`);
  }

  const resJson = await res.json()
  return resJson?.data;
}

/**
 * Get Entries from indexName and sk
 * 
 * @param indexName index name
 * @param pk        secondary key
 * @param pType     secondary key type
 * @returns         list of GenericEntries
 */
export const getEntriesForSk = async (indexName: string, sk: string, sType: string): Promise<GenericEntry[]> => {
  const res = await fetch(`/api/generic-entry?sk=${sk}&sType=${sType}&indexName=${indexName}`, {
    method: "GET",
  });

  if (res.status >= 400) {
    console.error(`Failed to get entry for sk=${sk} sType=${sType} indexName=${indexName} text=${res.text}`);
    throw new Error(`Failed to get entry for sk=${sk} sType=${sType} indexName=${indexName}`);
  }

  const resJson = await res.json()
  return resJson?.data;
}

/**
 * Hook to get entries from index name and pk
 * 
 * @param indexName index name
 * @param pk        primary key
 * @param pType     primary key type
 * @returns         list of GenericEntries
 */
export const useEntriesForPk = (indexName: string, pk: string, pType: string): GenericEntry[] => {
  const { data, error } = useSWR(pk ? `/api/generic-entry?pk=${pk}&pType=${pType}&indexName=${indexName}` : null, fetcherWithShortMaxAge);

  if (error) {
    console.error("Error loading entries error=" + error);
    return null;
  }

  return data ? data?.data : undefined;
}

/**
 * Hook to get Entries from indexName and sk
 * 
 * @param indexName index name
 * @param pk        secondary key
 * @param pType     secondary key type
 * @returns         list of GenericEntries
 */
export const useEntriesForSk = (indexName: string, sk: string, sType: string): { entries: GenericEntry[] | undefined | null; isLoading: boolean; } => {
  const { data, error, isLoading } = useSWR(sk ? `/api/generic-entry?sk=${sk}&sType=${sType}&indexName=${indexName}` : null, fetcherWithShortMaxAge);

  if (error) {
    console.error("Error loading entries error=" + error);
    return null;
  }

  return { entries: data ? data?.data : undefined, isLoading };
}

/**
 * Hook to get Entries from all keys
 * 
 * @param indexName index name
 * @param pk        primary key
 * @param pType     primary key type
 * @param sk        secondary key
 * @param sType     secondary key type
 * @returns         list of GenericEntries, undefined if not loaded
 */
export const useEntries = (indexName: string, pk: string, pType: string, sk: string, sType: string): GenericEntry[] => {
  const { data, error } = useSWR(sk && pk ? `/api/generic-entry?pk=${pk}&pType=${pType}&sk=${sk}&sType=${sType}&indexName=${indexName}` : null, fetcherWithShortMaxAge);

  if (error) {
    console.error("Error loading entries error=" + error);
    return null;
  }

  return data ? data?.data : undefined;
}

/**
 * Hook to get Entries from all keys with user access control - hooks need to run regardless, so this 
 * gives useSwr a `null` api so it doesn't try to fetch if user doesn't have access.
 * 
 * @param indexName index name
 * @param pk        primary key
 * @param pType     primary key type
 * @param sk        secondary key
 * @param sType     secondary key type
 * @param hasAccess user has access to this data, or else the fetch doesn't make
 * @returns         list of GenericEntries, undefined if not loaded
 */
export const useEntriesWithAccess = (indexName: string, pk: string, pType: string, sk: string, sType: string, hasAccess: boolean): GenericEntry[] => {
  const { data, error } = useSWR(sk && pk && hasAccess ? `/api/generic-entry?pk=${pk}&pType=${pType}&sk=${sk}&sType=${sType}&indexName=${indexName}` : null, fetcherWithShortMaxAge);

  if (error) {
    console.error("Error loading entries error=" + error);
    return null;
  }

  return data ? data?.data : undefined;
}

/**
 * Delete Entry
 * 
 * @param id id of the entry
 */
export const deleteEntry = async (id: string) => {
  const res = await fetch(`/api/generic-entry?`, {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id })
  });

  if (res.status >= 400) {
    console.error("Failed to update entry. id=" + id + " message=" + res.text);
    throw new Error(`Failed to update entry. id=${id}`);
  }
}

/**
 * Update payload of entry
 * 
 * @param id        id of the entry
 * @param payload   payload to update entry to
 */
export const updateEntry = async (id: string, payload: any) => {
  const res = await fetch(`/api/generic-entry?`, {
    method: "UPDATE",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ id, payload })
  });

  if (res.status >= 400) {
    console.error("Failed to update entry. id=" + id + " message=" + res.text);
    throw new Error(`Failed to update entry. id=${id}`);
  }
}