import SongMeta from "./songMeta.interface";

/**
 * Melody Cluster type. It has a base song that we recognize this cluster as and list of songs
 */
export interface MelodyCluster {
  // cluster details
  cluster: ClusterDetails
  // the songs in the melody cluster
  songs: MelodyClusterSong[];
}

export interface MelodyClusterSong {
  // the song in the melody cluster
  slug: string;
  // note on this relation (anything about why this song is in the cluster... or any nuances to pay attention to)
  note?: string
}

/**
 * Details on the cluster
 */
export interface ClusterDetails {
  // the name of the base song of the cluster
  name: string;
  // the slug of the base song of the cluster
  baseSong: string
  // description of cluster
  description?: string;
  // short hand of cluster
  shortHand?: string;
}

/**
 * Ref to Melody Cluster based on base song - this is used to store in the song list (so we don't repeat store the melody cluster in every song)
 */
export interface MelodyClusterRef {
  // the base song slug of the cluster
  baseSong: string;
  // the current song that references to this object (includes the note about it when referencing the cluster)
  node: MelodyClusterSong
}